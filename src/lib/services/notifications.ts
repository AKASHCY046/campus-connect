import { api } from '../apiClient';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'normal' | 'high';
  read: boolean;
  created_at: string;
}

const KEY = 'campus_notifications';

function readAll(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(items: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function seedFor(userId: string): AppNotification[] {
  const now = Date.now();
  return [
    {
      id: `seed-${userId}-welcome`,
      user_id: userId,
      title: 'Welcome to Campus Connect',
      message: 'Explore the library, canteen, academic hub and campus services from your dashboard.',
      type: 'success',
      priority: 'normal',
      read: false,
      created_at: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      id: `seed-${userId}-tip`,
      user_id: userId,
      title: 'Tip: Pre-order your lunch',
      message: 'Beat the queue — order ahead in the Canteen and pick up with your token number.',
      type: 'info',
      priority: 'normal',
      read: false,
      created_at: new Date(now - 1000 * 60 * 90).toISOString(),
    },
  ];
}

export async function getNotifications(userId: string, limit = 10): Promise<AppNotification[]> {
  try {
    const res: any = await api.get('/notifications');
    const content = res.content || res;
    if (Array.isArray(content) && content.length > 0) {
      return content.slice(0, limit).map((n: any) => ({
        id: n.id,
        user_id: n.userId || userId,
        title: n.title,
        message: n.message,
        type: (n.type || 'info') as AppNotification['type'],
        priority: n.priority || 'normal',
        read: !!n.read,
        created_at: n.createdAt || new Date().toISOString(),
      }));
    }
  } catch {
    /* fallback */
  }

  let all = readAll();
  if (!all.some((n) => n.user_id === userId)) {
    all = [...seedFor(userId), ...all];
    writeAll(all);
  }
  return all
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function pushNotification(
  userId: string,
  n: Pick<AppNotification, 'title' | 'message'> & Partial<Pick<AppNotification, 'type' | 'priority'>>,
) {
  const all = readAll();
  all.unshift({
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    title: n.title,
    message: n.message,
    type: n.type || 'info',
    priority: n.priority || 'normal',
    read: false,
    created_at: new Date().toISOString(),
  });
  writeAll(all);
}

export function markAllRead(userId: string) {
  writeAll(readAll().map((n) => (n.user_id === userId ? { ...n, read: true } : n)));
}
