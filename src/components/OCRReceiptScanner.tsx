import { useState, useRef } from "react";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Camera, Upload, Loader2, Sparkles, CheckCircle2, AlertCircle, Brain, FileText } from "lucide-react";
import { createWorker, type Worker } from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyInput } from "@/components/ui/currency-input";

interface ParsedReceipt {
  amount: number | null;
  description: string;
  date: string;
  category: string;
  confidence: number;
  isDeductible?: boolean;
  taxNote?: string;
}

interface OCRReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceiptParsed: (data: { amount: number; description: string; date: string; category: string; isDeductible?: boolean }) => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'income', label: 'Income' },
  { value: 'rent', label: 'Rent & Office' },
  { value: 'transport', label: 'Transport & Travel' },
  { value: 'marketing', label: 'Marketing & Ads' },
  { value: 'salary', label: 'Salaries & Wages' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'supplies', label: 'Supplies & Equipment' },
  { value: 'other', label: 'Other Expenses' },
];

// Keywords for category detection (fallback)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  transport: ['uber', 'bolt', 'fuel', 'petrol', 'diesel', 'taxi', 'bus', 'flight', 'airline', 'car', 'transport'],
  rent: ['rent', 'lease', 'office', 'workspace', 'coworking', 'electricity', 'nepa', 'phcn'],
  utilities: ['mtn', 'airtel', 'glo', '9mobile', 'internet', 'data', 'wifi', 'phone', 'electricity', 'water', 'dstv', 'gotv'],
  marketing: ['google', 'facebook', 'meta', 'ads', 'advertisement', 'marketing', 'promotion', 'campaign'],
  supplies: ['laptop', 'computer', 'printer', 'stationery', 'equipment', 'furniture', 'chair', 'desk'],
  salary: ['salary', 'wage', 'payroll', 'staff', 'employee'],
  income: ['payment', 'received', 'credit', 'deposit', 'income', 'revenue'],
};

export const OCRReceiptScanner = ({ open, onOpenChange, onReceiptParsed }: OCRReceiptScannerProps) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [editableData, setEditableData] = useState({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    isDeductible: true,
  });
  const [rawText, setRawText] = useState('');
  const [useAI, setUseAI] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const parseReceiptTextLocal = (text: string): ParsedReceipt => {
    // Extract amount (look for ₦, NGN, or numbers after "total", "amount")
    const amountPatterns = [
      /(?:₦|NGN|N)\s*([0-9,]+(?:\.[0-9]{2})?)/gi,
      /(?:total|amount|sum|price)[\s:]*(?:₦|NGN|N)?\s*([0-9,]+(?:\.[0-9]{2})?)/gi,
      /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)\s*(?:naira|NGN)?/gi,
    ];

    let amount: number | null = null;
    for (const pattern of amountPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const amounts = matches.map(m => parseFloat(m[1].replace(/,/g, '')));
        amount = Math.max(...amounts);
        break;
      }
    }

    // Extract date
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/gi,
    ];

    let date = new Date().toISOString().split('T')[0];
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsed = new Date(match[0]);
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString().split('T')[0];
            break;
          }
        } catch {
          // Keep default date
        }
      }
    }

    // Detect category based on keywords
    const lowerText = text.toLowerCase();
    let category = 'other';
    let maxMatches = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => lowerText.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat;
      }
    }

    // Extract description (first meaningful line or vendor name)
    const lines = text.split('\n').filter(l => l.trim().length > 3);
    const description = lines[0]?.trim().substring(0, 100) || 'Receipt scan';

    // Calculate confidence based on what we found
    let confidence = 0;
    if (amount !== null) confidence += 40;
    if (category !== 'other') confidence += 30;
    if (date !== new Date().toISOString().split('T')[0]) confidence += 20;
    if (description.length > 5) confidence += 10;

    return { amount, description, date, category, confidence };
  };

  const categorizeWithAI = async (text: string): Promise<ParsedReceipt | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('categorize-expense', {
        body: { receiptText: text },
      });

      if (error) throw error;

      // Merge AI results with local parsing for date (AI doesn't always get dates right)
      const localParsed = parseReceiptTextLocal(text);
      
      return {
        amount: data.amount ?? localParsed.amount,
        description: data.description || localParsed.description,
        date: localParsed.date, // Keep local date parsing
        category: data.category || localParsed.category,
        confidence: data.confidence || 80,
        isDeductible: data.isDeductible ?? true,
        taxNote: data.taxNote,
      };
    } catch (error) {
      logger.error('AI categorization failed:', error);
      return null;
    }
  };

  const processImage = async (imageData: string) => {
    setProcessing(true);
    setProgress(0);
    setProgressText('Initializing OCR...');

    try {
      // Create Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 70)); // OCR is 70% of progress
            setProgressText('Reading receipt...');
          }
        },
      });

      workerRef.current = worker;
      setProgressText('Processing image...');

      const { data: { text } } = await worker.recognize(imageData);
      setRawText(text);

      setProgress(75);
      setProgressText('Analyzing receipt...');

      let parsed: ParsedReceipt;
      
      if (useAI) {
        setProgressText('AI categorizing...');
        const aiResult = await categorizeWithAI(text);
        parsed = aiResult || parseReceiptTextLocal(text);
      } else {
        parsed = parseReceiptTextLocal(text);
      }
      
      setParsedData(parsed);

      setEditableData({
        amount: parsed.amount || 0,
        description: parsed.description,
        date: parsed.date,
        category: parsed.category,
        isDeductible: parsed.isDeductible ?? true,
      });

      await worker.terminate();
      workerRef.current = null;

      setProgress(100);

      if (parsed.confidence > 50) {
        toast.success(useAI ? 'Receipt analyzed with AI!' : 'Receipt scanned successfully!');
      } else {
        toast.info('Receipt scanned - please verify the details');
      }
    } catch (error) {
      logger.error('OCR Error:', error);
      toast.error('Failed to process receipt');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const amount = editableData.amount;
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    onReceiptParsed({
      amount,
      description: editableData.description || 'Receipt scan',
      date: editableData.date,
      category: editableData.category,
      isDeductible: editableData.isDeductible,
    });

    // Reset state
    setParsedData(null);
    setEditableData({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      isDeductible: true,
    });
    setRawText('');
    onOpenChange(false);
    toast.success('Entry added from receipt!');
  };

  const handleClose = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setParsedData(null);
    setProcessing(false);
    setProgress(0);
    setRawText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-frosted">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scan Receipt
          </DialogTitle>
          <DialogDescription>
            Upload a receipt image to automatically extract expense details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Toggle */}
          {!parsedData && !processing && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">AI Categorization</p>
                  <p className="text-xs text-muted-foreground">
                    Auto-detect expense category & tax deductibility
                  </p>
                </div>
              </div>
              <Switch checked={useAI} onCheckedChange={setUseAI} />
            </div>
          )}

          {!parsedData && !processing && (
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Click to upload or take photo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPEG, PNG, HEIC
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {processing && (
            <div className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{progressText}</p>
            </div>
          )}

          {parsedData && !processing && (
            <div className="space-y-4">
              {/* Confidence indicator */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                parsedData.confidence > 60 
                  ? 'bg-success/10 text-success' 
                  : parsedData.confidence > 30 
                  ? 'bg-warning/10 text-warning'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {parsedData.confidence > 60 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {parsedData.confidence > 60 
                    ? 'High confidence match'
                    : parsedData.confidence > 30
                    ? 'Please verify details'
                    : 'Low confidence - check carefully'}
                </span>
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Amount</Label>
                  <CurrencyInput
                    value={editableData.amount}
                    onChange={(val) => setEditableData(prev => ({ ...prev, amount: val }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label className="text-sm">Description</Label>
                  <Input
                    value={editableData.description}
                    onChange={(e) => setEditableData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Office supplies from store"
                  />
                </div>

                <div>
                  <Label className="text-sm">Date</Label>
                  <Input
                    type="date"
                    value={editableData.date}
                    onChange={(e) => setEditableData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={editableData.category}
                    onValueChange={(value) => setEditableData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tax Deductibility */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm">Tax Deductible</span>
                  </div>
                  <Switch
                    checked={editableData.isDeductible}
                    onCheckedChange={(checked) => setEditableData(prev => ({ ...prev, isDeductible: checked }))}
                  />
                </div>

                {/* AI Tax Note */}
                {parsedData.taxNote && (
                  <div className="p-2 rounded-lg bg-info/10 text-info text-xs">
                    <span className="font-medium">Tax Tip:</span> {parsedData.taxNote}
                  </div>
                )}
              </div>

              {/* Raw text preview */}
              {rawText && (
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                    View extracted text
                  </summary>
                  <pre className="mt-2 p-2 bg-secondary/50 rounded text-xs max-h-32 overflow-auto whitespace-pre-wrap">
                    {rawText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {parsedData && (
            <>
              <Button variant="outline" onClick={() => {
                setParsedData(null);
                setRawText('');
              }}>
                Scan Another
              </Button>
              <Button variant="glow" onClick={handleConfirm}>
                <Sparkles className="h-4 w-4" />
                Add Entry
              </Button>
            </>
          )}
          {!parsedData && !processing && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
