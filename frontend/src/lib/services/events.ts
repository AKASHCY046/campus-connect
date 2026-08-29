import { api } from '../apiClient';

export interface CampusEvent {
  id: string;
  title: string;
  type: 'Festival' | 'Career' | 'Cultural' | 'Sports' | 'Academic' | 'Other';
  date: string;
  time: string;
  location: string;
  description?: string;
  attendees: number;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  event?: CampusEvent;
}

const EVENTS_KEY = 'campus_events';
const REGISTRATIONS_KEY = 'campus_event_registrations';

function futureDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_EVENTS: CampusEvent[] = [
  {
    id: 'evt_techfest',
    title: 'TechFest 2026',
    type: 'Festival',
    date: futureDate(9),
    time: '09:00',
    location: 'Main Auditorium',
    description: 'Annual technology festival with hackathons, robotics, and keynote talks from industry leaders.',
    attendees: 512,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt_career',
    title: 'Campus Placement Drive',
    type: 'Career',
    date: futureDate(14),
    time: '10:00',
    location: 'Training & Placement Block',
    description: 'Meet 40+ recruiting companies across software, core engineering and analytics roles.',
    attendees: 289,
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt_cultural',
    title: 'Cultural Night — Rhythms',
    type: 'Cultural',
    date: futureDate(21),
    time: '18:00',
    location: 'Open Air Theatre',
    description: 'An evening of music, dance and drama performances by student clubs.',
    attendees: 740,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt_sports',
    title: 'Inter-Department Sports Meet',
    type: 'Sports',
    date: futureDate(4),
    time: '08:00',
    location: 'Central Sports Ground',
    description: 'Track & field, cricket, football and basketball tournaments across departments.',
    attendees: 430,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt_seminar',
    title: 'Research Seminar: Applied AI',
    type: 'Academic',
    date: futureDate(2),
    time: '14:00',
    location: 'Seminar Hall 2',
    description: 'Faculty and research scholars present recent work on applied machine learning.',
    attendees: 96,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function readEvents(): CampusEvent[] {
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    if (!stored) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(SAMPLE_EVENTS));
      return [...SAMPLE_EVENTS];
    }
    return JSON.parse(stored);
  } catch {
    return [...SAMPLE_EVENTS];
  }
}

function writeEvents(events: CampusEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function readRegistrations(): EventRegistration[] {
  try {
    return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeRegistrations(regs: EventRegistration[]) {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
}

function mapTypeToFrontend(type: string): CampusEvent['type'] {
  switch (type) {
    case 'CULTURAL': return 'Cultural';
    case 'SPORTS': return 'Sports';
    case 'ACADEMIC': return 'Academic';
    case 'WORKSHOP': return 'Career';
    case 'FESTIVAL': return 'Festival';
    default: return 'Other';
  }
}

function mapTypeToBackend(type: CampusEvent['type']): string {
  switch (type) {
    case 'Cultural': return 'CULTURAL';
    case 'Festival': return 'FESTIVAL';
    case 'Sports': return 'SPORTS';
    case 'Academic': return 'ACADEMIC';
    case 'Career': return 'WORKSHOP';
    default: return 'OTHER';
  }
}

function mapEvent(e: any): CampusEvent {
  const dateStr: string = e.eventDate || '';
  return {
    id: e.id,
    title: e.title,
    type: mapTypeToFrontend(e.type),
    date: dateStr.substring(0, 10) || new Date().toISOString().slice(0, 10),
    time: dateStr.substring(11, 16) || '10:00',
    location: e.location,
    description: e.description,
    attendees: e.registeredCount || 0,
    image: e.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
    created_at: e.createdAt || new Date().toISOString(),
    updated_at: e.createdAt || new Date().toISOString(),
  };
}

export async function getEvents(filters?: { type?: CampusEvent['type']; date?: string }) {
  try {
    let path = '/events';
    if (filters?.type) path += `?type=${mapTypeToBackend(filters.type)}`;
    const response: any = await api.get(path);
    const content = response.content || response;
    const events = (Array.isArray(content) ? content : []).map(mapEvent);
    if (events.length > 0) return events;
  } catch {
    /* fallback */
  }

  let events = readEvents().sort((a, b) => a.date.localeCompare(b.date));
  if (filters?.type) events = events.filter((e) => e.type === filters.type);
  if (filters?.date) events = events.filter((e) => e.date === filters.date);
  return events;
}

export async function getEventById(id: string) {
  const events = await getEvents();
  const event = events.find((e) => e.id === id);
  if (!event) throw new Error('Event not found');
  return event;
}

export async function createEvent(event: Omit<CampusEvent, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const payload = {
      title: event.title,
      description: event.description,
      type: mapTypeToBackend(event.type),
      eventDate: `${event.date}T${event.time}:00`,
      location: event.location,
      capacity: 200,
      imageUrl: event.image,
    };
    const response = await api.post('/events', payload);
    return mapEvent(response);
  } catch {
    const newEvent: CampusEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      attendees: event.attendees || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const events = readEvents();
    events.push(newEvent);
    writeEvents(events);
    return newEvent;
  }
}

export async function updateEvent(id: string, updates: Partial<CampusEvent>) {
  try {
    const payload: any = { ...updates };
    if (updates.type) payload.type = mapTypeToBackend(updates.type);
    if (updates.date && updates.time) payload.eventDate = `${updates.date}T${updates.time}:00`;
    const response = await api.put(`/events/${id}`, payload);
    return mapEvent(response);
  } catch {
    const events = readEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error('Event not found');
    events[idx] = { ...events[idx], ...updates, updated_at: new Date().toISOString() };
    writeEvents(events);
    return events[idx];
  }
}

export async function deleteEvent(id: string) {
  try {
    await api.delete(`/events/${id}`);
  } catch {
    writeEvents(readEvents().filter((e) => e.id !== id));
    writeRegistrations(readRegistrations().filter((r) => r.event_id !== id));
  }
}

export async function getEventRegistrations(userId?: string, eventId?: string) {
  let regs = readRegistrations();
  if (userId) regs = regs.filter((r) => r.user_id === userId);
  if (eventId) regs = regs.filter((r) => r.event_id === eventId);
  const events = readEvents();
  return regs.map((r) => ({ ...r, event: events.find((e) => e.id === r.event_id) }));
}

export async function registerForEvent(eventId: string, userId: string) {
  try {
    await api.post(`/events/${eventId}/register`);
  } catch {
    /* fallback below */
  }

  const regs = readRegistrations();
  if (!regs.some((r) => r.event_id === eventId && r.user_id === userId)) {
    regs.push({
      id: `reg_${Date.now()}`,
      event_id: eventId,
      user_id: userId,
      registered_at: new Date().toISOString(),
    });
    writeRegistrations(regs);

    const events = readEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      events[idx].attendees += 1;
      writeEvents(events);
    }
  }
  return { id: `reg_${eventId}`, event_id: eventId, user_id: userId, registered_at: new Date().toISOString() };
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  const regs = readRegistrations();
  const remaining = regs.filter((r) => !(r.event_id === eventId && r.user_id === userId));
  if (remaining.length !== regs.length) {
    writeRegistrations(remaining);
    const events = readEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      events[idx].attendees = Math.max(0, events[idx].attendees - 1);
      writeEvents(events);
    }
  }
}

export async function isUserRegistered(eventId: string, userId: string): Promise<boolean> {
  return readRegistrations().some((r) => r.event_id === eventId && r.user_id === userId);
}
