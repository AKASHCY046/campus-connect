import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, BookOpen, Clock, IndianRupee, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { AddNewBookDialog } from '@/components/dialogs/AddNewBookDialog';
import { EditBookDialog } from '@/components/dialogs/EditBookDialog';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import {
  getBooks,
  getIssuedBooks,
  getFines,
  returnBook,
  payFine,
  updateIssuedBookStatus,
  approveRequest,
  deleteBook,
} from '@/lib/services/library';
import { queryKeys, invalidateQueriesForMutation } from '@/lib/query-utils';
import { pushNotification } from '@/lib/services/notifications';

const TABS = ['requests', 'inventory', 'loans', 'fines'] as const;
type Tab = (typeof TABS)[number];

export default function LibrarianDashboard() {
  const { theme } = useTheme();
  const { getAllUsers } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inventorySearch, setInventorySearch] = React.useState('');

  const nameFor = React.useCallback(
    (userId?: string, fallback?: string | null) => {
      if (fallback) return fallback;
      return getAllUsers().find((u) => u.id === userId)?.full_name || 'Student';
    },
    [getAllUsers],
  );

  const tab = React.useMemo<Tab>(() => {
    const t = new URLSearchParams(location.search).get('tab') as Tab;
    return TABS.includes(t) ? t : 'requests';
  }, [location.search]);

  const setTab = (t: string) => navigate(`/librarian?tab=${t}`, { replace: true });
  const refresh = () => invalidateQueriesForMutation(queryClient, 'library');

  const { data: allIssued = [], isLoading: loadingIssued } = useQuery({
    queryKey: queryKeys.requests.all,
    queryFn: () => getIssuedBooks(),
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: queryKeys.books.all,
    queryFn: () => getBooks(),
  });

  const { data: fines = [], isLoading: loadingFines } = useQuery({
    queryKey: queryKeys.fines.all,
    queryFn: () => getFines(),
  });

  const requests = allIssued.filter((r) => r.status === 'requested');
  const loans = allIssued.filter((r) => r.status === 'issued' || r.status === 'overdue');
  const pendingFines = fines.filter((f) => f.status === 'pending');

  const filteredInventory = React.useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.isbn ?? '').includes(inventorySearch),
    );
  }, [inventory, inventorySearch]);

  const requestMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'issued' | 'denied' }) => {
      const req = requests.find((r) => r.id === id);
      if (action === 'issued' && req) {
        return approveRequest(
          id,
          req.book_id,
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        );
      }
      return updateIssuedBookStatus(id, action);
    },
    onSuccess: (_data, { id, action }) => {
      refresh();
      const req = requests.find((r) => r.id === id);
      if (req?.user_id) {
        pushNotification(req.user_id, {
          title: action === 'issued' ? 'Book request approved' : 'Book request declined',
          message:
            action === 'issued'
              ? `"${req.book?.title ?? 'Your book'}" is ready to collect from the library desk.`
              : `Your request for "${req.book?.title ?? 'a book'}" was declined.`,
          type: action === 'issued' ? 'success' : 'warning',
        });
      }
      toast.success(action === 'issued' ? 'Request approved' : 'Request denied');
    },
    onError: () => toast.error('Could not update the request'),
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => returnBook(id),
    onSuccess: () => {
      refresh();
      toast.success('Book marked as returned');
    },
    onError: () => toast.error('Could not mark the book returned'),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => payFine(id),
    onSuccess: () => {
      refresh();
      toast.success('Fine cleared');
    },
    onError: () => toast.error('Could not update the fine'),
  });

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">
          <span className={theme === 'cyber' ? 'text-gradient' : ''}>Librarian Dashboard</span>
        </h1>
        <p className="text-muted-foreground">Approve requests, manage the catalogue and track fines.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Inbox} tint="text-amber-500" value={requests.length} label="Pending requests" />
        <Stat icon={BookOpen} tint="text-blue-500" value={inventory.length} label="Titles in catalogue" />
        <Stat icon={Clock} tint="text-violet-500" value={loans.length} label="Books on loan" />
        <Stat
          icon={IndianRupee}
          tint="text-emerald-500"
          value={`₹${pendingFines.reduce((s, f) => s + Number(f.amount), 0)}`}
          label="Fines outstanding"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card className="p-6">
            <h2 className="mb-4">Pending requests</h2>
            {loadingIssued ? (
              <Loading />
            ) : requests.length === 0 ? (
              <Empty>No pending requests right now.</Empty>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{req.book?.title || 'Unknown book'}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested by {nameFor(req.user_id, req.profiles?.full_name)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => requestMutation.mutate({ id: req.id, action: 'issued' })}
                        disabled={requestMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestMutation.mutate({ id: req.id, action: 'denied' })}
                        disabled={requestMutation.isPending}
                      >
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2>Catalogue</h2>
              <AddNewBookDialog onCreate={refresh} />
            </div>
            <div className="relative mb-4 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, author or ISBN…"
                className="pl-9"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>
            {loadingInventory ? (
              <Loading />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="hidden sm:table-cell">ISBN</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                          No books match your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell className="text-muted-foreground">{book.author}</TableCell>
                          <TableCell className="hidden font-mono text-xs sm:table-cell">
                            {book.isbn || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={book.available_copies > 0 ? 'secondary' : 'destructive'}>
                              {book.available_copies}/{book.total_copies}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <EditBookDialog book={book} onSuccess={refresh} />
                              <DeleteConfirmationDialog
                                title="Delete book"
                                description={`Remove "${book.title}" from the catalogue?`}
                                onConfirm={() => deleteBook(book.id)}
                                successMessage={`"${book.title}" deleted`}
                                onSuccess={refresh}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card className="p-6">
            <h2 className="mb-4">Active loans</h2>
            {loadingIssued ? (
              <Loading />
            ) : loans.length === 0 ? (
              <Empty>No books are currently on loan.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => {
                      const overdue =
                        loan.status === 'overdue' || new Date(loan.due_date) < new Date();
                      return (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            {loan.book?.title || 'Unknown book'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {nameFor(loan.user_id, loan.profiles?.full_name)}
                          </TableCell>
                          <TableCell className={overdue ? 'font-medium text-destructive' : ''}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => returnMutation.mutate(loan.id)}
                              disabled={returnMutation.isPending}
                            >
                              Mark returned
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="fines">
          <Card className="p-6">
            <h2 className="mb-4">Fines &amp; dues</h2>
            {loadingFines ? (
              <Loading />
            ) : pendingFines.length === 0 ? (
              <Empty>No outstanding fines.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Raised</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingFines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell className="text-muted-foreground">
                          {nameFor(fine.user_id, fine.profiles?.full_name)}
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          ₹{Number(fine.amount)}
                        </TableCell>
                        <TableCell>{new Date(fine.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => payMutation.mutate(fine.id)}
                            disabled={payMutation.isPending}
                          >
                            Mark paid
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  icon: Icon,
  tint,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Card className="p-5">
      <Icon className={`mb-3 h-7 w-7 ${tint}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-14">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-14 text-center text-muted-foreground">{children}</p>;
}
