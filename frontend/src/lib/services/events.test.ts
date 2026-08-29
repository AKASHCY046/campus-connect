import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEvents,
  registerForEvent,
  unregisterFromEvent,
  isUserRegistered,
  getEventRegistrations,
} from './events';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
});

describe('events service (offline)', () => {
  it('seeds events sorted by date', async () => {
    const events = await getEvents();
    expect(events.length).toBeGreaterThan(0);
    const dates = events.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it('registers a user once and bumps the attendee count', async () => {
    const [event] = await getEvents();
    const before = event.attendees;

    await registerForEvent(event.id, 'u_student');
    await registerForEvent(event.id, 'u_student'); // idempotent

    expect(await isUserRegistered(event.id, 'u_student')).toBe(true);
    const after = (await getEvents()).find((e) => e.id === event.id)!;
    expect(after.attendees).toBe(before + 1);

    const regs = await getEventRegistrations('u_student');
    expect(regs).toHaveLength(1);
    expect(regs[0].event?.id).toBe(event.id);
  });

  it('unregisters and decrements the count', async () => {
    const [event] = await getEvents();
    await registerForEvent(event.id, 'u_student');
    await unregisterFromEvent(event.id, 'u_student');

    expect(await isUserRegistered(event.id, 'u_student')).toBe(false);
    const after = (await getEvents()).find((e) => e.id === event.id)!;
    expect(after.attendees).toBe(event.attendees);
  });
});
