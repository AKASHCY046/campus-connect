// Phone number authentication and hash generation for canteen orders
import { toast } from 'sonner';

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// Generate unique hash for order authentication
export const generateOrderHash = (orderId: string, phoneNumber: string, timestamp: string): string => {
  // Create a unique string combining order details
  const hashString = `${orderId}_${phoneNumber}_${timestamp}`;
  
  // Simple hash function (in production, use crypto library)
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and add some randomness
  const positiveHash = Math.abs(hash).toString(16);
  const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  return `${positiveHash.toUpperCase()}_${randomSuffix}`;
};

// Generate order verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simulate phone number verification (SMS OTP)
export const sendVerificationCode = async (phoneNumber: string): Promise<boolean> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, this would send SMS via service like Twilio
    const verificationCode = generateVerificationCode();
    
    // Store verification code temporarily (in production, use secure storage)
    sessionStorage.setItem('verification_code', verificationCode);
    sessionStorage.setItem('verification_phone', phoneNumber);
    sessionStorage.setItem('verification_timestamp', Date.now().toString());
    
    console.log(`SMS sent to ${phoneNumber}: Your verification code is ${verificationCode}`);
    toast.success(`Verification code sent to ${formatPhoneNumber(phoneNumber)}`);
    
    return true;
  } catch (error) {
    console.error('Failed to send verification code:', error);
    toast.error('Failed to send verification code. Please try again.');
    return false;
  }
};

// Verify phone number with OTP
export const verifyPhoneNumber = (enteredCode: string, phoneNumber: string): boolean => {
  const storedCode = sessionStorage.getItem('verification_code');
  const storedPhone = sessionStorage.getItem('verification_phone');
  const storedTimestamp = sessionStorage.getItem('verification_timestamp');
  
  // Check if verification is still valid (5 minutes)
  const now = Date.now();
  const verificationTime = storedTimestamp ? parseInt(storedTimestamp) : 0;
  const isExpired = (now - verificationTime) > 5 * 60 * 1000; // 5 minutes
  
  if (isExpired) {
    toast.error('Verification code has expired. Please request a new one.');
    return false;
  }
  
  if (storedCode === enteredCode && storedPhone === phoneNumber) {
    // Clear verification data
    sessionStorage.removeItem('verification_code');
    sessionStorage.removeItem('verification_phone');
    sessionStorage.removeItem('verification_timestamp');
    
    toast.success('Phone number verified successfully!');
    return true;
  } else {
    toast.error('Invalid verification code. Please try again.');
    return false;
  }
};

// Generate order authentication hash
export const generateOrderAuthHash = (orderDetails: {
  orderId: string;
  phoneNumber: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  timestamp: string;
}): string => {
  const orderString = JSON.stringify({
    orderId: orderDetails.orderId,
    phone: orderDetails.phoneNumber,
    total: orderDetails.total,
    itemCount: orderDetails.items.length,
    timestamp: orderDetails.timestamp
  });
  
  // Create a more secure hash
  let hash = 0;
  for (let i = 0; i < orderString.length; i++) {
    const char = orderString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashString = Math.abs(hash).toString(16).toUpperCase();
  const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
  
  return `CANTEEN_${hashString}_${randomPart}`;
};

// Verify order hash
export const verifyOrderHash = (hash: string, orderId: string): boolean => {
  // In a real application, this would verify against stored hashes
  return hash.startsWith('CANTEEN_') && hash.length > 20;
};

// Phone number authentication interface
export interface PhoneAuthState {
  phoneNumber: string;
  isVerified: boolean;
  verificationCode: string;
  isCodeSent: boolean;
  isLoading: boolean;
}

// Default phone number for testing
export const DEFAULT_PHONE = '+91 9876543212';

// Order authentication interface
export interface OrderAuth {
  orderId: string;
  hash: string;
  phoneNumber: string;
  timestamp: string;
  verified: boolean;
}
