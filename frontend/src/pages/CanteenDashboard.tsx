import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Download, UtensilsCrossed, ClipboardList, IndianRupee, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  getMenuItems,
  getOrders,
  updateMenuItem,
  updateOrderStatus,
  type MenuItem,
  type Order,
} from '@/lib/services/canteen';
import { AddMenuItemDialog } from '@/components/dialogs/AddMenuItemDialog';
import { EditMenuItemDialog } from '@/components/dialogs/EditMenuItemDialog';
import { DeleteMenuItemDialog } from '@/components/dialogs/DeleteMenuItemDialog';
import { queryKeys } from '@/lib/query-utils';

const TABS = ['menu', 'orders', 'transactions'] as const;
type Tab = (typeof TABS)[number];

export default function CanteenDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tab = React.useMemo<Tab>(() => {
    const t = new URLSearchParams(location.search).get('tab') as Tab;
    return TABS.includes(t) ? t : 'menu';
  }, [location.search]);
  const setTab = (t: string) => navigate(`/canteen-incharge?tab=${t}`, { replace: true });

  const { data: menu = [], isLoading: menuLoading } = useQuery({
    queryKey: queryKeys.canteen.menu,
    queryFn: () => getMenuItems(),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: queryKeys.canteen.transactions,
    queryFn: () => getOrders(),
    refetchInterval: 6000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['canteen'] });

  const toggleAvailability = useMutation({
    mutationFn: (item: MenuItem) => updateMenuItem(item.id, { available: !item.available }),
    onSuccess: () => {
      refresh();
      toast.success('Availability updated');
    },
    onError: () => toast.error('Could not update the item'),
  });

  const advanceOrder = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: (_d, { status }) => {
      refresh();
      toast.success(status === 'ready' ? 'Order marked ready' : 'Order handed over');
    },
    onError: () => toast.error('Could not update the order'),
  });

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completed = orders.filter((o) => o.status === 'picked');

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total_amount || 0), 0);

  const downloadReport = () => {
    const lines = [
      'Campus Connect — Canteen Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total orders: ${orders.length}`,
      `Orders today: ${todayOrders.length}`,
      `Total revenue: ₹${totalRevenue}`,
      `Revenue today: ₹${todayRevenue}`,
      `Menu items: ${menu.length} (${menu.filter((m) => m.available).length} available)`,
      '',
      'Order log:',
      ...orders.map(
        (o) =>
          `  #${o.token_number ?? '—'}  ₹${o.total_amount}  ${o.status}  ${new Date(
            o.created_at,
          ).toLocaleString()}`,
      ),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `canteen-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">
          <span className={theme === 'cyber' ? 'text-gradient' : ''}>Canteen Manager</span>
        </h1>
        <p className="text-muted-foreground">Manage the menu, fulfil pre-orders and review sales.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={ClipboardList} tint="text-amber-500" value={pendingOrders.length} label="Orders in queue" />
        <Stat icon={UtensilsCrossed} tint="text-blue-500" value={menu.filter((m) => m.available).length} label="Items available" />
        <Stat icon={IndianRupee} tint="text-emerald-500" value={`₹${todayRevenue}`} label="Revenue today" />
        <Stat icon={TrendingUp} tint="text-violet-500" value={orders.length} label="Orders all-time" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">Pre-orders</TabsTrigger>
          <TabsTrigger value="transactions">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2>Menu &amp; availability</h2>
              <AddMenuItemDialog onSuccess={refresh} />
            </div>
            {menuLoading ? (
              <Loading />
            ) : menu.length === 0 ? (
              <Empty>No menu items yet. Add your first dish.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menu.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                          {item.popular && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              Popular
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">{item.category}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.available
                                ? 'bg-emerald-500 hover:bg-emerald-500'
                                : 'bg-muted-foreground hover:bg-muted-foreground'
                            }
                          >
                            {item.available ? 'Available' : 'Off menu'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAvailability.mutate(item)}
                              disabled={toggleAvailability.isPending}
                            >
                              {item.available ? 'Take off' : 'Put on'}
                            </Button>
                            <EditMenuItemDialog item={item} onSuccess={refresh} />
                            <DeleteMenuItemDialog item={item} onSuccess={refresh} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrderColumn
            title="In the queue"
            hint="New and preparing"
            orders={pendingOrders}
            loading={ordersLoading}
            emptyText="No orders waiting."
            action={(o) => (
              <Button
                size="sm"
                onClick={() => advanceOrder.mutate({ id: o.id, status: 'ready' })}
                disabled={advanceOrder.isPending}
              >
                Mark ready
              </Button>
            )}
          />
          <OrderColumn
            title="Ready for pickup"
            hint="Waiting for the student"
            orders={readyOrders}
            loading={ordersLoading}
            emptyText="Nothing ready right now."
            action={(o) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => advanceOrder.mutate({ id: o.id, status: 'picked' })}
                disabled={advanceOrder.isPending}
              >
                Hand over
              </Button>
            )}
          />
          {completed.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4">Completed today</h2>
              <div className="space-y-2">
                {completed.slice(0, 8).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm text-muted-foreground"
                  >
                    <span>Token #{o.token_number ?? '—'}</span>
                    <span>₹{o.total_amount}</span>
                    <span>{new Date(o.updated_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={downloadReport}>
              <Download className="h-4 w-4" /> Download report
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={ClipboardList} tint="text-blue-500" value={orders.length} label="Total orders" />
            <Stat icon={ClipboardList} tint="text-violet-500" value={todayOrders.length} label="Orders today" />
            <Stat icon={IndianRupee} tint="text-emerald-500" value={`₹${totalRevenue}`} label="Total revenue" />
            <Stat icon={IndianRupee} tint="text-amber-500" value={`₹${todayRevenue}`} label="Revenue today" />
          </div>
          <Card className="p-6">
            <h2 className="mb-4">Recent orders</h2>
            {ordersLoading ? (
              <Loading />
            ) : orders.length === 0 ? (
              <Empty>No orders yet.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Placed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 20).map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">#{o.token_number ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {(o.items ?? []).reduce((n, i) => n + i.quantity, 0) || 1}
                        </TableCell>
                        <TableCell>₹{o.total_amount}</TableCell>
                        <TableCell className="capitalize">{o.status}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(o.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderColumn({
  title,
  hint,
  orders,
  loading,
  emptyText,
  action,
}: {
  title: string;
  hint: string;
  orders: Order[];
  loading: boolean;
  emptyText: string;
  action: (o: Order) => React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2>{title}</h2>
        <span className="text-sm text-muted-foreground">{hint}</span>
      </div>
      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <Empty>{emptyText}</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold">#{o.token_number ?? '—'}</span>
                <Badge variant="outline">₹{o.total_amount}</Badge>
              </div>
              <p className="mb-1 text-sm text-muted-foreground">
                {o.profiles?.full_name || 'Student'}
              </p>
              <p className="mb-3 text-sm">
                {(o.items ?? [])
                  .map((i) => `${i.menu_item?.name ?? 'Item'} ×${i.quantity}`)
                  .join(', ') || `${o.items?.length ?? 1} item(s)`}
              </p>
              {action(o)}
            </div>
          ))}
        </div>
      )}
    </Card>
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
      <Icon className={`mb-3 h-7 w-7 ${tint}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-14">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-14 text-center text-muted-foreground">{children}</p>;
}
