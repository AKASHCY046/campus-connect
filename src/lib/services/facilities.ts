import { api } from '../apiClient';
import type { Facility, FacilityBooking, BookingRequest } from '@/types/facility';

const FACILITIES_KEY = 'campus_facilities';
const BOOKINGS_KEY = 'campus_facility_bookings';

const SAMPLE_FACILITIES: Facility[] = [
  {
    id: 'fac_lab_a',
    name: 'Computer Lab A',
    type: 'laboratory',
    building: 'Technology Block',
    floor: '2nd Floor',
    capacity: 50,
    equipment: ['High-end Workstations', 'Projector', 'Interactive Whiteboard'],
    amenities: ['Wi-Fi', 'Air Conditioning', 'Power Outlets'],
    hours: '08:00 - 22:00',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop',
    description: 'Software development lab with 50 workstations and dual monitors.',
  },
  {
    id: 'fac_seminar_1',
    name: 'Seminar Hall 1',
    type: 'seminar-hall',
    building: 'Administrative Block',
    floor: '3rd Floor',
    capacity: 120,
    equipment: ['PA System', 'Dual Projectors', 'Wireless Microphones', 'Stage Lighting'],
    amenities: ['Wi-Fi', 'Air Conditioning', 'Recording Setup'],
    hours: '09:00 - 18:00',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
    description: 'Tiered seminar hall ideal for guest lectures and departmental events.',
  },
  {
    id: 'fac_conf_b',
    name: 'Conference Room B',
    type: 'conference-room',
    building: 'Administrative Block',
    floor: '2nd Floor',
    capacity: 20,
    equipment: ['4K Display', 'Video Conferencing', 'Whiteboard'],
    amenities: ['Wi-Fi', 'Air Conditioning'],
    hours: '09:00 - 20:00',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    description: 'Executive meeting room with hybrid conferencing support.',
  },
  {
    id: 'fac_auditorium',
    name: 'Main Auditorium',
    type: 'auditorium',
    building: 'Central Block',
    floor: 'Ground Floor',
    capacity: 600,
    equipment: ['Line Array Audio', 'Cinema Projector', 'Green Room', 'Stage Rigging'],
    amenities: ['Wi-Fi', 'Air Conditioning', 'Accessible Seating'],
    hours: '09:00 - 21:00',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop',
    description: '600-seat auditorium for convocations, festivals and major events.',
  },
  {
    id: 'fac_classroom_301',
    name: 'Smart Classroom 301',
    type: 'classroom',
    building: 'Academic Block C',
    floor: '3rd Floor',
    capacity: 60,
    equipment: ['Smart Board', 'Document Camera', 'Lecture Capture'],
    amenities: ['Wi-Fi', 'Air Conditioning'],
    hours: '08:00 - 18:00',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop',
    description: 'Technology-enabled classroom with lecture recording.',
  },
];

function readFacilities(): Facility[] {
  try {
    const stored = localStorage.getItem(FACILITIES_KEY);
    if (!stored) {
      localStorage.setItem(FACILITIES_KEY, JSON.stringify(SAMPLE_FACILITIES));
      return [...SAMPLE_FACILITIES];
    }
    return JSON.parse(stored);
  } catch {
    return [...SAMPLE_FACILITIES];
  }
}

function writeFacilities(list: Facility[]) {
  localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
}

function readBookings(): FacilityBooking[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeBookings(list: FacilityBooking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}

function mapTypeToBackend(type: Facility['type']): string {
  switch (type) {
    case 'seminar-hall': return 'SEMINAR_HALL';
    case 'laboratory': return 'LAB';
    case 'auditorium': return 'AUDITORIUM';
    case 'conference-room': return 'DISCUSSION_ROOM';
    case 'classroom': return 'CLASSROOM';
    default: return 'DISCUSSION_ROOM';
  }
}

function mapTypeToFrontend(type: string): Facility['type'] {
  switch (type) {
    case 'SEMINAR_HALL': return 'seminar-hall';
    case 'LAB': return 'laboratory';
    case 'AUDITORIUM': return 'auditorium';
    case 'DISCUSSION_ROOM': return 'conference-room';
    case 'CLASSROOM': return 'classroom';
    default: return 'conference-room';
  }
}

function mapFacility(f: any): Facility {
  return {
    id: f.id,
    name: f.name,
    type: mapTypeToFrontend(f.type),
    capacity: f.capacity,
    description: f.description,
    building: f.location?.split(',')[0]?.trim() || 'Main Block',
    floor: f.location?.split(',')[1]?.trim() || 'Ground Floor',
    equipment: ['Projector', 'Air Conditioning', 'Whiteboard'],
    amenities: ['Wi-Fi'],
    hours: '09:00 - 18:00',
    image: f.imageUrl,
  };
}

function mapBookingStatus(status: string): FacilityBooking['status'] {
  switch (status) {
    case 'APPROVED': return 'confirmed';
    case 'REJECTED': return 'cancelled';
    case 'COMPLETED': return 'completed';
    default: return 'pending';
  }
}

function mapBooking(b: any): FacilityBooking {
  const startStr: string = b.startTime || '';
  const endStr: string = b.endTime || '';
  return {
    id: b.id,
    facilityId: b.facilityId,
    facilityName: b.facilityName,
    bookedBy: b.userId,
    bookedByName: b.userFullName,
    purpose: b.purpose,
    eventType: 'meeting',
    startTime: startStr.substring(11, 16) || '09:00',
    endTime: endStr.substring(11, 16) || '10:00',
    date: startStr.substring(0, 10) || new Date().toISOString().slice(0, 10),
    attendees: b.attendees || 10,
    status: mapBookingStatus(b.status),
    notes: b.purpose,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.createdAt || new Date().toISOString(),
  };
}

export async function getFacilities(filters?: { type?: Facility['type']; building?: string }) {
  try {
    let path = '/facilities';
    if (filters?.type) path += `?type=${mapTypeToBackend(filters.type)}`;
    const response: any = await api.get(path);
    const content = response.content || response;
    const facilities = (Array.isArray(content) ? content : []).map(mapFacility);
    if (facilities.length > 0) return facilities;
  } catch {
    /* fallback */
  }

  let list = readFacilities();
  if (filters?.type) list = list.filter((f) => f.type === filters.type);
  if (filters?.building) list = list.filter((f) => f.building === filters.building);
  return list;
}

export async function getFacilityById(id: string) {
  const list = await getFacilities();
  const facility = list.find((f) => f.id === id);
  if (!facility) throw new Error('Facility not found');
  return facility;
}

export async function createFacility(facility: Omit<Facility, 'id'>) {
  try {
    const payload = {
      name: facility.name,
      type: mapTypeToBackend(facility.type),
      description: facility.description,
      capacity: facility.capacity,
      location: `${facility.building}, ${facility.floor}`,
      hourlyRate: 100,
      imageUrl: facility.image,
    };
    const response = await api.post('/facilities', payload);
    return mapFacility(response);
  } catch {
    const created: Facility = { ...facility, id: `fac_${Date.now()}` };
    const list = readFacilities();
    list.push(created);
    writeFacilities(list);
    return created;
  }
}

export async function updateFacility(id: string, updates: Partial<Facility>) {
  try {
    const payload: any = { ...updates };
    if (updates.type) payload.type = mapTypeToBackend(updates.type);
    const response = await api.put(`/facilities/${id}`, payload);
    return mapFacility(response);
  } catch {
    const list = readFacilities();
    const idx = list.findIndex((f) => f.id === id);
    if (idx < 0) throw new Error('Facility not found');
    list[idx] = { ...list[idx], ...updates };
    writeFacilities(list);
    return list[idx];
  }
}

export async function deleteFacility(id: string) {
  try {
    await api.delete(`/facilities/${id}`);
  } catch {
    writeFacilities(readFacilities().filter((f) => f.id !== id));
  }
}

export async function getFacilityBookings(filters?: {
  facilityId?: string;
  userId?: string;
  status?: FacilityBooking['status'];
}) {
  try {
    let path = '/facilities/bookings';
    if (filters?.userId) path += `?userId=${filters.userId}`;
    const response: any = await api.get(path);
    const content = response.content || response;
    const bookings = (Array.isArray(content) ? content : []).map(mapBooking);
    if (bookings.length > 0) return applyBookingFilters(bookings, filters);
  } catch {
    /* fallback */
  }
  return applyBookingFilters(readBookings(), filters);
}

function applyBookingFilters(
  bookings: FacilityBooking[],
  filters?: { facilityId?: string; userId?: string; status?: FacilityBooking['status'] },
) {
  let list = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (filters?.facilityId) list = list.filter((b) => b.facilityId === filters.facilityId);
  if (filters?.userId) list = list.filter((b) => b.bookedBy === filters.userId);
  if (filters?.status) list = list.filter((b) => b.status === filters.status);
  return list;
}

export async function getFacilityBookingById(id: string) {
  const bookings = await getFacilityBookings();
  return bookings.find((b) => b.id === id) || null;
}

function overlaps(a: { date: string; startTime: string; endTime: string }, b: FacilityBooking) {
  return a.date === b.date && a.startTime < b.endTime && a.endTime > b.startTime;
}

export async function createFacilityBooking(userId: string, userName: string, request: BookingRequest) {
  try {
    const payload = {
      startTime: `${request.date}T${request.startTime}:00`,
      endTime: `${request.date}T${request.endTime}:00`,
      purpose: request.purpose,
    };
    const response = await api.post(`/facilities/${request.facilityId}/book`, payload);
    return mapBooking(response);
  } catch {
    const facility = readFacilities().find((f) => f.id === request.facilityId);
    if (!facility) throw new Error('Facility not found');

    const bookings = readBookings();
    const clash = bookings.some(
      (b) =>
        b.facilityId === request.facilityId &&
        b.status !== 'cancelled' &&
        overlaps(request, b),
    );
    if (clash) throw new Error('That time slot is already booked for this facility.');

    const booking: FacilityBooking = {
      id: `bk_${Date.now()}`,
      facilityId: facility.id,
      facilityName: facility.name,
      bookedBy: userId,
      bookedByName: userName,
      purpose: request.purpose,
      eventType: request.eventType,
      startTime: request.startTime,
      endTime: request.endTime,
      date: request.date,
      attendees: request.attendees,
      status: 'pending',
      notes: request.notes,
      equipmentRequested: request.equipmentRequested,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookings.unshift(booking);
    writeBookings(bookings);
    return booking;
  }
}

export async function updateFacilityBooking(id: string, updates: Partial<FacilityBooking>) {
  try {
    if (updates.status === 'confirmed') {
      const response = await api.put(`/facilities/bookings/${id}/approve`);
      return mapBooking(response);
    }
    if (updates.status === 'cancelled') {
      const response = await api.put(`/facilities/bookings/${id}/reject`);
      return mapBooking(response);
    }
  } catch {
    /* fallback */
  }

  const bookings = readBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error('Booking not found');
  bookings[idx] = { ...bookings[idx], ...updates, updatedAt: new Date().toISOString() };
  writeBookings(bookings);
  return bookings[idx];
}

export async function deleteFacilityBooking(id: string) {
  try {
    await api.put(`/facilities/bookings/${id}/reject`);
  } catch {
    /* fallback */
  }
  writeBookings(readBookings().filter((b) => b.id !== id));
}

export async function getFacilityAvailability(facilityId: string, date: string) {
  const bookings = await getFacilityBookings({ facilityId });
  const timeSlots = [];
  for (let hour = 9; hour < 21; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    const isBooked = bookings.some((b) => {
      if (b.date !== date || b.status === 'cancelled') return false;
      return hour >= parseInt(b.startTime) && hour < parseInt(b.endTime);
    });
    timeSlots.push({ startTime, endTime, available: !isBooked });
  }
  return { facilityId, date, timeSlots };
}
