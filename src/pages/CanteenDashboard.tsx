import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { useMenuItems, useOrders, useAnalytics } from "@/hooks/use-canteen-api";
import { MenuItem, CreateMenuItemData } from "@/lib/api";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Download, RefreshCw, Settings, BarChart3, Clock, Wallet, CheckCircle2 } from "lucide-react";

export default function CanteenDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  
  // API hooks
  const { menuItems, loading: menuLoading, createMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
  const { orders, loading: ordersLoading, markOrderPicked } = useOrders();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  
  // State for add menu item dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<CreateMenuItemData>({
    name: '',
    price: 0,
    available: true,
    category: 'Main Course',
    prepTime: 15,
    calories: 0,
    veg: true,
    popular: false,
    image: ''
  });
  
  // Read tab from URL query param reactively
  const tab = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'menu';
  }, [location.search]);

  // Action handlers
  const handleAddMenuItem = async () => {
    try {
      setIsSubmitting(true);
      await createMenuItem(newMenuItem);
      toast.success('Menu item added successfully!');
      setIsAddDialogOpen(false);
      setNewMenuItem({
        name: '',
        price: 0,
        available: true,
        category: 'Main Course',
        prepTime: 15,
        calories: 0,
        veg: true,
        popular: false,
        image: ''
      });
    } catch (error) {
      toast.error('Failed to add menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { available: !item.available });
      toast.success(`Item ${item.available ? 'unavailable' : 'available'} updated`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteMenuItem(item.id);
        toast.success('Menu item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleMarkPicked = async (orderId: string) => {
    try {
      await markOrderPicked(orderId);
      toast.success('Order marked as picked up');
    } catch (error) {
      toast.error('Failed to mark order as picked');
    }
  };

  const handleGenerateReport = () => {
    if (analytics) {
      const report = `
Daily Sales Report
==================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Sales Summary:
- Total Orders: ${analytics.totalOrders}
- Today's Orders: ${analytics.todayOrders}
- Total Revenue: ₹${analytics.totalRevenue}
- Today's Revenue: ₹${analytics.todayRevenue}

Menu Items: ${menuItems.length}
Available Items: ${menuItems.filter(item => item.available).length}
Pending Orders: ${orders.length}
      `;
      
      // Create and download report file
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canteen-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    }
  };

  const handleRefreshData = () => {
    // Refresh all data
    window.location.reload();
  };

  const handleBulkUpdate = () => {
    // Toggle all items availability
    const allAvailable = menuItems.every(item => item.available);
    const newAvailability = !allAvailable;
    
    menuItems.forEach(async (item) => {
      if (item.available !== newAvailability) {
        await updateMenuItem(item.id, { available: newAvailability });
      }
    });
    
    toast.success(`All items ${newAvailability ? 'made available' : 'made unavailable'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
            Canteen Dashboard
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">Manage menu, orders, and canteen operations</p>
      </div>
      
      {/* Menu & Inventory Control */}
      {tab === 'menu' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Menu & Inventory Control
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshData}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkUpdate}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Bulk Update
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Menu Item
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={newMenuItem.name}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter item name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                      <Input
                        id="prepTime"
                        type="number"
                        value={newMenuItem.prepTime}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, prepTime: Number(e.target.value) }))}
                        placeholder="Enter prep time"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newMenuItem.calories}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, calories: Number(e.target.value) }))}
                        placeholder="Enter calories"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL (optional)</Label>
                      <Input
                        id="image"
                        value={newMenuItem.image}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Enter image URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Course">Main Course</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Desserts">Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={newMenuItem.available}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, available: e.target.checked }))}
                      />
                      <Label htmlFor="available">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="veg"
                        checked={newMenuItem.veg}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, veg: e.target.checked }))}
                      />
                      <Label htmlFor="veg">Vegetarian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="popular"
                        checked={newMenuItem.popular}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, popular: e.target.checked }))}
                      />
                      <Label htmlFor="popular">Popular</Label>
                    </div>
                    <Button 
                      onClick={handleAddMenuItem} 
                      disabled={isSubmitting || !newMenuItem.name || newMenuItem.price <= 0}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        'Add Menu Item'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
                </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {menuLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading menu items...</span>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Item</th>
                      <th>Category</th>
                      <th>Price (₹)</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No menu items found. Add your first item!
                        </td>
                      </tr>
                    ) : (
                      menuItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/20">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {item.name}
                              {item.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                            </div>
                          </td>
                          <td>{item.category}</td>
                          <td>₹{item.price}</td>
                          <td>
                            {item.available ? (
                              <Badge variant="default">Available</Badge>
                            ) : (
                              <Badge variant="destructive">Unavailable</Badge>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleToggleAvailability(item)}
                              >
                                Toggle
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteMenuItem(item)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pre-Order Fulfillment */}
      {tab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pre-Order Queue
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshData}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Badge variant="secondary">
                  {orders.length} pending
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading orders...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending orders.
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                        <div>
                          <div className="font-semibold">{order.studentName} - Order #{order.id.slice(-6)}</div>
                          <div className="text-sm text-muted-foreground">{order.itemName} x {order.qty}</div>
                          <div className="text-sm font-medium">Amount: ₹{order.totalAmount}</div>
                          <div className="text-xs text-muted-foreground">
                            Ordered: {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Pending</Badge>
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={() => handleMarkPicked(order.id)}
                          >
                            Mark Picked Up
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Management */}
      {tab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Analytics & Reports
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshData}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleGenerateReport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading analytics...</span>
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                        <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Today's Orders</div>
                        <div className="text-2xl font-bold">{analytics.todayOrders}</div>
                      </div>
                      <Clock className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                        <div className="text-2xl font-bold">₹{analytics.totalRevenue}</div>
                      </div>
                      <Wallet className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Today's Revenue</div>
                        <div className="text-2xl font-bold">₹{analytics.todayRevenue}</div>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm font-medium mb-2">Daily Summary</div>
                  <div className="text-lg font-bold">Total Sales: ₹{analytics.totalRevenue}</div>
                  <div className="text-sm text-muted-foreground">Total Orders: {analytics.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Today's Revenue: ₹{analytics.todayRevenue}</div>
                  <div className="text-sm text-muted-foreground">Today's Orders: {analytics.todayOrders}</div>
                </div>
                
                <Button className="mt-4" variant="default" onClick={handleGenerateReport}>
                  Generate Daily Report
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No analytics data available.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}