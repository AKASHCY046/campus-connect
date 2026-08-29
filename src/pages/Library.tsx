import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Search,
  RotateCcw,
  IndianRupee,
  Clock,
  Star,
  Loader2,
  Undo2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  getIssuedBooks,
  getFines,
  requestBook,
  returnBook,
  payFine,
  type Book,
  type IssuedBook,
} from '@/lib/services/library';
import { ComingSoonBooksPanel } from '@/components/ComingSoonBooksPanel';
import { pushNotification } from '@/lib/services/notifications';
import { toast } from 'sonner';
import { queryKeys, invalidateQueriesForMutation } from '@/lib/query-utils';

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-amber-500 hover:bg-amber-500',
  issued: 'bg-primary hover:bg-primary',
  overdue: 'bg-destructive hover:bg-destructive',
  returned: 'bg-emerald-500 hover:bg-emerald-500',
  denied: 'bg-muted-foreground hover:bg-muted-foreground',
};

export default function Library() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [returnOpen, setReturnOpen] = useState(false);

  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: queryKeys.books.all,
    queryFn: () => getBooks(),
  });

  const { data: issuedBooks = [], isLoading: loadingIssued } = useQuery({
    queryKey: queryKeys.requests.user(user?.id || ''),
    queryFn: () => getIssuedBooks(user?.id),
    enabled: !!user?.id,
  });

  const { data: fines = [] } = useQuery({
    queryKey: queryKeys.fines.user(user?.id || ''),
    queryFn: () => getFines(user?.id),
    enabled: !!user?.id,
  });

  const refresh = () => invalidateQueriesForMutation(queryClient, 'library');

  const requestMutation = useMutation({
    mutationFn: (bookId: string) => {
      if (!user?.id) throw new Error('Please sign in first');
      return requestBook(bookId, user.id);
    },
    onSuccess: (_data, bookId) => {
      refresh();
      const book = books.find((b) => b.id === bookId);
      if (user) {
        pushNotification(user.id, {
          title: 'Book request submitted',
          message: `Your request for "${book?.title ?? 'a book'}" is awaiting librarian approval.`,
        });
      }
      toast.success('Book requested — pending librarian approval');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to request book'),
  });

  const returnMutation = useMutation({
    mutationFn: (issuedId: string) => returnBook(issuedId),
    onSuccess: () => {
      refresh();
      setReturnOpen(false);
      toast.success('Book returned. Thank you!');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to return book'),
  });

  const payMutation = useMutation({
    mutationFn: (fineId: string) => payFine(fineId),
    onSuccess: () => {
      refresh();
      toast.success('Fine paid');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Payment failed'),
  });

  const q = search.trim().toLowerCase();
  const filteredBooks = useMemo(
    () =>
      q
        ? books.filter((b) =>
            `${b.title} ${b.author} ${b.isbn ?? ''} ${b.category ?? ''}`.toLowerCase().includes(q),
          )
        : books,
    [books, q],
  );

  const activeBooks = issuedBooks.filter((b) => ['requested', 'issued', 'overdue'].includes(b.status));
  const returnable = issuedBooks.filter((b) => b.status === 'issued' || b.status === 'overdue');
  const history = issuedBooks.filter((b) => b.status === 'returned' || b.status === 'denied');
  const pendingFines = fines.filter((f) => f.status === 'pending');
  const totalFine = pendingFines.reduce((sum, f) => sum + Number(f.amount), 0);
  const issuedCount = issuedBooks.filter((b) => b.status === 'issued' || b.status === 'overdue').length;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">
          <span className={theme === 'cyber' ? 'text-gradient' : ''}>Library</span>
        </h1>
        <p className="text-muted-foreground">Browse the catalogue, manage your loans and clear fines.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} tint="text-blue-500" value={issuedCount} label="Books on loan" />
        <StatCard icon={Clock} tint="text-violet-500" value={activeBooks.filter((b) => b.status === 'requested').length} label="Pending requests" />
        <StatCard icon={IndianRupee} tint="text-amber-500" value={`₹${totalFine}`} label="Outstanding fines" />
        <StatCard icon={RotateCcw} tint="text-emerald-500" value={history.length} label="Past loans" />
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="mybooks">My Books</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Browse */}
        <TabsContent value="browse" className="space-y-6">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, ISBN or category…"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingBooks ? (
            <Loading />
          ) : filteredBooks.length === 0 ? (
            <Empty>No books match “{search}”.</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onReserve={() => requestMutation.mutate(book.id)}
                  reserving={requestMutation.isPending && requestMutation.variables === book.id}
                  alreadyRequested={activeBooks.some((b) => b.book_id === book.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Books */}
        <TabsContent value="mybooks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2>Current loans &amp; requests</h2>
            <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={returnable.length === 0}>
                  <Undo2 className="h-4 w-4" /> Return a book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Return a book</DialogTitle>
                  <DialogDescription>Select a book to return to the library.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {returnable.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{b.book?.title || 'Book'}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(b.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => returnMutation.mutate(b.id)}
                        disabled={returnMutation.isPending}
                      >
                        {returnMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Return'}
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingIssued ? (
            <Loading />
          ) : activeBooks.length === 0 ? (
            <Empty>You have no active loans or requests. Browse the catalogue to reserve a book.</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeBooks.map((b) => (
                <LoanCard key={b.id} loan={b} onReturn={() => returnMutation.mutate(b.id)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Fines */}
        <TabsContent value="fines" className="space-y-4">
          <h2>Fines</h2>
          {pendingFines.length === 0 ? (
            <Empty>You have no outstanding fines. Nice work!</Empty>
          ) : (
            <div className="space-y-3">
              {pendingFines.map((f) => (
                <Card key={f.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-destructive">₹{Number(f.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Raised {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => payMutation.mutate(f.id)}
                    disabled={payMutation.isPending}
                  >
                    {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay fine'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <h2>Loan history</h2>
          {history.length === 0 ? (
            <Empty>Nothing here yet — your returned books will appear here.</Empty>
          ) : (
            <div className="space-y-3">
              {history.map((b) => (
                <Card key={b.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{b.book?.title || 'Book'}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.return_date
                        ? `Returned ${new Date(b.return_date).toLocaleDateString()}`
                        : 'Request closed'}
                    </p>
                  </div>
                  <Badge className={STATUS_STYLES[b.status]}>{b.status}</Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <ComingSoonBooksPanel />
      </div>
    </div>
  );
}

function StatCard({
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

function BookCard({
  book,
  onReserve,
  reserving,
  alreadyRequested,
}: {
  book: Book;
  onReserve: () => void;
  reserving: boolean;
  alreadyRequested: boolean;
}) {
  const unavailable = book.available_copies <= 0;
  return (
    <Card className="flex gap-4 p-4">
      <img
        src={book.cover_image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=300&fit=crop'}
        alt=""
        loading="lazy"
        className="h-28 w-20 shrink-0 rounded-md object-cover shadow-card"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold">{book.title}</h3>
          {book.rating ? (
            <span className="flex shrink-0 items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {Number(book.rating).toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="mb-1 text-xs text-muted-foreground">{book.author}</p>
        {book.category && (
          <Badge variant="outline" className="mb-3 w-fit text-[11px]">
            {book.category}
          </Badge>
        )}
        <div className="mt-auto flex items-center justify-between">
          <Badge variant={unavailable ? 'destructive' : 'secondary'} className="font-normal">
            {unavailable ? 'Unavailable' : `${book.available_copies} available`}
          </Badge>
          <Button
            size="sm"
            variant={alreadyRequested ? 'outline' : 'default'}
            disabled={unavailable || reserving || alreadyRequested}
            onClick={onReserve}
          >
            {reserving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : alreadyRequested ? (
              'Requested'
            ) : (
              'Reserve'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function LoanCard({ loan, onReturn }: { loan: IssuedBook; onReturn: () => void }) {
  const due = new Date(loan.due_date);
  const overdue = loan.status === 'overdue' || (loan.status === 'issued' && due < new Date());
  return (
    <Card className={`p-5 ${overdue ? 'border-destructive/60' : ''}`}>
      <div className="flex gap-4">
        <img
          src={loan.book?.cover_image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=300&fit=crop'}
          alt=""
          loading="lazy"
          className="h-28 w-20 shrink-0 rounded-md object-cover shadow-card"
        />
        <div className="flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-bold">{loan.book?.title || 'Book'}</h3>
            <Badge className={STATUS_STYLES[overdue ? 'overdue' : loan.status]}>
              {overdue ? 'overdue' : loan.status}
            </Badge>
          </div>
          <p className="mb-2 text-sm text-muted-foreground">{loan.book?.author || 'Unknown author'}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Due date</span>
            <span className={overdue ? 'font-medium text-destructive' : ''}>
              {due.toLocaleDateString()}
            </span>
          </div>
          {(loan.status === 'issued' || loan.status === 'overdue') && (
            <Button size="sm" variant="outline" className="mt-3 w-full gap-2" onClick={onReturn}>
              <Undo2 className="h-4 w-4" /> Return
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-16 text-center text-muted-foreground">{children}</p>;
}
