import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFacilities,
  createFacilityBooking,
  getFacilityBookings,
  updateFacilityBooking,
} from './facilities';
import type { BookingRequest } from '@/types/facility';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
});

const booking = (over: Partial<BookingRequest> = {}): BookingRequest => ({
  facilityId: '',
  purpose: 'Study session',
  eventType: 'meeting',
  startTime: '10:00',
  endTime: '12:00',
  date: '2099-01-01',
  attendees: 10,
  ...over,
});

describe('facilities service (offline)', () => {
  it('seeds bookable facilities', async () => {
    const facilities = await getFacilities();
    expect(facilities.length).toBeGreaterThan(0);
  });

  it('creates a pending booking scoped to the user', async () => {
    const [facility] = await getFacilities();
    const b = await createFacilityBooking('u_prof', 'Dr. Smith', booking({ facilityId: facility.id }));
    expect(b.status).toBe('pending');

    const mine = await getFacilityBookings({ userId: 'u_prof' });
    expect(mine).toHaveLength(1);
    expect(await getFacilityBookings({ userId: 'someone' })).toHaveLength(0);
  });

  it('rejects an overlapping booking for the same facility', async () => {
    const [facility] = await getFacilities();
    await createFacilityBooking('u1', 'One', booking({ facilityId: facility.id }));

    await expect(
      createFacilityBooking('u2', 'Two', booking({ facilityId: facility.id, startTime: '11:00', endTime: '13:00' })),
    ).rejects.toThrow(/already booked/i);
  });

  it('approves a booking', async () => {
    const [facility] = await getFacilities();
    const b = await createFacilityBooking('u1', 'One', booking({ facilityId: facility.id }));
    const approved = await updateFacilityBooking(b.id, { status: 'confirmed' });
    expect(approved.status).toBe('confirmed');
  });
});
