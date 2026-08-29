import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Calendar,
  MapPin,
  Users,
  Phone,
  Star,
  Search,
  Wifi,
  Car,
  Utensils,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FacilityBookingDialog } from '@/components/FacilityBookingDialog';
import type { Facility, FacilityBooking, BookingRequest } from '@/types/facility';
import { getEvents, getEventRegistrations, registerForEvent, type CampusEvent } from '@/lib/services/events';
import {
  getFacilities,
  getFacilityBookings,
  createFacilityBooking,
} from '@/lib/services/facilities';
import { pushNotification } from '@/lib/services/notifications';

const SERVICES = [
  { id: 1, name: 'Hostel Management', category: 'Accommodation', description: 'Room allocation, maintenance requests, and hostel facilities.', contact: '+91 98765 43210', location: 'Hostel Block A', rating: 4.2, icon: Building2 },
  { id: 2, name: 'Transportation', category: 'Transport', description: 'Campus shuttle service, route schedules and parking passes.', contact: '+91 98765 43211', location: 'Main Gate', rating: 4.5, icon: Car },
  { id: 3, name: 'Wi-Fi & IT Helpdesk', category: 'Technology', description: 'Campus-wide connectivity and device support.', contact: 'helpdesk@campus.edu', location: 'IT Department', rating: 4.6, icon: Wifi },
  { id: 4, name: 'Health Centre', category: 'Health', description: '24/7 medical assistance and emergency care.', contact: '+91 98765 43212', location: 'Health Centre', rating: 4.7, icon: AlertCircle },
  { id: 5, name: 'Food Court', category: 'Food', description: 'Multiple dining outlets and monthly meal plans.', contact: '+91 98765 43213', location: 'Food Court', rating: 4.3, icon: Utensils },
  { id: 6, name: 'Central Library', category: 'Academic', description: 'Study spaces, research assistance and digital archives.', contact: 'library@campus.edu', location: 'Central Library', rating: 4.9, icon: BookOpen },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Campus Wi-Fi upgraded to Wi-Fi 6', category: 'Technology', date: '2026-08-20', priority: 'high', description: 'The campus network now supports Wi-Fi 6. Connect to "CampusConnect-6" for faster speeds.' },
  { id: 2, title: 'Hostel Block B maintenance', category: 'Maintenance', date: '2026-08-18', priority: 'medium', description: 'Scheduled maintenance from Sep 2–4. Temporary rooms will be allocated to affected residents.' },
  { id: 3, title: 'Library 24×7 during exams', category: 'Academic', date: '2026-08-15', priority: 'low', description: 'The Central Library stays open around the clock through the examination period.' },
  { id: 4, title: 'New shuttle route to Tech Park', category: 'Transport', date: '2026-08-12', priority: 'medium', description: 'A new shuttle route now connects the campus to the Tech Park every 30 minutes.' },
];

export default function Campus() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [readAnnouncements, setReadAnnouncements] = useState<Set<number>>(new Set());

  const userId = user?.id ?? 'anonymous';
  const userName = user?.full_name ?? 'Guest';

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [evts, facs, regs, bkgs] = await Promise.all([
          getEvents(),
          getFacilities(),
          getEventRegistrations(userId),
          getFacilityBookings({ userId }),
        ]);
        if (!active) return;
        setEvents(evts);
        setFacilities(facs);
        setRegisteredEventIds(new Set(regs.map((r) => r.event_id)));
        setBookings(bkgs);
      } catch (err) {
        console.error('Failed to load campus data', err);
        toast.error('Could not load campus data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleRegister = async (event: CampusEvent) => {
    try {
      await registerForEvent(event.id, userId);
      setRegisteredEventIds((prev) => new Set(prev).add(event.id));
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, attendees: e.attendees + 1 } : e)),
      );
      pushNotification(userId, {
        title: 'Event registration confirmed',
        message: `You're registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()}.`,
        type: 'success',
      });
      toast.success(`Registered for ${event.title}`);
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleFacilityBooking = async (request: BookingRequest) => {
    if (request.endTime <= request.startTime) {
      toast.error('End time must be after the start time.');
      return;
    }
    try {
      const booking = await createFacilityBooking(userId, userName, request);
      setBookings((prev) => [booking, ...prev]);
      pushNotification(userId, {
        title: 'Facility booking submitted',
        message: `${booking.facilityName} on ${booking.date} (${booking.startTime}–${booking.endTime}) is pending approval.`,
        type: 'info',
      });
      toast.success(`Booking requested for ${booking.facilityName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredEvents = useMemo(
    () => (q ? events.filter((e) => `${e.title} ${e.type} ${e.location}`.toLowerCase().includes(q)) : events),
    [events, q],
  );
  const filteredFacilities = useMemo(
    () => (q ? facilities.filter((f) => `${f.name} ${f.building} ${f.type}`.toLowerCase().includes(q)) : facilities),
    [facilities, q],
  );
  const filteredServices = useMemo(
    () => (q ? SERVICES.filter((s) => `${s.name} ${s.category}`.toLowerCase().includes(q)) : SERVICES),
    [q],
  );

  const unreadAnnouncements = ANNOUNCEMENTS.filter((a) => !readAnnouncements.has(a.id)).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">
          <span className={theme === 'cyber' ? 'text-gradient' : ''}>Campus Services</span>
        </h1>
        <p className="text-muted-foreground">Explore events, services and facilities across campus.</p>
      </div>

      <div className="mb-8 max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events, services or facilities…"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: Calendar, label: 'Upcoming Events', value: events.length, tint: 'text-blue-500' },
          { icon: Building2, label: 'Campus Services', value: SERVICES.length, tint: 'text-emerald-500' },
          { icon: MapPin, label: 'Bookable Facilities', value: facilities.length, tint: 'text-violet-500' },
          { icon: Info, label: 'New Announcements', value: unreadAnnouncements, tint: 'text-amber-500' },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <s.icon className={`mb-2 h-7 w-7 ${s.tint}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Events */}
        <TabsContent value="events">
          <Card className="p-6">
            <h2 className="mb-6">Campus Events</h2>
            {filteredEvents.length === 0 ? (
              <EmptyState message="No events match your search." />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredEvents.map((event) => {
                  const registered = registeredEventIds.has(event.id);
                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="flex gap-4 p-4">
                        <img
                          src={event.image}
                          alt=""
                          className="h-24 w-24 shrink-0 rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="truncate text-base font-bold">{event.title}</h3>
                            {registered && (
                              <Badge className="shrink-0 gap-1 bg-emerald-500 hover:bg-emerald-500">
                                <CheckCircle2 className="h-3 w-3" /> Going
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="mb-2">{event.type}</Badge>
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                          <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString()} · {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {event.attendees} attending
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            variant={registered ? 'outline' : 'default'}
                            onClick={() => handleRegister(event)}
                            disabled={registered}
                          >
                            {registered ? 'Registered' : 'Register'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services">
          <Card className="p-6">
            <h2 className="mb-6">Campus Services</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className="p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold">{service.name}</h3>
                        <Badge variant="outline" className="text-xs">{service.category}</Badge>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{service.description}</p>
                    <div className="mb-4 space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {service.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {service.contact}
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {service.rating.toFixed(1)} / 5.0
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success(`Opening ${service.name}…`)}
                    >
                      Contact
                    </Button>
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Facilities */}
        <TabsContent value="facilities">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2>Facility Booking</h2>
              <Badge variant="outline">{bookings.length} of your bookings</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFacilities.map((facility) => (
                <Card key={facility.id} className="flex flex-col p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold">{facility.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {facility.building} · {facility.floor}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">Cap. {facility.capacity}</Badge>
                  </div>
                  <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {facility.hours}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-1">
                    {facility.equipment.slice(0, 3).map((eq) => (
                      <Badge key={eq} variant="secondary" className="text-xs font-normal">{eq}</Badge>
                    ))}
                    {facility.equipment.length > 3 && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        +{facility.equipment.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-auto">
                    <FacilityBookingDialog facility={facility} onBookingSubmit={handleFacilityBooking} />
                  </div>
                </Card>
              ))}
            </div>

            {bookings.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold">Your bookings</h3>
                <div className="space-y-2">
                  {bookings.slice(0, 6).map((b) => (
                    <Card key={b.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{b.facilityName}</span>
                        <Badge variant="outline" className="capitalize">{b.eventType}</Badge>
                        <Badge
                          className={
                            b.status === 'confirmed'
                              ? 'bg-emerald-500 hover:bg-emerald-500'
                              : b.status === 'cancelled'
                                ? 'bg-destructive hover:bg-destructive'
                                : 'bg-amber-500 hover:bg-amber-500'
                          }
                        >
                          {b.status}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {b.date} · {b.startTime}–{b.endTime}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements">
          <Card className="p-6">
            <h2 className="mb-6">Campus Announcements</h2>
            <div className="space-y-4">
              {ANNOUNCEMENTS.map((a) => {
                const isRead = readAnnouncements.has(a.id);
                return (
                  <Card
                    key={a.id}
                    className={`p-4 transition-smooth ${!isRead ? 'border-primary/40 bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold">{a.title}</h3>
                          <Badge variant="outline">{a.category}</Badge>
                          <Badge
                            variant={
                              a.priority === 'high'
                                ? 'destructive'
                                : a.priority === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {a.priority}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{a.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(a.date).toLocaleDateString()}
                        </div>
                      </div>
                      {!isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReadAnnouncements((prev) => new Set(prev).add(a.id))}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-12 text-center text-muted-foreground">{message}</p>;
}
