
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, consider any OTP valid except "000000"
      const valid = otp !== "000000";
      setIsOtpValid(valid);
      
      if (valid) {
        toast.success("OTP verified successfully");
        setStep("reset");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccessDialog(true);
    } catch (error) {
      toast.error("Failed to reset password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          We'll send a verification code to this email
        </p>
      </div>
      
      <Button type="submit" className="w-full mt-6" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Code"} 
        {!loading && <ArrowRight size={16} />}
      </Button>
      
      <p className="text-center text-sm mt-6">
        Remember your password?{" "}
        <Link to="/signin" className="text-primary font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </p>
        
        <div className="flex justify-center mb-2">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} index={index} className="w-12 h-12" />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        
        {isOtpValid === false && (
          <div className="flex items-center gap-2 text-destructive text-sm mt-2">
            <AlertTriangle size={16} />
            <span>Invalid verification code. Please try again.</span>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mt-4">
          Didn't receive a code?{" "}
          <button 
            type="button" 
            className="text-primary font-medium hover:underline"
            onClick={() => {
              toast.info("Resending code...");
              setTimeout(() => toast.success("New code sent successfully"), 1500);
            }}
          >
            Resend
          </button>
        </p>
      </div>
      
      <Button 
        className="w-full" 
        disabled={loading || otp.length !== 6}
        onClick={handleVerifyOTP}
      >
        {loading ? "Verifying..." : "Verify"}
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setStep("email");
          setOtp("");
          setIsOtpValid(null);
        }}
      >
        Back
      </Button>
    </div>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password
        </label>
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="w-full mt-6" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );

  return (
    <>
      <AuthLayout 
        title={
          step === "email" ? "Forgot Password" : 
          step === "otp" ? "Enter Verification Code" :
          "Reset Password"
        } 
        subtitle={
          step === "email" ? "No worries, we'll send you reset instructions" : 
          step === "otp" ? "Please enter the 6-digit code we sent to your email" :
          "Create a new secure password"
        }
      >
        {step === "email" && renderEmailStep()}
        {step === "otp" && renderOtpStep()}
        {step === "reset" && renderResetStep()}
      </AuthLayout>
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Password Reset Successful</DialogTitle>
            <DialogDescription>
              Your password has been reset successfully. You can now sign in with your new password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="rounded-full bg-primary/20 p-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                // Here you would redirect to the sign in page
                // navigate("/signin");
              }} 
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ForgotPassword;
