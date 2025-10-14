// Sample data for library localStorage initialization
import { Book, BookRequest, Loan, Fine } from './library-api';

export const sampleBooks: Book[] = [
  {
    id: 'book_001',
    isbn: '9780132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    total: 5,
    available: 3,
    category: 'Programming',
    publishedYear: 2008,
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    description: 'A Handbook of Agile Software Craftsmanship',
    rating: 4.8,
    createdAt: new Date().toISOString()
  },
  {
    id: 'book_002',
    isbn: '9780735211292',
    title: 'Atomic Habits',
    author: 'James Clear',
    total: 3,
    available: 2,
    category: 'Self-Help',
    publishedYear: 2018,
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    rating: 4.7,
    createdAt: new Date().toISOString()
  },
  {
    id: 'book_003',
    isbn: '9780201633610',
    title: 'Design Patterns',
    author: 'Gang of Four',
    total: 4,
    available: 1,
    category: 'Programming',
    publishedYear: 1994,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    description: 'Elements of Reusable Object-Oriented Software',
    rating: 4.6,
    createdAt: new Date().toISOString()
  },
  {
    id: 'book_004',
    isbn: '9780134685991',
    title: 'Effective Java',
    author: 'Joshua Bloch',
    total: 3,
    available: 2,
    category: 'Programming',
    publishedYear: 2017,
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    description: 'Programming Language Guide',
    rating: 4.9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'book_005',
    isbn: '9780136042594',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    total: 2,
    available: 0,
    category: 'Computer Science',
    publishedYear: 2009,
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'The MIT Press',
    rating: 4.5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'book_006',
    isbn: '9780134685991',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    total: 3,
    available: 3,
    category: 'Programming',
    publishedYear: 1999,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    description: 'Your Journey To Mastery',
    rating: 4.8,
    createdAt: new Date().toISOString()
  }
];

export const sampleRequests: BookRequest[] = [
  {
    id: 'req_001',
    studentId: 'student_001',
    studentName: 'John Doe',
    bookId: 'book_001',
    bookTitle: 'Clean Code',
    type: 'reservation',
    status: 'pending',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'req_002',
    studentId: 'student_002',
    studentName: 'Jane Smith',
    bookId: 'book_002',
    bookTitle: 'Atomic Habits',
    type: 'renewal',
    status: 'pending',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

export const sampleLoans: Loan[] = [
  {
    id: 'loan_001',
    studentId: 'student_001',
    studentName: 'John Doe',
    bookId: 'book_001',
    bookTitle: 'Clean Code',
    bookAuthor: 'Robert C. Martin',
    issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    status: 'active',
    fine: 0
  },
  {
    id: 'loan_002',
    studentId: 'student_002',
    studentName: 'Jane Smith',
    bookId: 'book_002',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day overdue
    status: 'active',
    fine: 50
  },
  {
    id: 'loan_003',
    studentId: 'student_003',
    studentName: 'Mike Johnson',
    bookId: 'book_003',
    bookTitle: 'Design Patterns',
    bookAuthor: 'Gang of Four',
    issuedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days overdue
    status: 'active',
    fine: 100
  }
];

export const sampleFines: Fine[] = [
  {
    id: 'fine_001',
    studentId: 'student_002',
    studentName: 'Jane Smith',
    loanId: 'loan_002',
    bookTitle: 'Atomic Habits',
    amount: 50,
    reason: 'Overdue',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fine_002',
    studentId: 'student_003',
    studentName: 'Mike Johnson',
    loanId: 'loan_003',
    bookTitle: 'Design Patterns',
    amount: 100,
    reason: 'Overdue',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initialize localStorage with sample data if empty
export const initializeLibrarySampleData = () => {
  const existingBooks = localStorage.getItem('library_books');
  if (!existingBooks) {
    localStorage.setItem('library_books', JSON.stringify(sampleBooks));
    console.log('📚 Sample books loaded!');
  }
  
  const existingRequests = localStorage.getItem('library_requests');
  if (!existingRequests) {
    localStorage.setItem('library_requests', JSON.stringify(sampleRequests));
    console.log('📋 Sample requests loaded!');
  }
  
  const existingLoans = localStorage.getItem('library_loans');
  if (!existingLoans) {
    localStorage.setItem('library_loans', JSON.stringify(sampleLoans));
    console.log('📖 Sample loans loaded!');
  }
  
  const existingFines = localStorage.getItem('library_fines');
  if (!existingFines) {
    localStorage.setItem('library_fines', JSON.stringify(sampleFines));
    console.log('💰 Sample fines loaded!');
  }
};
