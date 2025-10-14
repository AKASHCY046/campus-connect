// Book request and renewal management system
import { useState, useEffect } from 'react';

// Types for book requests and renewals
export interface BookRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookISBN: string;
  type: 'reservation' | 'renewal';
  status: 'pending' | 'approved' | 'denied';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  reason?: string;
  dueDate?: string;
  librarianNotes?: string;
}

export interface BookRenewal {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  currentDueDate: string;
  newDueDate?: string;
  type: 'renewal';
  status: 'pending' | 'approved' | 'denied';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  reason?: string;
  librarianNotes?: string;
}

// Mock data for demonstration
const initialRequests: BookRequest[] = [
  {
    id: 'req_001',
    studentId: 'student_001',
    studentName: 'John Doe',
    studentEmail: 'john.doe@campus.edu',
    bookId: 'book_001',
    bookTitle: 'Clean Code',
    bookAuthor: 'Robert C. Martin',
    bookISBN: '9780132350884',
    type: 'reservation',
    status: 'pending',
    requestDate: '2025-10-14T10:30:00Z',
    dueDate: '2025-10-28T17:00:00Z'
  },
  {
    id: 'req_002',
    studentId: 'student_002',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@campus.edu',
    bookId: 'book_002',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    bookISBN: '9780735211292',
    type: 'renewal',
    status: 'pending',
    requestDate: '2025-10-14T11:15:00Z',
    dueDate: '2025-10-20T17:00:00Z'
  }
];

// Global state management for book requests
let requests: BookRequest[] = [...initialRequests];
let listeners: Array<() => void> = [];

// Notify all listeners of state changes
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Book request management functions
export const useBookRequests = () => {
  const [bookRequests, setBookRequests] = useState<BookRequest[]>(requests);

  useEffect(() => {
    const listener = () => setBookRequests([...requests]);
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return bookRequests;
};

// Add new book request
export const addBookRequest = (request: Omit<BookRequest, 'id' | 'requestDate' | 'status'>) => {
  const newRequest: BookRequest = {
    ...request,
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    requestDate: new Date().toISOString(),
    status: 'pending'
  };
  
  requests.push(newRequest);
  notifyListeners();
  return newRequest;
};

// Add book renewal request
export const addBookRenewal = (renewal: Omit<BookRenewal, 'id' | 'requestDate' | 'status' | 'type'>) => {
  const newRenewal: BookRequest = {
    ...renewal,
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    requestDate: new Date().toISOString(),
    status: 'pending',
    type: 'renewal'
  };
  
  requests.push(newRenewal);
  notifyListeners();
  return newRenewal;
};

// Update request status (for librarian)
export const updateRequestStatus = (
  requestId: string, 
  status: 'approved' | 'denied', 
  processedBy: string,
  librarianNotes?: string
) => {
  const requestIndex = requests.findIndex(req => req.id === requestId);
  if (requestIndex !== -1) {
    requests[requestIndex] = {
      ...requests[requestIndex],
      status,
      processedDate: new Date().toISOString(),
      processedBy,
      librarianNotes
    };
    notifyListeners();
    return requests[requestIndex];
  }
  return null;
};

// Get requests by student ID
export const getRequestsByStudent = (studentId: string) => {
  return requests.filter(req => req.studentId === studentId);
};

// Get pending requests (for librarian)
export const getPendingRequests = () => {
  return requests.filter(req => req.status === 'pending');
};

// Get requests by status
export const getRequestsByStatus = (status: 'pending' | 'approved' | 'denied') => {
  return requests.filter(req => req.status === status);
};

// Get request by ID
export const getRequestById = (requestId: string) => {
  return requests.find(req => req.id === requestId);
};

// Delete request
export const deleteRequest = (requestId: string) => {
  const requestIndex = requests.findIndex(req => req.id === requestId);
  if (requestIndex !== -1) {
    requests.splice(requestIndex, 1);
    notifyListeners();
    return true;
  }
  return false;
};

// Get request statistics
export const getRequestStats = () => {
  const total = requests.length;
  const pending = requests.filter(req => req.status === 'pending').length;
  const approved = requests.filter(req => req.status === 'approved').length;
  const denied = requests.filter(req => req.status === 'denied').length;
  
  return {
    total,
    pending,
    approved,
    denied
  };
};

// Format date for display
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
};
