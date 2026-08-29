import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Shield, Ban, Trash2, Key, Copy, Users, UserCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { generateInviteCode, getAllCodes, deleteCode, InviteRole } from '@/lib/invitationCodes';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const { user, getAllUsers, blockUser, unblockUser, deleteUser } = useAuth();
  const [users, setUsers] = useState(getAllUsers());
  const [inviteCodes, setInviteCodes] = useState(getAllCodes());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<InviteRole>('Professor');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const refresh = () => {
    setUsers(getAllUsers());
    setInviteCodes(getAllCodes());
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const activeCount = users.filter((u) => u.is_active !== false && u.status !== 'BLOCKED').length;
  const blockedCount = users.length - activeCount;
  const availableCodes = inviteCodes.filter((c) => !c.usedBy).length;

  const handleBlock = (userId: string, isBlocked: boolean) => {
    if (isBlocked) {
      unblockUser(userId);
      toast.success('User unblocked');
    } else {
      blockUser(userId);
      toast.success('User blocked');
    }
    refresh();
  };

  const handleDelete = (userId: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    deleteUser(userId);
    toast.success('User deleted');
    refresh();
  };

  const handleGenerateCode = () => {
    const entry = generateInviteCode(inviteRole, user?.id);
    setGeneratedCode(entry.code);
    setInviteCodes(getAllCodes());
    toast.success(`Invitation code generated for ${inviteRole}`);
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success('Code copied');
  };

  const handleDeleteCode = (code: string) => {
    deleteCode(code);
    setInviteCodes(getAllCodes());
    toast.success('Invitation code deleted');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2">
            <span className={theme === 'cyber' ? 'text-gradient' : ''}>Admin Console</span>
          </h1>
          <p className="text-muted-foreground">Manage people, roles and staff invitation codes.</p>
        </div>
        <Button
          onClick={() => {
            setShowInviteModal(true);
            setGeneratedCode(null);
          }}
        >
          <Key className="mr-2 h-4 w-4" />
          New invite code
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Users} tint="text-blue-500" value={users.length} label="Total users" />
        <Stat icon={UserCheck} tint="text-emerald-500" value={activeCount} label="Active" />
        <Stat icon={Ban} tint="text-destructive" value={blockedCount} label="Blocked" />
        <Stat icon={KeyRound} tint="text-amber-500" value={availableCodes} label="Unused codes" />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:w-72">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="codes">Invite codes</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <Input
                placeholder="Search by name, email or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isBlocked = u.is_active === false || u.status === 'BLOCKED';
                    const isProtected = u.role === 'Admin';
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              isBlocked
                                ? 'bg-destructive hover:bg-destructive'
                                : 'bg-emerald-500 hover:bg-emerald-500'
                            }
                          >
                            {isBlocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          {isProtected ? (
                            <span className="text-xs text-muted-foreground">Protected</span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant={isBlocked ? 'default' : 'outline'}
                                onClick={() => handleBlock(u.id, isBlocked)}
                              >
                                {isBlocked ? 'Unblock' : 'Block'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(u.id, u.full_name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="codes">
          <Card className="p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Only codes listed here are valid for staff sign-up. Share a code with a new professor,
              librarian or canteen staff member.
            </p>
            {inviteCodes.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No invitation codes yet. Generate one from the button above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inviteCodes.map((c) => (
                      <TableRow key={c.code}>
                        <TableCell className="font-mono font-medium">{c.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{c.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.usedBy ? 'secondary' : 'default'}>
                            {c.usedBy ? 'Used' : 'Available'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => copyCode(c.code)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          {!c.usedBy && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCode(c.code)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate invitation code</DialogTitle>
            <DialogDescription>Create a one-time code for staff registration.</DialogDescription>
          </DialogHeader>

          {generatedCode ? (
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">Share this code with the new staff member:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-bold text-primary">{generatedCode}</span>
                <Button variant="outline" size="sm" onClick={() => copyCode(generatedCode)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Role: {inviteRole}</p>
              <Button onClick={() => setShowInviteModal(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as InviteRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor (Faculty)</SelectItem>
                    <SelectItem value="Librarian">Librarian</SelectItem>
                    <SelectItem value="Canteen Staff">Canteen In-charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateCode} className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Generate code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
