import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Shield,
  Clock
} from 'lucide-react';
import { 
  initiatePayment, 
  formatAmount, 
  generateOrderId, 
  PaymentOptions, 
  PaymentStatus,
  type PaymentResponse 
} from '@/lib/razorpay';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cartItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  onPaymentSuccess: (orderId: string, paymentId: string) => void;
  onPaymentFailure: (error: string) => void;
}

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  total, 
  cartItems, 
  onPaymentSuccess, 
  onPaymentFailure 
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handlePayment = async () => {
    if (paymentMethod === 'wallet') {
      // Handle wallet payment
      toast.success('Payment processed via wallet!');
      onPaymentSuccess(generateOrderId(), 'wallet_payment');
      onClose();
      return;
    }

    // Handle Razorpay payment
    setIsProcessing(true);
    
    try {
      const orderId = generateOrderId();
      const paymentOptions: PaymentOptions = {
        amount: total,
        currency: 'INR',
        orderId,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        description: `Canteen Order - ${cartItems.length} items`,
        notes: {
          order_type: 'canteen',
          items_count: cartItems.length.toString(),
          timestamp: new Date().toISOString()
        }
      };

      initiatePayment(
        paymentOptions,
        (response: PaymentResponse) => {
          setIsProcessing(false);
          toast.success('Payment successful!');
          onPaymentSuccess(orderId, response.razorpay_payment_id);
          onClose();
        },
        (error: any) => {
          setIsProcessing(false);
          console.error('Payment failed:', error);
          onPaymentFailure(error.description || 'Payment failed');
        }
      );
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment error:', error);
      onPaymentFailure('Payment initialization failed');
    }
  };

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Credit/Debit Cards, UPI, Net Banking',
      icon: CreditCard,
      popular: true
    },
    {
      id: 'wallet',
      name: 'Campus Wallet',
      description: 'Use your campus wallet balance',
      icon: Wallet,
      popular: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Secure payment for your canteen order
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Order Summary</h3>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatAmount(item.price * item.quantity)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatAmount(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Method</h3>
            
            {/* Payment Method Selection */}
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      paymentMethod === method.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setPaymentMethod(method.id as 'razorpay' | 'wallet')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{method.name}</p>
                            {method.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === method.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Customer Details (for Razorpay) */}
            {paymentMethod === 'razorpay' && (
              <div className="space-y-3">
                <h4 className="font-medium">Customer Details</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isProcessing || (paymentMethod === 'razorpay' && (!customerDetails.name || !customerDetails.email))}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {formatAmount(total)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
