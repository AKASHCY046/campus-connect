import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Shield, 
  CheckCircle2, 
  Clock,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { 
  validatePhoneNumber, 
  formatPhoneNumber, 
  sendVerificationCode, 
  verifyPhoneNumber,
  DEFAULT_PHONE 
} from '@/lib/phoneAuth';
import { toast } from 'sonner';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (phoneNumber: string) => void;
  total: number;
  cartItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const PhoneVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerificationSuccess,
  total,
  cartItems 
}: PhoneVerificationModalProps) => {
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(DEFAULT_PHONE);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Indian phone number');
      return;
    }

    setIsLoading(true);
    const success = await sendVerificationCode(phoneNumber);
    setIsLoading(false);

    if (success) {
      setIsCodeSent(true);
      setStep('verification');
      setCountdown(60); // 60 seconds countdown
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    const isValid = verifyPhoneNumber(verificationCode, phoneNumber);
    setIsLoading(false);

    if (isValid) {
      onVerificationSuccess(phoneNumber);
      onClose();
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    const success = await sendVerificationCode(phoneNumber);
    setIsLoading(false);

    if (success) {
      setCountdown(60);
      toast.success('Verification code sent again');
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setVerificationCode('');
    setIsCodeSent(false);
    setCountdown(0);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number Verification
          </DialogTitle>
          <DialogDescription>
            Verify your phone number to complete the order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatAmount(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatAmount(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number Step */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543212"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 10-digit Indian mobile number
                </p>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Secure Verification</p>
                      <p className="text-blue-700 mt-1">
                        We'll send a 6-digit verification code to your phone number
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || !validatePhoneNumber(phoneNumber)}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Send Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Verification Code Step */}
          {step === 'verification' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code sent to {formatPhoneNumber(phoneNumber)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={handleBackToPhone}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Number
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isLoading || countdown > 0}
                  className="flex items-center gap-1"
                >
                  {countdown > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800">Code Sent</p>
                      <p className="text-green-700 mt-1">
                        Check your messages for the verification code
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify & Pay
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
