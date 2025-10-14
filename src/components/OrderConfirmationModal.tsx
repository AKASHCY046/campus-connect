import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  QrCode,
  Phone,
  Hash,
  Clock,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatAmount, generateOrderAuthHash } from '@/lib/razorpay';
import { toast } from 'sonner';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    phoneNumber: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    timestamp: string;
    hash: string;
  };
}

export const OrderConfirmationModal = ({ 
  isOpen, 
  onClose, 
  orderDetails 
}: OrderConfirmationModalProps) => {
  const [showHash, setShowHash] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadOrderDetails = () => {
    const orderText = `
CAMPUS CONNECT - ORDER CONFIRMATION
=====================================

Order ID: ${orderDetails.orderId}
Phone: ${orderDetails.phoneNumber}
Date: ${new Date(orderDetails.timestamp).toLocaleString()}
Authentication Hash: ${orderDetails.hash}

ITEMS:
${orderDetails.items.map(item => 
  `- ${item.name} x${item.quantity} = ${formatAmount(item.price * item.quantity)}`
).join('\n')}

TOTAL: ${formatAmount(orderDetails.total)}

=====================================
Keep this hash for order verification!
    `;

    const blob = new Blob([orderText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_${orderDetails.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Order details downloaded!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Order Confirmed!
          </DialogTitle>
          <DialogDescription>
            Your order has been placed successfully. Keep your authentication hash safe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Payment Successful!</h3>
                  <p className="text-green-700 text-sm">
                    Your order has been confirmed and will be prepared shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Order ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{orderDetails.orderId}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(orderDetails.orderId, 'Order ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm">{orderDetails.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">
                    {new Date(orderDetails.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatAmount(orderDetails.total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Order Hash:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowHash(!showHash)}
                    >
                      {showHash ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                    {showHash ? orderDetails.hash : '••••••••••••••••••••••••••••••••'}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(orderDetails.hash, 'Authentication Hash')}
                    className="w-full mt-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Hash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatAmount(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatAmount(orderDetails.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Keep your authentication hash safe for order verification</li>
                    <li>• Show this hash when collecting your order</li>
                    <li>• You will receive SMS confirmation shortly</li>
                    <li>• Contact canteen if you have any issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={downloadOrderDetails}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Details
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
