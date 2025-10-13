import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { useLocation } from "react-router-dom";

// Placeholder data for demonstration
const requests = [
  { id: 1, student: "John Doe", book: "Clean Code", type: "Reservation", status: "pending" },
  { id: 2, student: "Jane Smith", book: "Atomic Habits", type: "Renewal", status: "pending" },
];
const inventory = [
  { isbn: "9780132350884", title: "Clean Code", author: "Robert C. Martin", total: 5, available: 2 },
  { isbn: "9780735211292", title: "Atomic Habits", author: "James Clear", total: 3, available: 1 },
];
const loans = [
  { id: 1, student: "John Doe", book: "Clean Code", due: "2025-10-20", overdue: false },
  { id: 2, student: "Jane Smith", book: "Atomic Habits", due: "2025-10-10", overdue: true },
];
const fines = [
  { id: 1, student: "Jane Smith", amount: 50, reason: "Overdue", paid: false },
  { id: 2, student: "John Doe", amount: 20, reason: "Damaged Book", paid: true },
];

export default function LibrarianDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  // Read tab from URL query param reactively
  const tab = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'requests';
  }, [location.search]);

  // Action handlers for header buttons
  const handleApproveAll = () => {
    alert("All requests approved (demo)");
  };
  const handleAddRequest = () => {
    alert("Add new request (demo)");
  };
  const handleAddBook = () => {
    alert("Add new book (demo)");
  };
  const handleIssueLoan = () => {
    alert("Issue new loan (demo)");
  };
  const handleAssessFine = () => {
    alert("Assess fine (demo)");
  };


  // Listen for Assess Fine button event from navbar
  React.useEffect(() => {
    const handler = () => handleAssessFine();
    window.addEventListener('assess-fine', handler);
    return () => window.removeEventListener('assess-fine', handler);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-neon-blue">Librarian Dashboard</h1>
      {/* Render only the selected tab's content */}
      {tab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.length === 0 && <div>No pending requests.</div>}
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                  <div>
                    <span className="font-semibold">{req.student}</span> requests <span className="font-semibold">{req.type}</span> for <span className="font-semibold">{req.book}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">Approve</Button>
                    <Button size="sm" variant="destructive">Deny</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4" variant="default" onClick={handleAddRequest}>Add New Request</Button>
          </CardContent>
        </Card>
      )}
      {tab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Book Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">ISBN</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((book) => (
                  <tr key={book.isbn} className="border-b hover:bg-muted/20">
                    <td className="py-2">{book.isbn}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.total}</td>
                    <td>{book.available}</td>
                    <td>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="mt-4" variant="default" onClick={handleAddBook}>Add New Book</Button>
          </CardContent>
        </Card>
      )}
      {tab === 'loans' && (
        <Card>
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Student</th>
                  <th>Book</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className={loan.overdue ? "bg-destructive/10" : ""}>
                    <td className="py-2">{loan.student}</td>
                    <td>{loan.book}</td>
                    <td>{loan.due}</td>
                    <td>
                      {loan.overdue ? <Badge variant="destructive">Overdue</Badge> : <Badge variant="default">On Time</Badge>}
                    </td>
                    <td>
                      <Button size="sm" variant="default">Return</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="mt-4" variant="default" onClick={handleIssueLoan}>Issue New Loan</Button>
          </CardContent>
        </Card>
      )}
      {tab === 'fines' && (
        <Card>
          <CardHeader>
            <CardTitle>Fines & Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Student</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.id} className={fine.paid ? "" : "bg-destructive/10"}>
                    <td className="py-2">{fine.student}</td>
                    <td>₹{fine.amount}</td>
                    <td>{fine.reason}</td>
                    <td>
                      {fine.paid ? <Badge variant="default">Paid</Badge> : <Badge variant="destructive">Pending</Badge>}
                    </td>
                    <td>
                      {!fine.paid && <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white">Mark as Paid</Button>}
                      <Button size="sm" variant="outline" className="ml-2">Assess Fine</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="mt-4" variant="default" onClick={handleAssessFine}>Assess Fine</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
