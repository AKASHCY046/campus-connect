import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNotifications, pushNotification, markAllRead } from './notifications';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
});

describe('notifications service (offline)', () => {
  it('seeds a welcome + tip for a new user', async () => {
    const items = await getNotifications('u_student');
    expect(items).toHaveLength(2);
    expect(items.every((n) => n.user_id === 'u_student')).toBe(true);
  });

  it('keeps notifications scoped per user', async () => {
    await getNotifications('u_a');
    pushNotification('u_a', { title: 'A', message: 'for a' });
    const a = await getNotifications('u_a');
    const b = await getNotifications('u_b');
    expect(a.some((n) => n.title === 'A')).toBe(true);
    expect(b.some((n) => n.title === 'A')).toBe(false);
  });

  it('returns newest first and respects the limit', async () => {
    await getNotifications('u_a');
    pushNotification('u_a', { title: 'newest', message: 'x' });
    const items = await getNotifications('u_a', 1);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('newest');
  });

  it('marks all of a user\'s notifications read', async () => {
    await getNotifications('u_a');
    markAllRead('u_a');
    const items = await getNotifications('u_a');
    expect(items.every((n) => n.read)).toBe(true);
  });
});
