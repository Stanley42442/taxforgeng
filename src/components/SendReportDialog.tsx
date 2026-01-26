import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Loader2, UserPlus, FileText } from 'lucide-react';
import logger from '@/lib/logger';

interface SavedRecipient {
  id: string;
  email: string;
  name: string | null;
  type: string;
  is_default: boolean;
}

interface SendReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'tax-calculation' | 'business-report' | 'expenses' | 'invoice' | 'general';
  reportTitle: string;
  attachmentData: string; // Base64 encoded PDF
  attachmentName: string;
}

export const SendReportDialog: React.FC<SendReportDialogProps> = ({
  isOpen,
  onClose,
  reportType,
  reportTitle,
  attachmentData,
  attachmentName,
}) => {
  const { user } = useAuth();
  const { canEmailReports } = useSubscription();
  const { toast } = useToast();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [saveRecipient, setSaveRecipient] = useState(false);
  const [recipientType, setRecipientType] = useState<'accountant' | 'tax_office' | 'other'>('other');
  const [sending, setSending] = useState(false);
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');

  // Fetch saved recipients
  useEffect(() => {
    const fetchRecipients = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('email_recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (data) {
        setSavedRecipients(data as SavedRecipient[]);
        // Auto-select default recipient
        const defaultRecipient = data.find(r => r.is_default);
        if (defaultRecipient) {
          setSelectedRecipientId(defaultRecipient.id);
          setRecipientEmail(defaultRecipient.email);
          setRecipientName(defaultRecipient.name || '');
        }
      }
    };

    if (isOpen) {
      fetchRecipients();
    }
  }, [isOpen, user]);

  const handleRecipientSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    if (recipientId === 'new') {
      setRecipientEmail('');
      setRecipientName('');
    } else {
      const recipient = savedRecipients.find(r => r.id === recipientId);
      if (recipient) {
        setRecipientEmail(recipient.email);
        setRecipientName(recipient.name || '');
      }
    }
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!canEmailReports()) {
      toast({
        title: 'Upgrade Required',
        description: 'Email reports are available on Basic tier and above.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      // Save recipient if requested
      if (saveRecipient && user && selectedRecipientId === 'new') {
        await supabase.from('email_recipients').insert({
          user_id: user.id,
          email: recipientEmail,
          name: recipientName || null,
          type: recipientType,
        });
      }

      // Send email
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          recipientEmail,
          recipientName: recipientName || undefined,
          senderName: user?.user_metadata?.full_name || user?.email || 'TaxForge User',
          senderEmail: user?.email,
          reportType,
          reportTitle,
          attachmentData,
          attachmentName,
          message: message || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: 'Report Sent!',
        description: `Successfully sent to ${recipientEmail}`,
      });

      onClose();
      // Reset form
      setMessage('');
      setSaveRecipient(false);
    } catch (error) {
      logger.error('Error sending report:', error);
      toast({
        title: 'Failed to Send',
        description: 'There was an error sending the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Report via Email
          </DialogTitle>
          <DialogDescription>
            Send "{reportTitle}" directly to your accountant or tax office.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Saved Recipients */}
          {savedRecipients.length > 0 && (
            <div className="space-y-2">
              <Label>Select Recipient</Label>
              <Select value={selectedRecipientId} onValueChange={handleRecipientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a saved recipient or add new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add New Recipient
                    </span>
                  </SelectItem>
                  {savedRecipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {recipient.name || recipient.email}
                        {recipient.is_default && (
                          <span className="text-xs text-muted-foreground">(default)</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="accountant@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Recipient Name (optional)</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Please find attached my tax calculation report for review..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Save Recipient Checkbox */}
          {selectedRecipientId === 'new' && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="save"
                checked={saveRecipient}
                onCheckedChange={(checked) => setSaveRecipient(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="save" className="cursor-pointer">
                  Save this recipient for future use
                </Label>
                {saveRecipient && (
                  <Select value={recipientType} onValueChange={(v) => setRecipientType(v as typeof recipientType)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="tax_office">Tax Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Attachment Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachmentName}</p>
              <p className="text-xs text-muted-foreground">PDF Document</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !recipientEmail}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendReportDialog;
