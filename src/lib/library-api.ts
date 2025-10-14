// Library localStorage API service
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  total: number;
  available: number;
  category: string;
  publishedYear: number;
  cover: string;
  description: string;
  rating: number;
  createdAt: string;
}

export interface BookRequest {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  type: 'reservation' | 'renewal';
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  processedAt?: string;
}

export interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue';
  fine: number;
}

export interface Fine {
  id: string;
  studentId: string;
  studentName: string;
  loanId: string;
  bookTitle: string;
  amount: number;
  reason: string;
  status: 'pending' | 'paid';
  createdAt: string;
  paidAt?: string;
}

export interface CreateBookData {
  isbn: string;
  title: string;
  author: string;
  total: number;
  category: string;
  publishedYear: number;
  cover: string;
  description: string;
}

export interface CreateRequestData {
  bookId: string;
  type: 'reservation' | 'renewal';
}

export interface CreateLoanData {
  bookId: string;
  studentId: string;
  studentName: string;
}

// LocalStorage keys
const BOOKS_KEY = 'library_books';
const REQUESTS_KEY = 'library_requests';
const LOANS_KEY = 'library_loans';
const FINES_KEY = 'library_fines';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Books API
export const booksApi = {
  // Get all books
  getAll: (): Promise<Book[]> => {
    return new Promise((resolve) => {
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      resolve(books);
    });
  },

  // Search books
  search: (query: string): Promise<Book[]> => {
    return new Promise((resolve) => {
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.isbn.includes(query) ||
        book.category.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    });
  },

  // Create new book
  create: (data: CreateBookData): Promise<Book> => {
    return new Promise((resolve) => {
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      const newBook: Book = {
        id: generateId(),
        ...data,
        available: data.total,
        rating: 0,
        createdAt: new Date().toISOString()
      };
      
      books.unshift(newBook);
      saveToStorage(BOOKS_KEY, books);
      resolve(newBook);
    });
  },

  // Update book
  update: (id: string, data: Partial<Book>): Promise<Book> => {
    return new Promise((resolve, reject) => {
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      const index = books.findIndex(book => book.id === id);
      
      if (index === -1) {
        reject(new Error('Book not found'));
        return;
      }
      
      books[index] = { ...books[index], ...data };
      saveToStorage(BOOKS_KEY, books);
      resolve(books[index]);
    });
  },

  // Delete book
  delete: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      const index = books.findIndex(book => book.id === id);
      
      if (index === -1) {
        reject(new Error('Book not found'));
        return;
      }
      
      books.splice(index, 1);
      saveToStorage(BOOKS_KEY, books);
      resolve();
    });
  }
};

// Requests API
export const requestsApi = {
  // Get all requests
  getAll: (): Promise<BookRequest[]> => {
    return new Promise((resolve) => {
      const requests = getFromStorage<BookRequest[]>(REQUESTS_KEY, []);
      resolve(requests);
    });
  },

  // Get pending requests
  getPending: (): Promise<BookRequest[]> => {
    return new Promise((resolve) => {
      const requests = getFromStorage<BookRequest[]>(REQUESTS_KEY, []);
      const pending = requests.filter(req => req.status === 'pending');
      resolve(pending);
    });
  },

  // Get user requests
  getUserRequests: (studentId: string): Promise<BookRequest[]> => {
    return new Promise((resolve) => {
      const requests = getFromStorage<BookRequest[]>(REQUESTS_KEY, []);
      const userRequests = requests.filter(req => req.studentId === studentId);
      resolve(userRequests);
    });
  },

  // Create new request
  create: (data: CreateRequestData, studentId: string, studentName: string): Promise<BookRequest> => {
    return new Promise((resolve, reject) => {
      const requests = getFromStorage<BookRequest[]>(REQUESTS_KEY, []);
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      
      const book = books.find(b => b.id === data.bookId);
      if (!book) {
        reject(new Error('Book not found'));
        return;
      }
      
      const newRequest: BookRequest = {
        id: generateId(),
        studentId,
        studentName,
        bookId: data.bookId,
        bookTitle: book.title,
        type: data.type,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      
      requests.unshift(newRequest);
      saveToStorage(REQUESTS_KEY, requests);
      resolve(newRequest);
    });
  },

  // Approve request
  approve: (id: string): Promise<BookRequest> => {
    return new Promise((resolve, reject) => {
      const requests = getFromStorage<BookRequest[]>(REQUESTS_KEY, []);
      const index = requests.findIndex(req => req.id === id);
      
      if (index === -1) {
        reject(new Error('Request not found'));
        return;
      }
      
      requests[index] = {
        ...requests[index],
        status: 'approved',
        processedAt: new Date().toISOString()
      };
      
      saveToStorage(REQUESTS_KEY, requests);
      resolve(requests[index]);
    });
  },

  // Deny request
  deny: (id: string): Promise<BookRequest> => {
    return new Promise((resolve, reject) => {
      const requests = getFromStorage<BookRequest[]>(REQUESTS_KEY, []);
      const index = requests.findIndex(req => req.id === id);
      
      if (index === -1) {
        reject(new Error('Request not found'));
        return;
      }
      
      requests[index] = {
        ...requests[index],
        status: 'denied',
        processedAt: new Date().toISOString()
      };
      
      saveToStorage(REQUESTS_KEY, requests);
      resolve(requests[index]);
    });
  }
};

// Loans API
export const loansApi = {
  // Get all loans
  getAll: (): Promise<Loan[]> => {
    return new Promise((resolve) => {
      const loans = getFromStorage<Loan[]>(LOANS_KEY, []);
      resolve(loans);
    });
  },

  // Get active loans
  getActive: (): Promise<Loan[]> => {
    return new Promise((resolve) => {
      const loans = getFromStorage<Loan[]>(LOANS_KEY, []);
      const active = loans.filter(loan => loan.status === 'active');
      resolve(active);
    });
  },

  // Get user loans
  getUserLoans: (studentId: string): Promise<Loan[]> => {
    return new Promise((resolve) => {
      const loans = getFromStorage<Loan[]>(LOANS_KEY, []);
      const userLoans = loans.filter(loan => loan.studentId === studentId);
      resolve(userLoans);
    });
  },

  // Create new loan
  create: (data: CreateLoanData): Promise<Loan> => {
    return new Promise((resolve, reject) => {
      const loans = getFromStorage<Loan[]>(LOANS_KEY, []);
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      
      const book = books.find(b => b.id === data.bookId);
      if (!book) {
        reject(new Error('Book not found'));
        return;
      }
      
      if (book.available <= 0) {
        reject(new Error('Book not available'));
        return;
      }
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
      
      const newLoan: Loan = {
        id: generateId(),
        studentId: data.studentId,
        studentName: data.studentName,
        bookId: data.bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        issuedAt: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        status: 'active',
        fine: 0
      };
      
      loans.unshift(newLoan);
      saveToStorage(LOANS_KEY, loans);
      
      // Update book availability
      const updatedBooks = books.map(b => 
        b.id === data.bookId ? { ...b, available: b.available - 1 } : b
      );
      saveToStorage(BOOKS_KEY, updatedBooks);
      
      resolve(newLoan);
    });
  },

  // Return book
  returnBook: (id: string): Promise<Loan> => {
    return new Promise((resolve, reject) => {
      const loans = getFromStorage<Loan[]>(LOANS_KEY, []);
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      const index = loans.findIndex(loan => loan.id === id);
      
      if (index === -1) {
        reject(new Error('Loan not found'));
        return;
      }
      
      const loan = loans[index];
      const returnedAt = new Date();
      const dueDate = new Date(loan.dueDate);
      const isOverdue = returnedAt > dueDate;
      
      loans[index] = {
        ...loan,
        returnedAt: returnedAt.toISOString(),
        status: isOverdue ? 'overdue' : 'returned'
      };
      
      saveToStorage(LOANS_KEY, loans);
      
      // Update book availability
      const updatedBooks = books.map(b => 
        b.id === loan.bookId ? { ...b, available: b.available + 1 } : b
      );
      saveToStorage(BOOKS_KEY, updatedBooks);
      
      resolve(loans[index]);
    });
  }
};

// Fines API
export const finesApi = {
  // Get all fines
  getAll: (): Promise<Fine[]> => {
    return new Promise((resolve) => {
      const fines = getFromStorage<Fine[]>(FINES_KEY, []);
      resolve(fines);
    });
  },

  // Get user fines
  getUserFines: (studentId: string): Promise<Fine[]> => {
    return new Promise((resolve) => {
      const fines = getFromStorage<Fine[]>(FINES_KEY, []);
      const userFines = fines.filter(fine => fine.studentId === studentId);
      resolve(userFines);
    });
  },

  // Create fine
  create: (studentId: string, studentName: string, loanId: string, bookTitle: string, amount: number, reason: string): Promise<Fine> => {
    return new Promise((resolve) => {
      const fines = getFromStorage<Fine[]>(FINES_KEY, []);
      
      const newFine: Fine = {
        id: generateId(),
        studentId,
        studentName,
        loanId,
        bookTitle,
        amount,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      fines.unshift(newFine);
      saveToStorage(FINES_KEY, fines);
      resolve(newFine);
    });
  },

  // Mark fine as paid
  markPaid: (id: string): Promise<Fine> => {
    return new Promise((resolve, reject) => {
      const fines = getFromStorage<Fine[]>(FINES_KEY, []);
      const index = fines.findIndex(fine => fine.id === id);
      
      if (index === -1) {
        reject(new Error('Fine not found'));
        return;
      }
      
      fines[index] = {
        ...fines[index],
        status: 'paid',
        paidAt: new Date().toISOString()
      };
      
      saveToStorage(FINES_KEY, fines);
      resolve(fines[index]);
    });
  }
};

// Analytics API
export const libraryAnalyticsApi = {
  getAnalytics: (): Promise<{
    totalBooks: number;
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    totalFines: number;
    pendingFines: number;
  }> => {
    return new Promise((resolve) => {
      const books = getFromStorage<Book[]>(BOOKS_KEY, []);
      const loans = getFromStorage<Loan[]>(LOANS_KEY, []);
      const fines = getFromStorage<Fine[]>(FINES_KEY, []);
      
      const activeLoans = loans.filter(loan => loan.status === 'active').length;
      const overdueLoans = loans.filter(loan => {
        if (loan.status !== 'active') return false;
        return new Date(loan.dueDate) < new Date();
      }).length;
      
      const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
      const pendingFines = fines.filter(fine => fine.status === 'pending').reduce((sum, fine) => sum + fine.amount, 0);
      
      resolve({
        totalBooks: books.length,
        totalLoans: loans.length,
        activeLoans,
        overdueLoans,
        totalFines,
        pendingFines
      });
    });
  }
};
