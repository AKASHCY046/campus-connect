import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { useBooks, useRequests, useLoans, useFines, useLibraryAnalytics } from "@/hooks/use-library-api";
import { Book, BookRequest, Loan, Fine, CreateBookData } from "@/lib/library-api";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Download, RefreshCw, CheckCircle, XCircle, BookOpen, Users, DollarSign, AlertTriangle } from "lucide-react";

export default function LibrarianDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  
  // API hooks
  const { books, loading: booksLoading, createBook, updateBook, deleteBook } = useBooks();
  const { requests, loading: requestsLoading, approveRequest, denyRequest } = useRequests();
  const { loans, loading: loansLoading, returnBook } = useLoans();
  const { fines, loading: finesLoading, markFinePaid } = useFines();
  const { analytics, loading: analyticsLoading } = useLibraryAnalytics();
  
  // State for add book dialog
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBook, setNewBook] = useState<CreateBookData>({
    isbn: '',
    title: '',
    author: '',
    total: 1,
    category: 'Programming',
    publishedYear: new Date().getFullYear(),
    cover: '',
    description: ''
  });
  
  // Read tab from URL query param reactively
  const tab = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'requests';
  }, [location.search]);

  // Action handlers
  const handleAddBook = async () => {
    try {
      setIsSubmitting(true);
      await createBook(newBook);
      toast.success('Book added successfully!');
      setIsAddBookDialogOpen(false);
      setNewBook({
        isbn: '',
        title: '',
        author: '',
        total: 1,
        category: 'Programming',
        publishedYear: new Date().getFullYear(),
        cover: '',
        description: ''
      });
    } catch (error) {
      toast.error('Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest(requestId);
      toast.success('Request approved');
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      await denyRequest(requestId);
      toast.success('Request denied');
    } catch (error) {
      toast.error('Failed to deny request');
    }
  };

  const handleReturnBook = async (loanId: string) => {
    try {
      await returnBook(loanId);
      toast.success('Book returned successfully');
    } catch (error) {
      toast.error('Failed to return book');
    }
  };

  const handleMarkFinePaid = async (fineId: string) => {
    try {
      await markFinePaid(fineId);
      toast.success('Fine marked as paid');
    } catch (error) {
      toast.error('Failed to mark fine as paid');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
        toast.success('Book deleted successfully');
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pending Requests
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Badge variant="secondary">
                  {requests.filter(req => req.status === 'pending').length} pending
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading requests...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {requests.filter(req => req.status === 'pending').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending requests.
                    </div>
                  ) : (
                    requests.filter(req => req.status === 'pending').map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                        <div>
                          <span className="font-semibold">{req.studentName}</span> requests <span className="font-semibold">{req.type}</span> for <span className="font-semibold">{req.bookTitle}</span>
                          <div className="text-sm text-muted-foreground">
                            Requested: {new Date(req.requestedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleApproveRequest(req.id)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDenyRequest(req.id)}
                            className="gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            Deny
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
