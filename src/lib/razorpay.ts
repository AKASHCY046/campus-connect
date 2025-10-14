// Razorpay payment integration utilities
// Note: For frontend, we use the Razorpay checkout script directly
// No need to import the server-side Razorpay SDK

// Razorpay configuration
export const razorpayConfig = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  currency: 'INR',
  name: 'Campus Connect',
  description: 'Canteen Pre-Order Payment',
  image: '/favicon.ico',
  theme: {
    color: '#0ea5e9'
  }
};

// Payment options interface
export interface PaymentOptions {
  amount: number;
  currency?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  notes?: Record<string, string>;
}

// Note: Order creation should be handled on the backend for security
// For frontend demo, we'll generate a mock order ID
export const createRazorpayOrder = async (options: PaymentOptions) => {
  // In a real application, this should call your backend API
  // For demo purposes, we'll return a mock order
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: options.amount * 100,
    currency: options.currency || 'INR',
    receipt: `receipt_${Date.now()}`,
    status: 'created'
  };
};

// Payment handler for frontend integration
export const initiatePayment = (options: PaymentOptions, onSuccess: (response: any) => void, onError: (error: any) => void) => {
  const paymentOptions = {
    key: razorpayConfig.key_id,
    amount: options.amount * 100, // Convert to paise
    currency: options.currency || 'INR',
    name: razorpayConfig.name,
    description: options.description || razorpayConfig.description,
    image: razorpayConfig.image,
    order_id: options.orderId,
    handler: onSuccess,
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerPhone || ''
    },
    notes: options.notes || {},
    theme: razorpayConfig.theme,
    modal: {
      ondismiss: () => {
        console.log('Payment modal dismissed');
      }
    }
  };

  const rzp = new (window as any).Razorpay(paymentOptions);
  rzp.on('payment.failed', onError);
  rzp.open();
};

// Direct payment initiation with QR code and payment options
export const initiateDirectPayment = (
  amount: number,
  customerDetails: { name: string; email: string; phone: string },
  cartItems: Array<{ name: string; quantity: number; price: number }>,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  const orderId = generateOrderId();
  const description = `Canteen Order - ${cartItems.length} items`;
  
  const paymentOptions = {
    key: razorpayConfig.key_id,
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    name: razorpayConfig.name,
    description: description,
    image: razorpayConfig.image,
    order_id: orderId,
    handler: (response: any) => {
      console.log('Payment successful:', response);
      onSuccess({
        ...response,
        orderId: orderId,
        customerDetails: customerDetails,
        cartItems: cartItems,
        total: amount
      });
    },
    prefill: {
      name: customerDetails.name,
      email: customerDetails.email,
      contact: customerDetails.phone
    },
    notes: {
      order_type: 'canteen',
      items_count: cartItems.length.toString(),
      timestamp: new Date().toISOString(),
      customer_name: customerDetails.name
    },
    theme: {
      color: '#0ea5e9'
    },
    modal: {
      ondismiss: () => {
        console.log('Payment modal dismissed by user');
      }
    }
  };

  // Check if Razorpay is loaded
  if (typeof (window as any).Razorpay === 'undefined') {
    onError({ description: 'Razorpay SDK not loaded. Please refresh the page.' });
    return;
  }

  try {
    const rzp = new (window as any).Razorpay(paymentOptions);
    
    // Add event listeners
    rzp.on('payment.failed', (error: any) => {
      console.error('Payment failed:', error);
      onError(error);
    });

    // Open Razorpay checkout
    rzp.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    onError({ description: 'Failed to initialize payment. Please try again.' });
  }
};

// Note: Payment verification should be handled on the backend for security
// This is a placeholder function for demo purposes
export const verifyPayment = (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => {
  // In a real application, this should call your backend API to verify the payment
  // For demo purposes, we'll return true
  console.log('Payment verification should be handled on the backend');
  return true;
};

// Format amount for display
export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Generate order ID
export const generateOrderId = () => {
  return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Payment response interface
export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Order interface
export interface Order {
  id: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: PaymentStatus;
  createdAt: string;
  paymentId?: string;
}
