import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Scan, Loader2, Upload, Check, X } from "lucide-react";
import { toast } from "sonner";

interface OCRResult {
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface OCRReceiptScannerProps {
  onScanComplete: (result: OCRResult) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

// AI-based category detection from text
const detectCategory = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/uber|bolt|taxi|transport|fuel|petrol|diesel|travel|flight|airline/.test(lowerText)) {
    return 'transport';
  }
  if (/rent|office|workspace|building|lease/.test(lowerText)) {
    return 'rent';
  }
  if (/google ads|facebook|instagram|marketing|advertising|promotion/.test(lowerText)) {
    return 'marketing';
  }
  if (/salary|wage|payroll|staff|employee/.test(lowerText)) {
    return 'salary';
  }
  if (/electricity|nepa|phcn|water|internet|data|mtn|glo|airtel/.test(lowerText)) {
    return 'utilities';
  }
  if (/equipment|laptop|computer|phone|printer|supplies|stationery/.test(lowerText)) {
    return 'supplies';
  }
  if (/payment|received|income|credit|deposit|transfer|salary/.test(lowerText)) {
    return 'income';
  }
  
  return 'other';
};

// Extract amount from text
const extractAmount = (text: string): number => {
  // Match various Nigerian currency patterns
  const patterns = [
    /₦\s*([\d,]+(?:\.\d{2})?)/g,
    /NGN\s*([\d,]+(?:\.\d{2})?)/gi,
    /N\s*([\d,]+(?:\.\d{2})?)/g,
    /total[:\s]*([\d,]+(?:\.\d{2})?)/gi,
    /amount[:\s]*([\d,]+(?:\.\d{2})?)/gi,
    /([\d,]+(?:\.\d{2})?)\s*naira/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      // Get the largest amount found (likely the total)
      const amounts = matches.map(m => parseFloat(m[1].replace(/,/g, '')));
      return Math.max(...amounts);
    }
  }
  
  // Fallback: look for any large number
  const numbers = text.match(/\d{3,}/g);
  if (numbers) {
    const amounts = numbers.map(n => parseInt(n));
    return Math.max(...amounts.filter(a => a < 100000000)); // Filter unrealistic amounts
  }
  
  return 0;
};

// Extract date from text
const extractDate = (text: string): string => {
  const today = new Date().toISOString().split('T')[0];
  
  // Try various date patterns
  const patterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[0];
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      } catch {
        continue;
      }
    }
  }
  
  return today;
};

// Extract description/vendor from text
const extractDescription = (text: string): string => {
  const lines = text.split('\n').filter(l => l.trim().length > 3);
  
  // Look for vendor name patterns
  const vendorPatterns = [
    /from[:\s]+(.+)/i,
    /vendor[:\s]+(.+)/i,
    /merchant[:\s]+(.+)/i,
    /(.+)\s+receipt/i,
  ];
  
  for (const pattern of vendorPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 2) {
      return match[1].trim().slice(0, 100);
    }
  }
  
  // Use first meaningful line as description
  for (const line of lines) {
    const cleaned = line.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (cleaned.length > 5 && !/^\d+$/.test(cleaned)) {
      return cleaned.slice(0, 100);
    }
  }
  
  return 'Scanned Receipt';
};

export const OCRReceiptScanner = ({ onScanComplete, open, onOpenChange }: OCRReceiptScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedText, setScannedText] = useState('');
  const [parsedResult, setParsedResult] = useState<OCRResult | null>(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedText('');
    setParsedResult(null);

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      setScannedText(data.text);

      // Parse the OCR result
      const result: OCRResult = {
        description: extractDescription(data.text),
        amount: extractAmount(data.text),
        category: detectCategory(data.text),
        date: extractDate(data.text),
      };

      setParsedResult(result);
      setEditMode(true);
      toast.success('Receipt scanned successfully!');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to scan receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      processImage(file);
    }
  };

  const handleConfirm = () => {
    if (parsedResult) {
      onScanComplete(parsedResult);
      onOpenChange(false);
      resetState();
      toast.success('Expense added from receipt!');
    }
  };

  const resetState = () => {
    setScannedText('');
    setParsedResult(null);
    setEditMode(false);
    setScanProgress(0);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Scan Receipt (OCR)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isScanning && !editMode && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="p-6 rounded-full bg-primary/10">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                Take a photo or upload an image of your receipt
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="glow"
                  onClick={() => {
                    const input = fileInputRef.current;
                    if (input) {
                      input.setAttribute('capture', 'environment');
                      input.click();
                    }
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="w-full max-w-xs">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Scanning... {scanProgress}%
                </p>
              </div>
            </div>
          )}

          {editMode && parsedResult && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-success flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Receipt scanned! Review and edit if needed:
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Description</Label>
                  <Input
                    value={parsedResult.description}
                    onChange={(e) => setParsedResult({ ...parsedResult, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Amount (₦)</Label>
                  <Input
                    type="number"
                    value={parsedResult.amount || ''}
                    onChange={(e) => setParsedResult({ ...parsedResult, amount: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={parsedResult.category}
                    onValueChange={(value) => setParsedResult({ ...parsedResult, category: value })}
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

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={parsedResult.date}
                    onChange={(e) => setParsedResult({ ...parsedResult, date: e.target.value })}
                  />
                </div>
              </div>

              {scannedText && (
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                    View raw OCR text
                  </summary>
                  <pre className="mt-2 p-2 rounded bg-secondary/50 overflow-auto max-h-32 whitespace-pre-wrap">
                    {scannedText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {editMode && (
          <DialogFooter>
            <Button variant="outline" onClick={resetState}>
              <X className="h-4 w-4 mr-2" />
              Rescan
            </Button>
            <Button variant="glow" onClick={handleConfirm} disabled={!parsedResult?.amount}>
              <Check className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OCRReceiptScanner;
