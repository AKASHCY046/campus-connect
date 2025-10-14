import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  User, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { addBookRequest, addBookRenewal, type BookRequest } from '@/lib/bookRequests';
import { toast } from 'sonner';

interface BookRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    available: boolean;
    dueDate?: string;
  };
  studentInfo: {
    id: string;
    name: string;
    email: string;
  };
  requestType: 'reservation' | 'renewal';
  onRequestSubmitted: (request: BookRequest) => void;
}

export const BookRequestModal = ({ 
  isOpen, 
  onClose, 
  book, 
  studentInfo,
  requestType,
  onRequestSubmitted 
}: BookRequestModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let newRequest: BookRequest;

      if (requestType === 'reservation') {
        newRequest = addBookRequest({
          studentId: studentInfo.id,
          studentName: studentInfo.name,
          studentEmail: studentInfo.email,
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookISBN: book.isbn,
          type: 'reservation',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        });
      } else {
        newRequest = addBookRenewal({
          studentId: studentInfo.id,
          studentName: studentInfo.name,
          studentEmail: studentInfo.email,
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          currentDueDate: book.dueDate || new Date().toISOString(),
          newDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        });
      }

      onRequestSubmitted(newRequest);
      toast.success(`${requestType === 'reservation' ? 'Book reservation' : 'Book renewal'} request submitted successfully!`);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {requestType === 'reservation' ? 'Reserve Book' : 'Renew Book'}
          </DialogTitle>
          <DialogDescription>
            {requestType === 'reservation' 
              ? 'Submit a request to reserve this book' 
              : 'Submit a request to renew this book'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Book Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Book Details</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">{book.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Author</Label>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ISBN</Label>
                  <p className="text-sm text-muted-foreground">{book.isbn}</p>
                </div>
                {requestType === 'renewal' && book.dueDate && (
                  <div>
                    <Label className="text-sm font-medium">Current Due Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(book.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={book.available ? 'default' : 'destructive'}>
                    {book.available ? 'Available' : 'Not Available'}
                  </Badge>
                  {requestType === 'renewal' && (
                    <Badge variant="secondary">Renewal Request</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Your Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{studentInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{studentInfo.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="reason">Reason for {requestType === 'reservation' ? 'Reservation' : 'Renewal'} (Optional)</Label>
              <Textarea
                id="reason"
                placeholder={`Explain why you need to ${requestType === 'reservation' ? 'reserve' : 'renew'} this book...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Important Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Important Notice</p>
                  <p className="text-blue-700 mt-1">
                    {requestType === 'reservation' 
                      ? 'Your reservation request will be reviewed by the librarian. You will be notified once approved.'
                      : 'Your renewal request will be reviewed by the librarian. The new due date will be confirmed upon approval.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !book.available}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
