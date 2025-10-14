import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  useBookRequests, 
  updateRequestStatus, 
  getPendingRequests, 
  getRequestsByStatus,
  formatDate,
  getRelativeTime,
  getRequestStats
} from "@/lib/bookRequests";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  Mail,
  Calendar,
  MessageSquare,
  Eye
} from "lucide-react";
import { toast } from "sonner";

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
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [librarianNotes, setLibrarianNotes] = useState('');
  
  // Read tab from URL query param reactively
  const tab = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'requests';
  }, [location.search]);

  // Get real-time book requests
  const allRequests = useBookRequests();
  const pendingRequests = getPendingRequests();
  const approvedRequests = getRequestsByStatus('approved');
  const deniedRequests = getRequestsByStatus('denied');
  const requestStats = getRequestStats();

  // Request management functions
  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleApproveRequest = (requestId: string) => {
    const result = updateRequestStatus(requestId, 'approved', 'Librarian', librarianNotes);
    if (result) {
      toast.success('Request approved successfully!');
      setShowRequestModal(false);
      setLibrarianNotes('');
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleDenyRequest = (requestId: string) => {
    const result = updateRequestStatus(requestId, 'denied', 'Librarian', librarianNotes);
    if (result) {
      toast.success('Request denied');
      setShowRequestModal(false);
      setLibrarianNotes('');
    } else {
      toast.error('Failed to deny request');
    }
  };

  const handleApproveAll = () => {
    pendingRequests.forEach(request => {
      updateRequestStatus(request.id, 'approved', 'Librarian', 'Bulk approved');
    });
    toast.success('All pending requests approved!');
  };


  // Listen for Assess Fine button event from navbar
  React.useEffect(() => {
    const handler = () => handleAssessFine();
    window.addEventListener('assess-fine', handler);
    return () => window.removeEventListener('assess-fine', handler);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
            Librarian Dashboard
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">Manage book requests, inventory, and library operations</p>
      </div>
      {/* Render only the selected tab's content */}
      {tab === 'requests' && (
        <div className="space-y-6">
          {/* Request Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{requestStats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{requestStats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{requestStats.denied}</p>
                  <p className="text-sm text-muted-foreground">Denied</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{requestStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
                {pendingRequests.length > 0 && (
                  <Button onClick={handleApproveAll} variant="outline" size="sm">
                    Approve All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold">{request.bookTitle}</h3>
                            <p className="text-sm text-muted-foreground">{request.bookAuthor}</p>
                          </div>
                          <Badge variant={request.type === 'reservation' ? 'default' : 'secondary'}>
                            {request.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{request.studentName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{request.studentEmail}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{getRelativeTime(request.requestDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDenyRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Request Details
              </DialogTitle>
              <DialogDescription>
                Review and process this book request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Request Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Book Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm">{selectedRequest.bookTitle}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Author</Label>
                      <p className="text-sm">{selectedRequest.bookAuthor}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">ISBN</Label>
                      <p className="text-sm">{selectedRequest.bookISBN}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Request Type</Label>
                      <Badge variant={selectedRequest.type === 'reservation' ? 'default' : 'secondary'}>
                        {selectedRequest.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{selectedRequest.studentName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedRequest.studentEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Request Date</Label>
                      <p className="text-sm">{formatDate(selectedRequest.requestDate)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={
                        selectedRequest.status === 'approved' ? 'default' : 
                        selectedRequest.status === 'denied' ? 'destructive' : 
                        'secondary'
                      }>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Librarian Notes */}
              <div>
                <Label htmlFor="librarian-notes">Librarian Notes</Label>
                <Textarea
                  id="librarian-notes"
                  placeholder="Add notes about this request..."
                  value={librarianNotes}
                  onChange={(e) => setLibrarianNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDenyRequest(selectedRequest.id)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Request
                </Button>
                <Button 
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
