import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { useLocation } from "react-router-dom";

// Placeholder data for demonstration
const menuItems = [
  { id: 1, item: "Chicken Biryani", price: 120, available: true, category: "Main Course" },
  { id: 2, item: "Vegetable Curry", price: 80, available: true, category: "Main Course" },
  { id: 3, item: "Samosa", price: 15, available: false, category: "Snacks" },
  { id: 4, item: "Chai", price: 10, available: true, category: "Beverages" },
];

const preOrders = [
  { id: 1, student: "John Doe", items: "Chicken Biryani x2", amount: 240, status: "pending", orderId: "ORD001" },
  { id: 2, student: "Jane Smith", items: "Vegetable Curry, Chai", amount: 90, status: "pending", orderId: "ORD002" },
  { id: 3, student: "Mike Johnson", items: "Samosa x4, Chai x2", amount: 80, status: "ready", orderId: "ORD003" },
];

const transactions = [
  { id: 1, student: "John Doe", items: "Chicken Biryani", amount: 120, time: "12:30 PM", method: "Digital Wallet" },
  { id: 2, student: "Jane Smith", items: "Chai x2", amount: 20, time: "01:15 PM", method: "Cash" },
  { id: 3, student: "Alex Brown", items: "Vegetable Curry", amount: 80, time: "01:45 PM", method: "Digital Wallet" },
];

export default function CanteenDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Read tab from URL query param reactively
  const tab = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'menu';
  }, [location.search]);

  // Action handlers for buttons
  const handleUpdateMenu = () => {
    alert("Update menu (demo)");
  };
  const handleAddMenuItem = () => {
    alert("Add new menu item (demo)");
  };
  const handleViewOrders = () => {
    alert("View all orders (demo)");
  };
  const handleGenerateReport = () => {
    alert("Generate daily sales report (demo)");
  };
  const handleToggleAvailability = (itemId: number) => {
    alert(`Toggle availability for item ${itemId} (demo)`);
  };
  const handleConfirmPickup = (orderId: string) => {
    alert(`Confirm pickup for order ${orderId} (demo)`);
  };
  const handleMarkReady = (orderId: string) => {
    alert(`Mark order ${orderId} as ready (demo)`);
  };

  // Listen for button events from navbar
  React.useEffect(() => {
    const handler = () => {
      switch (tab) {
        case 'menu':
          handleUpdateMenu();
          break;
        case 'orders':
          handleViewOrders();
          break;
        case 'transactions':
          handleGenerateReport();
          break;
        default:
          break;
      }
    };
    window.addEventListener('canteen-action', handler);
    return () => window.removeEventListener('canteen-action', handler);
  }, [tab]);

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
            <CardTitle>Menu & Inventory Control</CardTitle>
          </CardHeader>
          <CardContent>
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
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/20">
                    <td className="py-2">{item.item}</td>
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleToggleAvailability(item.id)}
                      >
                        Toggle
                      </Button>
                      <Button size="sm" variant="ghost" className="ml-2">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="mt-4" variant="default" onClick={handleAddMenuItem}>Add New Menu Item</Button>
          </CardContent>
        </Card>
      )}

      {/* Pre-Order Fulfillment */}
      {tab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-Order Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preOrders.length === 0 && <div>No pending orders.</div>}
              {preOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                  <div>
                    <div className="font-semibold">{order.student} - Order #{order.orderId}</div>
                    <div className="text-sm text-muted-foreground">{order.items}</div>
                    <div className="text-sm font-medium">Amount: ₹{order.amount}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' ? (
                      <Badge variant="destructive">Pending</Badge>
                    ) : (
                      <Badge variant="default">Ready</Badge>
                    )}
                    <div className="flex gap-2 ml-2">
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="default" 
                          onClick={() => handleMarkReady(order.orderId)}
                        >
                          Mark Ready
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleConfirmPickup(order.orderId)}
                      >
                        Confirm Pickup
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4" variant="default" onClick={handleViewOrders}>View All Orders</Button>
          </CardContent>
        </Card>
      )}

      {/* Transaction Management */}
      {tab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Student</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/20">
                    <td className="py-2">{transaction.student}</td>
                    <td>{transaction.items}</td>
                    <td>₹{transaction.amount}</td>
                    <td>{transaction.time}</td>
                    <td>
                      <Badge variant={transaction.method === 'Digital Wallet' ? 'default' : 'outline'}>
                        {transaction.method}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <div className="text-sm font-medium">Daily Summary</div>
              <div className="text-lg font-bold">Total Sales: ₹{transactions.reduce((sum, t) => sum + t.amount, 0)}</div>
              <div className="text-sm text-muted-foreground">Transactions: {transactions.length}</div>
            </div>
            <Button className="mt-4" variant="default" onClick={handleGenerateReport}>Generate Daily Report</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}