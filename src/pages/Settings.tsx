import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { markAllRead } from '@/lib/services/notifications';
import { toast } from 'sonner';
import { User, Bell, Shield, Palette, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = fullName.trim() !== (user?.full_name ?? '') && fullName.trim().length > 0;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateProfile({ full_name: fullName.trim() });
    setSaving(false);
    toast.success('Profile updated');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <h1 className="mb-8">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ''} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role ?? 'Student'} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Roles are managed by the administrator.
              </p>
            </div>
            <Button onClick={handleSave} disabled={!dirty || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cyber theme</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between the Classic light theme and the Cyber dark theme.
                </p>
              </div>
              <Switch checked={theme === 'cyber'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-app toasts</Label>
                <p className="text-sm text-muted-foreground">
                  Show popup confirmations for actions like orders and bookings.
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (user) markAllRead(user.id);
                toast.success('All notifications marked as read');
              }}
            >
              Mark all notifications read
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This demo uses a local credential store. In production, authentication is handled by
              Clerk and passwords are never stored by the application.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
