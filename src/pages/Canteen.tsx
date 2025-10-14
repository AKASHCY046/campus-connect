import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UtensilsCrossed, 
  Clock, 
  Wallet,
  ShoppingCart,
  CheckCircle2,
  Flame,
  Leaf,
  Timer,
  Plus,
  Minus,
  X,
  CreditCard,
  Hash
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';
import { OrderConfirmationModal } from '@/components/OrderConfirmationModal';
import { formatAmount, generateOrderId, PaymentStatus } from '@/lib/razorpay';
import { generateOrderAuthHash } from '@/lib/phoneAuth';

export default function Canteen() {
  const { theme } = useTheme();
  const [cart, setCart] = useState<{[key: number]: {item: any, quantity: number}}>({});
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<Array<{
    id: string;
    items: Array<{name: string, quantity: number, price: number}>;
    total: number;
    status: PaymentStatus;
    createdAt: string;
    paymentId?: string;
  }>>([]);
  
  const menuItems = [
    { 
      id: 1,
      name: 'Masala Dosa', 
      price: 60, 
      category: 'breakfast',
      prepTime: 15,
      calories: 450,
      veg: true,
      popular: true,
      image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop'
    },
    { 
      id: 2,
      name: 'Paneer Butter Masala', 
      price: 120, 
      category: 'lunch',
      prepTime: 20,
      calories: 580,
      veg: true,
      popular: true,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop'
    },
    { 
      id: 3,
      name: 'Chicken Biryani', 
      price: 150, 
      category: 'lunch',
      prepTime: 25,
      calories: 720,
      veg: false,
      popular: true,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop'
    },
    { 
      id: 4,
      name: 'Veg Sandwich', 
      price: 40, 
      category: 'snacks',
      prepTime: 10,
      calories: 320,
      veg: true,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'
    },
    { 
      id: 5,
      name: 'Samosa (2 pcs)', 
      price: 30, 
      category: 'snacks',
      prepTime: 5,
      calories: 280,
      veg: true,
      popular: true,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop'
    },
    { 
      id: 6,
      name: 'Cold Coffee', 
      price: 50, 
      category: 'beverages',
      prepTime: 5,
      calories: 180,
      veg: true,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
    },
  ];
  
  const activeOrders = [
    { tokenNo: 42, items: ['Masala Dosa', 'Coffee'], status: 'preparing', time: '5 mins' },
    { tokenNo: 41, items: ['Biryani', 'Raita'], status: 'ready', time: 'Ready' },
  ];
  
  const addToCart = (item: any) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[item.id]) {
        newCart[item.id] = {
          ...newCart[item.id],
          quantity: newCart[item.id].quantity + 1
        };
        toast.success(`${item.name} quantity increased to ${newCart[item.id].quantity}`);
      } else {
        newCart[item.id] = {
          item: item,
          quantity: 1
        };
        toast.success(`${item.name} added to cart`);
      }
      return newCart;
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[itemId]) {
        delete newCart[itemId];
        toast.success('Item removed from cart');
      }
      return newCart;
    });
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[itemId]) {
        newCart[itemId] = {
          ...newCart[itemId],
          quantity: newQuantity
        };
      }
      return newCart;
    });
  };
  
  const placeOrder = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowPhoneVerification(true);
  };

  const handlePhoneVerificationSuccess = (phoneNumber: string) => {
    const cartItems = Object.values(cart);
    const orderItems = cartItems.map(cartItem => ({
      name: cartItem.item.name,
      quantity: cartItem.quantity,
      price: cartItem.item.price
    }));

    // Generate order details
    const orderId = generateOrderId();
    const timestamp = new Date().toISOString();
    const orderHash = generateOrderAuthHash({
      orderId,
      phoneNumber,
      total,
      items: orderItems,
      timestamp
    });

    // Create order confirmation
    const orderDetails = {
      orderId,
      phoneNumber,
      total,
      items: orderItems,
      timestamp,
      hash: orderHash
    };

    // Add to order history
    const newOrder = {
      id: orderId,
      items: orderItems,
      total: total,
      status: PaymentStatus.SUCCESS,
      createdAt: timestamp,
      paymentId: 'phone_verified',
      phoneNumber,
      hash: orderHash
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    setCart({});
    setConfirmedOrder(orderDetails);
    setShowOrderConfirmation(true);
    
    toast.success(`Order confirmed! Hash: ${orderHash.slice(-8)}`);
  };

  const handlePaymentSuccess = (orderId: string, paymentId: string) => {
    // This method is kept for compatibility but not used in direct flow
    const cartItems = Object.values(cart);
    const orderItems = cartItems.map(cartItem => ({
      name: cartItem.item.name,
      quantity: cartItem.quantity,
      price: cartItem.item.price
    }));

    const newOrder = {
      id: orderId,
      items: orderItems,
      total: total,
      status: PaymentStatus.SUCCESS,
      createdAt: new Date().toISOString(),
      paymentId: paymentId
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    setCart({});
    
    toast.success(`Order placed successfully! Order ID: ${orderId}`);
  };

  const handlePaymentFailure = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };
  
  const total = Object.values(cart).reduce((sum, cartItem) => 
    sum + (cartItem.item.price * cartItem.quantity), 0
  );
  
  const cartItemCount = Object.values(cart).reduce((sum, cartItem) => 
    sum + cartItem.quantity, 0
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
            Canteen Pre-Order
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">Skip the queue, order ahead!</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <Wallet className="h-8 w-8 text-green-500 mb-2" />
          <p className="font-bold text-2xl">₹450</p>
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
        </Card>
        
        <Card className="p-6">
          <Clock className="h-8 w-8 text-blue-500 mb-2" />
          <p className="font-bold text-2xl">{activeOrders.length}</p>
          <p className="text-sm text-muted-foreground">Active Orders</p>
        </Card>
        
        <Card className="p-6">
          <UtensilsCrossed className="h-8 w-8 text-orange-500 mb-2" />
          <p className="font-bold text-2xl">{cartItemCount}</p>
          <p className="text-sm text-muted-foreground">Items in Cart</p>
        </Card>
        
        <Card className="p-6">
          <CheckCircle2 className="h-8 w-8 text-purple-500 mb-2" />
          <p className="font-bold text-2xl">87</p>
          <p className="text-sm text-muted-foreground">Orders This Month</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Today's Menu</h2>
            
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                <TabsTrigger value="lunch">Lunch</TabsTrigger>
                <TabsTrigger value="snacks">Snacks</TabsTrigger>
                <TabsTrigger value="beverages">Beverages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-card transition-smooth">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold flex items-center gap-2">
                              {item.name}
                              {item.veg && <Leaf className="h-4 w-4 text-green-500" />}
                              {item.popular && <Flame className="h-4 w-4 text-orange-500" />}
                            </h3>
                            <p className="text-lg font-bold text-primary">₹{item.price}</p>
                          </div>
                          <Button size="sm" onClick={() => addToCart(item)}>
                            Add
                          </Button>
                        </div>
                        
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {item.prepTime} mins
                          </span>
                          <span>{item.calories} cal</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        {/* Cart & Active Orders */}
        <div className="space-y-6">
          {/* Cart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart
              </h3>
              {cartItemCount > 0 && (
                <Badge>{cartItemCount}</Badge>
              )}
            </div>
            
            {Object.keys(cart).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {Object.entries(cart).map(([itemId, cartItem]) => (
                    <div key={itemId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{cartItem.item.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(parseInt(itemId))}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(parseInt(itemId), cartItem.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">
                              {cartItem.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(parseInt(itemId), cartItem.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-bold text-sm">
                            ₹{cartItem.item.price * cartItem.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatAmount(total)}</span>
                  </div>
                  <Button className="w-full" onClick={placeOrder}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay & Place Order
                  </Button>
                </div>
              </>
            )}
          </Card>
          
          {/* Active Orders */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {orderHistory.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                orderHistory.slice(0, 3).map((order) => (
                  <div 
                    key={order.id}
                    className={`p-4 rounded-lg border ${
                      order.status === PaymentStatus.SUCCESS 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">Order #{order.id.slice(-6)}</span>
                      <Badge variant={order.status === PaymentStatus.SUCCESS ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{formatAmount(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {order.hash && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Hash className="h-3 w-3" />
                          <span className="font-medium">Auth Hash:</span>
                        </div>
                        <code className="text-xs break-all">{order.hash}</code>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        total={total}
        cartItems={Object.values(cart).map(cartItem => ({
          id: cartItem.item.id,
          name: cartItem.item.name,
          price: cartItem.item.price,
          quantity: cartItem.quantity
        }))}
      />

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          isOpen={showOrderConfirmation}
          onClose={() => {
            setShowOrderConfirmation(false);
            setConfirmedOrder(null);
          }}
          orderDetails={confirmedOrder}
        />
      )}
    </div>
  );
}
