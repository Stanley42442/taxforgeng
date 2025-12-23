import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Shield, Scale, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal = ({ onAccept }: DisclaimerModalProps) => {
  const [open, setOpen] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem('taxforge_disclaimer_accepted', 'true');
      setOpen(false);
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/20">
            <AlertTriangle className="h-7 w-7 text-warning" />
          </div>
          <DialogTitle className="text-center text-xl">Important Disclaimer</DialogTitle>
          <DialogDescription className="text-center">
            Please read and acknowledge before using TaxForge NG
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex gap-3 p-3 rounded-lg bg-muted">
              <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Educational Purposes Only</p>
                <p className="text-muted-foreground">
                  This app provides tax estimates based on the Nigeria Tax Act 2025. 
                  All calculations are for educational and planning purposes only.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Not Official Tax Advice</p>
                <p className="text-muted-foreground">
                  Always consult FIRS, your state IRS, or certified tax professionals 
                  for official guidance before filing or making financial decisions.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">No Liability</p>
                <p className="text-muted-foreground">
                  TaxForge NG and its operators are not liable for any errors, 
                  omissions, penalties, or decisions made based on this platform.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox 
              id="accept" 
              checked={accepted} 
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label htmlFor="accept" className="text-sm leading-relaxed cursor-pointer">
              I understand and acknowledge that this is not official tax advice. 
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline" onClick={() => setOpen(false)}>
                Terms of Service & Privacy Policy
              </Link>.
            </Label>
          </div>
        </div>

        <Button 
          variant="hero" 
          className="w-full" 
          onClick={handleAccept}
          disabled={!accepted}
        >
          I Understand, Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
};
