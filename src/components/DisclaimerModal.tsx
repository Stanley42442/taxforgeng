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
      <DialogContent 
        className="w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-2 space-y-2">
          <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-warning/20">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
          </div>
          <DialogTitle className="text-center text-base sm:text-lg">Important Disclaimer</DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            Please read and acknowledge before using TaxForge NG
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <div className="space-y-2">
            <div className="flex gap-2 p-2 rounded-lg bg-muted">
              <Scale className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs min-w-0">
                <p className="font-medium text-foreground">Educational Purposes Only</p>
                <p className="text-muted-foreground leading-tight">
                  This app provides tax estimates based on the Nigeria Tax Act 2025 for educational and planning purposes.
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-2 rounded-lg bg-muted">
              <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs min-w-0">
                <p className="font-medium text-foreground">Not Official Tax Advice</p>
                <p className="text-muted-foreground leading-tight">
                  Always consult FIRS, your state IRS, or certified tax professionals for official guidance.
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs min-w-0">
                <p className="font-medium text-foreground">No Liability</p>
                <p className="text-muted-foreground leading-tight">
                  TaxForge NG is not liable for any errors, omissions, or decisions made based on this platform.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <Checkbox 
              id="accept" 
              checked={accepted} 
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="mt-0.5 h-4 w-4"
            />
            <Label htmlFor="accept" className="text-xs leading-relaxed cursor-pointer">
              I understand this is not official tax advice. I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline" onClick={() => setOpen(false)}>
                Terms of Service & Privacy Policy
              </Link>.
            </Label>
          </div>
        </div>

        <Button 
          variant="hero" 
          className="w-full mt-2 h-10 text-sm" 
          onClick={handleAccept}
          disabled={!accepted}
        >
          I Understand, Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
};
