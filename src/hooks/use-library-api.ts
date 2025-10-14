import { useState, useEffect, useCallback } from 'react';
import { 
  booksApi, 
  requestsApi, 
  loansApi, 
  finesApi, 
  libraryAnalyticsApi,
  Book, 
  BookRequest, 
  Loan, 
  Fine, 
  CreateBookData, 
  CreateRequestData, 
  CreateLoanData 
} from '@/lib/library-api';
import { useUser } from '@clerk/clerk-react';

// Books hooks
export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await booksApi.getAll();
      setBooks(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const searchBooks = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await booksApi.search(query);
      setBooks(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search books');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBook = useCallback(async (data: CreateBookData) => {
    try {
      const newBook = await booksApi.create(data);
      setBooks(prev => [newBook, ...prev]);
      return newBook;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create book');
    }
  }, []);

  const updateBook = useCallback(async (id: string, data: Partial<Book>) => {
    try {
      const updatedBook = await booksApi.update(id, data);
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
      return updatedBook;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update book');
    }
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    try {
      await booksApi.delete(id);
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete book');
    }
  }, []);

  return {
    books,
    loading,
    error,
    refetch: fetchBooks,
    searchBooks,
    createBook,
    updateBook,
    deleteBook,
  };
};

// Requests hooks
export const useRequests = () => {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await requestsApi.getAll();
      setRequests(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = useCallback(async (data: CreateRequestData) => {
    try {
      const newRequest = await requestsApi.create(data, 'current_user', 'Current User');
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create request');
    }
  }, []);

  const approveRequest = useCallback(async (id: string) => {
    try {
      const approvedRequest = await requestsApi.approve(id);
      setRequests(prev => prev.map(req => req.id === id ? approvedRequest : req));
      return approvedRequest;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to approve request');
    }
  }, []);

  const denyRequest = useCallback(async (id: string) => {
    try {
      const deniedRequest = await requestsApi.deny(id);
      setRequests(prev => prev.map(req => req.id === id ? deniedRequest : req));
      return deniedRequest;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to deny request');
    }
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    approveRequest,
    denyRequest,
  };
};

// Loans hooks
export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await loansApi.getAll();
      setLoans(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const createLoan = useCallback(async (data: CreateLoanData) => {
    try {
      const newLoan = await loansApi.create(data);
      setLoans(prev => [newLoan, ...prev]);
      return newLoan;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create loan');
    }
  }, []);

  const returnBook = useCallback(async (id: string) => {
    try {
      const returnedLoan = await loansApi.returnBook(id);
      setLoans(prev => prev.map(loan => loan.id === id ? returnedLoan : loan));
      return returnedLoan;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to return book');
    }
  }, []);

  return {
    loans,
    loading,
    error,
    refetch: fetchLoans,
    createLoan,
    returnBook,
  };
};

// User loans hook
export const useUserLoans = () => {
  const { user } = useUser();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = user?.id || 'anonymous';
  const studentName = user?.fullName || user?.firstName || 'Student';

  const fetchUserLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userLoans = await loansApi.getUserLoans(studentId);
      setLoans(userLoans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user loans');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId !== 'anonymous') {
      fetchUserLoans();
    }
  }, [fetchUserLoans, studentId]);

  return {
    loans,
    loading,
    error,
    refetch: fetchUserLoans,
    studentId,
    studentName,
  };
};

// Fines hooks
export const useFines = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await finesApi.getAll();
      setFines(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  const markFinePaid = useCallback(async (id: string) => {
    try {
      const paidFine = await finesApi.markPaid(id);
      setFines(prev => prev.map(fine => fine.id === id ? paidFine : fine));
      return paidFine;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark fine as paid');
    }
  }, []);

  return {
    fines,
    loading,
    error,
    refetch: fetchFines,
    markFinePaid,
  };
};

// User fines hook
export const useUserFines = () => {
  const { user } = useUser();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = user?.id || 'anonymous';

  const fetchUserFines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userFines = await finesApi.getUserFines(studentId);
      setFines(userFines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user fines');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId !== 'anonymous') {
      fetchUserFines();
    }
  }, [fetchUserFines, studentId]);

  return {
    fines,
    loading,
    error,
    refetch: fetchUserFines,
    studentId,
  };
};

// Analytics hook
export const useLibraryAnalytics = () => {
  const [analytics, setAnalytics] = useState<{
    totalBooks: number;
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    totalFines: number;
    pendingFines: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryAnalyticsApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
