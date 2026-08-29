export interface Facility {
  id: string;
  name: string;
  type: 'seminar-hall' | 'laboratory' | 'conference-room' | 'auditorium' | 'classroom';
  building: string;
  floor: string;
  capacity: number;
  equipment: string[];
  amenities: string[];
  hours: string;
  image?: string;
  description?: string;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  bookedBy: string;
  bookedByName: string;
  purpose: string;
  eventType: 'class' | 'meeting' | 'presentation' | 'workshop' | 'exam' | 'other';
  startTime: string;
  endTime: string;
  date: string;
  attendees: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  equipmentRequested?: string[];
}

export interface FacilityAvailability {
  facilityId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  bookingId?: string;
}

export interface BookingRequest {
  facilityId: string;
  purpose: string;
  eventType: 'class' | 'meeting' | 'presentation' | 'workshop' | 'exam' | 'other';
  startTime: string;
  endTime: string;
  date: string;
  attendees: number;
  notes?: string;
  equipmentRequested?: string[];
}
