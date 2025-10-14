import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Search, 
  QrCode, 
  Clock, 
  DollarSign,
  Filter,
  Star,
  Download,
  Plus,
  RotateCcw,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { BookRequestModal } from '@/components/BookRequestModal';
import { useBookRequests, getRequestsByStudent, formatDate, getRelativeTime } from '@/lib/bookRequests';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

export default function Library() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [requestType, setRequestType] = useState<'reservation' | 'renewal'>('reservation');
  
  // Get student's book requests
  const studentRequests = getRequestsByStudent(user?.id || 'student_001');
  
  const issuedBooks = [
    { 
      title: 'Data Structures and Algorithms', 
      author: 'Thomas Cormen',
      issueDate: '2025-10-01',
      dueDate: '2025-10-15',
      fine: 0,
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'
    },
    { 
      title: 'Operating System Concepts', 
      author: 'Abraham Silberschatz',
      issueDate: '2025-09-28',
      dueDate: '2025-10-12',
      fine: 0,
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'
    },
    { 
      title: 'Database Management Systems', 
      author: 'Raghu Ramakrishnan',
      issueDate: '2025-09-25',
      dueDate: '2025-10-09',
      fine: 80,
      overdue: true,
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop'
    },
  ];
  
  const popularBooks = [
    { id: 'book_001', title: 'Clean Code', author: 'Robert Martin', available: 2, rating: 4.8, isbn: '9780132350884' },
    { id: 'book_002', title: 'Design Patterns', author: 'Gang of Four', available: 1, rating: 4.7, isbn: '9780201633610' },
    { id: 'book_003', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', available: 3, rating: 4.9, isbn: '9780201616224' },
    { id: 'book_004', title: 'Introduction to AI', author: 'Stuart Russell', available: 0, rating: 4.6, isbn: '9780136042594' },
  ];

  const handleRequestBook = (book: any, type: 'reservation' | 'renewal') => {
    setSelectedBook(book);
    setRequestType(type);
    setShowRequestModal(true);
  };

  const handleRequestSubmitted = (request: any) => {
    toast.success('Request submitted successfully!');
    setShowRequestModal(false);
  };

  const getStudentInfo = () => {
    return {
      id: user?.id || 'student_001',
      name: user?.fullName || user?.firstName || 'Student',
      email: user?.primaryEmailAddress?.emailAddress || 'student@campus.edu'
    };
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
            Library Management
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">Browse, issue, and return books with QR codes</p>
        
        <div className="flex gap-3 max-w-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search books, authors, ISBN..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link to="/library/issued">
          <Card className="p-6 card-hover h-full">
            <BookOpen className="h-8 w-8 text-blue-500 mb-3" />
            <p className="font-bold text-2xl mb-1">3</p>
            <p className="text-sm text-muted-foreground">Books Issued</p>
          </Card>
        </Link>
        
        <Link to="/library/scan">
          <Card className="p-6 card-hover h-full">
            <QrCode className="h-8 w-8 text-green-500 mb-3" />
            <p className="font-bold text-lg mb-1">QR Scanner</p>
            <p className="text-sm text-muted-foreground">Return Books</p>
          </Card>
        </Link>
        
        <Link to="/library/fines">
          <Card className="p-6 card-hover h-full">
            <DollarSign className="h-8 w-8 text-orange-500 mb-3" />
            <p className="font-bold text-2xl mb-1">₹80</p>
            <p className="text-sm text-muted-foreground">Due Payments</p>
          </Card>
        </Link>
        
        <Link to="/library/history">
          <Card className="p-6 card-hover h-full">
            <Clock className="h-8 w-8 text-purple-500 mb-3" />
            <p className="font-bold text-lg mb-1">History</p>
            <p className="text-sm text-muted-foreground">View Records</p>
          </Card>
        </Link>
      </div>
      
      {/* My Issued Books */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">My Issued Books</h2>
          <Link to="/library/issued">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {issuedBooks.map((book, idx) => (
            <Card key={idx} className={`p-6 ${book.overdue ? 'border-destructive' : ''}`}>
              <div className="flex gap-4">
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-md shadow-card"
                />
                <div className="flex-1">
                  <h3 className="font-bold mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className={book.overdue ? 'text-destructive font-medium' : ''}>
                        {new Date(book.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {book.fine > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fine:</span>
                        <span className="text-destructive font-medium">₹{book.fine}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR
                    </Button>
                    {book.overdue && (
                      <Button size="sm" variant="destructive" className="flex-1">
                        Pay Fine
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* My Book Requests */}
      {studentRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Book Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold">{request.bookTitle}</h3>
                    <p className="text-sm text-muted-foreground">{request.bookAuthor}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant={request.type === 'reservation' ? 'default' : 'secondary'}>
                      {request.type === 'reservation' ? 'Reservation' : 'Renewal'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={
                      request.status === 'approved' ? 'default' : 
                      request.status === 'denied' ? 'destructive' : 
                      'secondary'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested:</span>
                    <span>{getRelativeTime(request.requestDate)}</span>
                  </div>
                  {request.processedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processed:</span>
                      <span>{getRelativeTime(request.processedDate)}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Popular Books */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popular This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularBooks.map((book, idx) => (
            <Card key={idx} className="p-6 card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold line-clamp-2">{book.title}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{book.rating}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                  {book.available > 0 ? `${book.available} Available` : 'Not Available'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  disabled={book.available === 0}
                  onClick={() => handleRequestBook(book, 'reservation')}
                  className="flex-1"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Reserve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRequestBook(book, 'renewal')}
                  className="flex-1"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Renew
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Book Request Modal */}
      {selectedBook && (
        <BookRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          book={selectedBook}
          studentInfo={getStudentInfo()}
          requestType={requestType}
          onRequestSubmitted={handleRequestSubmitted}
        />
      )}
    </div>
  );
}
