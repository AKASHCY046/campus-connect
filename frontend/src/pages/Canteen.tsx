import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Wallet,
  ShoppingCart,
  Flame,
  Leaf,
  Timer,
  Plus,
  Minus,
  X,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMenuItems, createOrder, getOrders, type MenuItem } from '@/lib/services/canteen';
import { queryKeys } from '@/lib/query-utils';
import { pushNotification } from '@/lib/services/notifications';
import { toast } from 'sonner';

const CATEGORIES: { value: MenuItem['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'dinner', label: 'Dinner' },
];

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Preparing', className: 'bg-amber-500 hover:bg-amber-500' },
  preparing: { label: 'Preparing', className: 'bg-amber-500 hover:bg-amber-500' },
  ready: { label: 'Ready for pickup', className: 'bg-blue-500 hover:bg-blue-500' },
  picked: { label: 'Picked up', className: 'bg-emerald-500 hover:bg-emerald-500' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive hover:bg-destructive' },
};

interface CartLine {
  item: MenuItem;
  quantity: number;
}

export default function Canteen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<Record<string, CartLine>>({});

  const userId = user?.id ?? 'anonymous';

  const { data: menu = [], isLoading: menuLoading } = useQuery({
    queryKey: queryKeys.canteen.menu,
    queryFn: () => getMenuItems({ available: true }),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: queryKeys.canteen.orders(userId),
    queryFn: () => getOrders(userId),
    enabled: !!user?.id,
    refetchInterval: 8000,
  });

  const placeOrderMutation = useMutation({
    mutationFn: (lines: CartLine[]) =>
      createOrder(
        userId,
        lines.map((l) => ({ menu_item_id: l.item.id, quantity: l.quantity })),
        user?.full_name ?? 'Student',
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen'] });
      pushNotification(userId, {
        title: 'Order placed',
        message: 'Your canteen order has been received and is being prepared.',
        type: 'success',
      });
      toast.success('Order placed! Track it under “My orders”.');
      setCart({});
    },
    onError: () => toast.error('Could not place your order. Please try again.'),
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: { item, quantity: (existing?.quantity ?? 0) + 1 },
      };
    });
  };

  const setQuantity = (id: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...prev[id], quantity } };
    });
  };

  const lines = Object.values(cart);
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
  const activeOrders = orders.filter((o) => o.status !== 'picked' && o.status !== 'cancelled');

  const filterByCategory = (category: MenuItem['category'] | 'all') =>
    category === 'all' ? menu : menu.filter((m) => m.category === category);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">
          <span className={theme === 'cyber' ? 'text-gradient' : ''}>Canteen Pre-Order</span>
        </h1>
        <p className="text-muted-foreground">Skip the queue — order ahead and pick up with your token.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Wallet} tint="text-emerald-500" value="₹450" label="Wallet balance" />
        <Stat icon={Clock} tint="text-blue-500" value={activeOrders.length} label="Active orders" />
        <Stat icon={ShoppingCart} tint="text-amber-500" value={cartCount} label="Items in cart" />
        <Stat icon={UtensilsCrossed} tint="text-violet-500" value={orders.length} label="Total orders" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4">Today&apos;s menu</h2>
            {menuLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : menu.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                The menu is being updated. Check back shortly.
              </p>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4 flex w-full flex-wrap justify-start">
                  {CATEGORIES.map((c) => (
                    <TabsTrigger key={c.value} value={c.value}>
                      {c.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {CATEGORIES.map((c) => {
                  const items = filterByCategory(c.value);
                  return (
                    <TabsContent key={c.value} value={c.value} className="space-y-3">
                      {items.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                          Nothing in {c.label.toLowerCase()} right now.
                        </p>
                      ) : (
                        items.map((item) => (
                          <MenuRow key={item.id} item={item} onAdd={() => addToCart(item)} />
                        ))
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingCart className="h-5 w-5" /> Your cart
              </h3>
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </div>

            {lines.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Your cart is empty.</p>
            ) : (
              <>
                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                  {lines.map(({ item, quantity }) => (
                    <div key={item.id} className="rounded-lg bg-muted/50 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <button
                          onClick={() => setQuantity(item.id, 0)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => setQuantity(item.id, quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => setQuantity(item.id, quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-bold">₹{item.price * quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{cartTotal}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => placeOrderMutation.mutate(lines)}
                    disabled={placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Place order'
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold">My orders</h3>
            {ordersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 6).map((order) => {
                  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
                  return (
                    <div key={order.id} className="rounded-lg border p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-bold">Token #{order.token_number ?? '—'}</span>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(order.items ?? [])
                          .map((i) => `${i.menu_item?.name ?? 'Item'} ×${i.quantity}`)
                          .join(', ') || `${order.items?.length ?? 0} item(s)`}
                      </p>
                      <p className="text-sm font-medium">₹{order.total_amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  tint,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Card className="p-5">
      <Icon className={`mb-2 h-7 w-7 ${tint}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function MenuRow({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <Card className="flex gap-4 p-4">
      <img
        src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop'}
        alt=""
        loading="lazy"
        className="h-24 w-24 shrink-0 rounded-lg object-cover"
      />
      <div className="flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              {item.name}
              {item.veg && <Leaf className="h-4 w-4 text-emerald-500" />}
              {item.popular && <Flame className="h-4 w-4 text-orange-500" />}
            </h3>
            <p className="text-lg font-bold text-primary">₹{item.price}</p>
          </div>
          <Button size="sm" onClick={onAdd} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {item.prep_time ? (
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {item.prep_time} min
            </span>
          ) : null}
          {item.calories ? <span>{item.calories} cal</span> : null}
          <span className="capitalize">{item.category}</span>
        </div>
      </div>
    </Card>
  );
}
