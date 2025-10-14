import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useMenuItems, useUserOrders } from '@/hooks/use-canteen-api';
import { MenuItem } from '@/lib/api';
import { toast } from 'sonner';

export default function Canteen() {
  const { theme } = useTheme();
  const [cart, setCart] = useState<{[key: string]: {item: MenuItem, quantity: number}}>({});
  
  // API hooks
  const { menuItems, loading: menuLoading } = useMenuItems();
  const { orders: userOrders, createOrder, loading: ordersLoading } = useUserOrders();
  
  // Filter available menu items
  const availableMenuItems = menuItems.filter(item => item.available);
  
  const addToCart = (item: MenuItem) => {
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

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[itemId]) {
        delete newCart[itemId];
        toast.success('Item removed from cart');
      }
      return newCart;
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
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
  
  const placeOrder = async () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    try {
      // Create orders for each cart item
      for (const cartItem of cartItems) {
        await createOrder({
          itemId: cartItem.item.id,
          qty: cartItem.quantity
        });
      }
      
      toast.success('Order placed successfully!');
      setCart({});
    } catch (error) {
      toast.error('Failed to place order');
    }
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
          <p className="font-bold text-2xl">{userOrders.filter(order => order.status === 'pending').length}</p>
          <p className="text-sm text-muted-foreground">Active Orders</p>
        </Card>
        
        <Card className="p-6">
          <UtensilsCrossed className="h-8 w-8 text-orange-500 mb-2" />
          <p className="font-bold text-2xl">{cartItemCount}</p>
          <p className="text-sm text-muted-foreground">Items in Cart</p>
        </Card>
        
        <Card className="p-6">
          <CheckCircle2 className="h-8 w-8 text-purple-500 mb-2" />
          <p className="font-bold text-2xl">{userOrders.length}</p>
          <p className="text-sm text-muted-foreground">Total Orders</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Today's Menu</h2>
            
            {menuLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading menu...</span>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Main Course">Main Course</TabsTrigger>
                  <TabsTrigger value="Snacks">Snacks</TabsTrigger>
                  <TabsTrigger value="Beverages">Beverages</TabsTrigger>
                  <TabsTrigger value="Desserts">Desserts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {availableMenuItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No menu items available. Check back later!
                    </div>
                  ) : (
                    availableMenuItems.map((item) => (
                      <Card key={item.id} className="p-4 hover:shadow-card transition-smooth">
                        <div className="flex gap-4">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'} 
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
                              <span className="capitalize">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                {['Main Course', 'Snacks', 'Beverages', 'Desserts'].map(category => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    {availableMenuItems.filter(item => item.category === category).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No {category.toLowerCase()} items available.
                      </div>
                    ) : (
                      availableMenuItems
                        .filter(item => item.category === category)
                        .map((item) => (
                          <Card key={item.id} className="p-4 hover:shadow-card transition-smooth">
                            <div className="flex gap-4">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'} 
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
                        ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
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
                            onClick={() => removeFromCart(itemId)}
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
                              onClick={() => updateQuantity(itemId, cartItem.quantity - 1)}
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
                              onClick={() => updateQuantity(itemId, cartItem.quantity + 1)}
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
                    <span className="text-primary">₹{total}</span>
                  </div>
                  <Button className="w-full" onClick={placeOrder}>
                    Place Order
                  </Button>
                </div>
              </>
            )}
          </Card>
          
          {/* Active Orders */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">My Orders</h3>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Loading orders...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No orders yet. Place your first order!
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <div 
                      key={order.id}
                      className={`p-4 rounded-lg border ${
                        order.status === 'picked' 
                          ? 'border-green-500 bg-green-500/10' 
                          : order.status === 'ready'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">Order #{order.id.slice(-6)}</span>
                        <Badge variant={
                          order.status === 'picked' ? 'default' : 
                          order.status === 'ready' ? 'secondary' : 
                          'destructive'
                        }>
                          {order.status === 'picked' ? 'Picked Up' : 
                           order.status === 'ready' ? 'Ready' : 
                           'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {order.itemName} x {order.qty}
                      </p>
                      <p className="text-sm font-medium">₹{order.totalAmount}</p>
                      <p className="text-xs text-muted-foreground">
                        Ordered: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
