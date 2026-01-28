import { useState } from "react";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Phone, CheckCircle2, Send, Loader2 } from "lucide-react";

interface WhatsAppVerificationProps {
  currentNumber?: string;
  isVerified?: boolean;
  onVerified?: () => void;
}

export const WhatsAppVerification = ({ 
  currentNumber, 
  isVerified = false,
  onVerified 
}: WhatsAppVerificationProps) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(currentNumber || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(isVerified);

  const formatNigerianNumber = (number: string) => {
    // Remove all non-digits
    let cleaned = number.replace(/\D/g, "");
    
    // Handle Nigerian numbers
    if (cleaned.startsWith("0")) {
      cleaned = "234" + cleaned.substring(1);
    } else if (!cleaned.startsWith("234")) {
      cleaned = "234" + cleaned;
    }
    
    return cleaned;
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const formattedNumber = formatNigerianNumber(phoneNumber);
      
      // Save the number first
      await supabase
        .from("profiles")
        .update({ whatsapp_number: formattedNumber })
        .eq("id", user?.id);

      // In production, this would send an actual OTP via the edge function
      // For demo, we'll simulate it
      toast.success("Verification code sent to WhatsApp!");
      toast.info("Demo mode: Use code 123456");
      setStep("verify");
    } catch (error) {
      logger.error("Error sending verification:", error);
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      // Demo verification - in production, verify against actual OTP
      if (otp === "123456") {
        await supabase
          .from("profiles")
          .update({ 
            whatsapp_verified: true,
            whatsapp_number: formatNigerianNumber(phoneNumber)
          })
          .eq("id", user?.id);

        setVerified(true);
        toast.success("WhatsApp verified successfully!");
        onVerified?.();
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error) {
      logger.error("Error verifying:", error);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <Card className="glass-frosted">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">WhatsApp Verified</p>
              <p className="text-sm text-muted-foreground">
                {phoneNumber || currentNumber || "Number connected"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setVerified(false);
              setStep("phone");
            }}
          >
            Change Number
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-frosted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="h-5 w-5 text-success" />
          WhatsApp Notifications
        </CardTitle>
        <CardDescription>
          Receive tax reminders via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nigerian Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-secondary rounded-l-md border border-r-0 border-border">
                  <span className="text-sm text-muted-foreground">+234</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="8012345678"
                  value={phoneNumber.replace(/^234/, "").replace(/^0/, "")}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send a verification code to this number
              </p>
            </div>
            <Button 
              onClick={sendVerificationCode} 
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter the code sent to your WhatsApp
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setStep("phone")}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={verifyCode} 
                disabled={loading}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Verify
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};