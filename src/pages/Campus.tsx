import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Search,
  Filter,
  Plus,
  Bell,
  Share2,
  Download,
  Navigation,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  Heart,
  MessageCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Map
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Campus() {
  const { theme } = useTheme();
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'general'
  });
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: 'general'
  });
  
  const upcomingEvents = [
    { 
      id: 1,
      title: 'Tech Fest 2025', 
      date: '2025-02-15',
      time: '9:00 AM - 6:00 PM',
      location: 'Main Auditorium',
      type: 'festival',
      attendees: 500,
      description: 'Annual technology festival with competitions, workshops, and keynote speakers.',
      maxAttendees: 1000,
      registrationFee: 0
    },
    { 
      id: 2,
      title: 'Career Fair', 
      date: '2025-02-20',
      time: '10:00 AM - 4:00 PM',
      location: 'Sports Complex',
      type: 'career',
      attendees: 200,
      description: 'Meet top companies and explore career opportunities.',
      maxAttendees: 500,
      registrationFee: 0
    },
    { 
      id: 3,
      title: 'Cultural Night', 
      date: '2025-02-25',
      time: '7:00 PM - 11:00 PM',
      location: 'Open Air Theater',
      type: 'cultural',
      attendees: 300,
      description: 'Celebrate diversity with performances, food, and cultural displays.',
      maxAttendees: 400,
      registrationFee: 50
    },
  ];
  
  const campusServices = [
    { 
      name: 'Student Affairs Office',
      description: 'Academic support, counseling, and student services',
      location: 'Block A, Ground Floor',
      hours: '9:00 AM - 5:00 PM',
      contact: '+91-9876543210',
      services: ['Academic Counseling', 'Scholarship Info', 'Student ID']
    },
    { 
      name: 'Health Center',
      description: 'Medical services and emergency care',
      location: 'Block B, First Floor',
      hours: '24/7 Emergency, 9:00 AM - 6:00 PM Regular',
      contact: '+91-9876543211',
      services: ['General Checkup', 'Emergency Care', 'Mental Health Support']
    },
    { 
      name: 'IT Support',
      description: 'Technical support and computer services',
      location: 'Computer Center',
      hours: '8:00 AM - 8:00 PM',
      contact: '+91-9876543212',
      services: ['WiFi Issues', 'Software Installation', 'Account Problems']
    },
    { 
      name: 'Library Services',
      description: 'Books, digital resources, and study spaces',
      location: 'Central Library',
      hours: '7:00 AM - 10:00 PM',
      contact: '+91-9876543213',
      services: ['Book Issuance', 'Digital Resources', 'Study Rooms']
    },
  ];
  
  const clubs = [
    { 
      id: 1,
      name: 'Coding Club',
      category: 'Technology',
      members: 150,
      description: 'Programming competitions, hackathons, and tech workshops',
      nextMeeting: '2025-01-20',
      president: 'Rajesh Kumar',
      maxMembers: 200
    },
    { 
      id: 2,
      name: 'Drama Society',
      category: 'Arts',
      members: 45,
      description: 'Theater productions, acting workshops, and cultural events',
      nextMeeting: '2025-01-22',
      president: 'Priya Sharma',
      maxMembers: 100
    },
    { 
      id: 3,
      name: 'Sports Club',
      category: 'Sports',
      members: 200,
      description: 'Inter-college competitions, fitness programs, and sports events',
      nextMeeting: '2025-01-18',
      president: 'Amit Singh',
      maxMembers: 300
    },
    { 
      id: 4,
      name: 'Photography Club',
      category: 'Arts',
      members: 80,
      description: 'Photo walks, exhibitions, and photography workshops',
      nextMeeting: '2025-01-25',
      president: 'Sneha Patel',
      maxMembers: 120
    },
  ];
  
  const announcements = [
    { 
      title: 'Campus WiFi Maintenance',
      message: 'WiFi services will be temporarily unavailable on Jan 20, 2:00 AM - 6:00 AM',
      priority: 'high',
      date: '2025-01-15',
      department: 'IT Services'
    },
    { 
      title: 'New Study Hall Opening',
      message: 'A new 24/7 study hall is now open in Block C with modern facilities',
      priority: 'medium',
      date: '2025-01-14',
      department: 'Student Affairs'
    },
    { 
      title: 'Scholarship Applications Open',
      message: 'Merit-based scholarships for the next academic year are now open',
      priority: 'high',
      date: '2025-01-12',
      department: 'Financial Aid'
    },
  ];
  
  // Interactive Functions
  const handleEventRegistration = (eventId: number) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(prev => prev.filter(id => id !== eventId));
      toast.success('Registration cancelled');
    } else {
      setRegisteredEvents(prev => [...prev, eventId]);
      toast.success('Successfully registered for event!');
    }
  };
  
  const handleClubJoin = (clubId: number) => {
    if (joinedClubs.includes(clubId)) {
      setJoinedClubs(prev => prev.filter(id => id !== clubId));
      toast.success('Left the club');
    } else {
      setJoinedClubs(prev => [...prev, clubId]);
      toast.success('Successfully joined the club!');
    }
  };
  
  const handleServiceContact = (service: any) => {
    toast.success(`Contacting ${service.name}...`);
    // In a real app, this would open phone/email
  };
  
  const handleShareEvent = (event: any) => {
    const shareText = `Check out this event: ${event.title} on ${event.date} at ${event.location}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Event details copied to clipboard!');
  };
  
  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time && newEvent.location) {
      toast.success('Event created successfully!');
      setNewEvent({ title: '', description: '', date: '', time: '', location: '', type: 'general' });
      setShowCreateEvent(false);
    } else {
      toast.error('Please fill in all required fields');
    }
  };
  
  const handleCreateClub = () => {
    if (newClub.name && newClub.description) {
      toast.success('Club created successfully!');
      setNewClub({ name: '', description: '', category: 'general' });
      setShowCreateClub(false);
    } else {
      toast.error('Please fill in all required fields');
    }
  };
  
  const filteredEvents = upcomingEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
            Campus Life
          </span>
        </h1>
        <p className="text-muted-foreground">Events, services, clubs, and campus information</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <Calendar className="h-8 w-8 text-blue-500 mb-2" />
          <p className="font-bold text-2xl">12</p>
          <p className="text-sm text-muted-foreground">Upcoming Events</p>
        </Card>
        
        <Card className="p-6">
          <Building2 className="h-8 w-8 text-green-500 mb-2" />
          <p className="font-bold text-2xl">8</p>
          <p className="text-sm text-muted-foreground">Campus Services</p>
        </Card>
        
        <Card className="p-6">
          <Users className="h-8 w-8 text-purple-500 mb-2" />
          <p className="font-bold text-2xl">15</p>
          <p className="text-sm text-muted-foreground">Active Clubs</p>
        </Card>
        
        <Card className="p-6">
          <Bell className="h-8 w-8 text-orange-500 mb-2" />
          <p className="font-bold text-2xl">5</p>
          <p className="text-sm text-muted-foreground">New Announcements</p>
        </Card>
      </div>
      
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 sm:w-64"
              />
              <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new campus event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter event title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter event description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter event location"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateEvent} className="flex-1">
                        Create Event
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredEvents.map((event, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()} • {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.attendees} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={
                    event.type === 'festival' ? 'default' :
                    event.type === 'career' ? 'secondary' : 'outline'
                  }>
                    {event.type}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className={`flex-1 ${
                      registeredEvents.includes(event.id) 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    }`}
                    onClick={() => handleEventRegistration(event.id)}
                    disabled={event.attendees >= event.maxAttendees && !registeredEvents.includes(event.id)}
                  >
                    {registeredEvents.includes(event.id) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Registered
                      </>
                    ) : (
                      <>
                        <Heart className="h-3 w-3 mr-1" />
                        Register
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShareEvent(event)}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Add to Calendar
                  </Button>
                </div>
                
                {event.registrationFee > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Registration Fee: ₹{event.registrationFee}
                  </div>
                )}
                
                {event.attendees >= event.maxAttendees && !registeredEvents.includes(event.id) && (
                  <div className="mt-2 text-sm text-destructive font-medium">
                    Event is full
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <h2 className="text-2xl font-bold">Campus Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campusServices.map((service, idx) => (
              <Card key={idx} className="p-6 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <Badge variant="outline">{service.hours}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{service.contact}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.services.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => toast.success('Opening directions...')}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Get Directions
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleServiceContact(service)}
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(service.contact);
                      toast.success('Contact number copied!');
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Clubs Tab */}
        <TabsContent value="clubs" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-2xl font-bold">Student Clubs</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 sm:w-64"
              />
              <Dialog open={showCreateClub} onOpenChange={setShowCreateClub}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Club
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Club</DialogTitle>
                    <DialogDescription>
                      Start a new student club or organization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="club-name">Club Name *</Label>
                      <Input
                        id="club-name"
                        value={newClub.name}
                        onChange={(e) => setNewClub(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter club name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="club-description">Description *</Label>
                      <Textarea
                        id="club-description"
                        value={newClub.description}
                        onChange={(e) => setNewClub(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your club's purpose and activities"
                      />
                    </div>
                    <div>
                      <Label htmlFor="club-category">Category</Label>
                      <select
                        id="club-category"
                        value={newClub.category}
                        onChange={(e) => setNewClub(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="technology">Technology</option>
                        <option value="arts">Arts</option>
                        <option value="sports">Sports</option>
                        <option value="academic">Academic</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateClub} className="flex-1">
                        Create Club
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateClub(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClubs.map((club, idx) => (
              <Card key={idx} className="p-6 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold">{club.name}</h3>
                  <Badge variant="outline">{club.category}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{club.description}</p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{club.members} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next: {new Date(club.nextMeeting).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>President: {club.president}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className={`flex-1 ${
                      joinedClubs.includes(club.id) 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    }`}
                    onClick={() => handleClubJoin(club.id)}
                    disabled={club.members >= club.maxMembers && !joinedClubs.includes(club.id)}
                  >
                    {joinedClubs.includes(club.id) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Joined
                      </>
                    ) : (
                      'Join Club'
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success('Opening club chat...')}
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
                
                {club.members >= club.maxMembers && !joinedClubs.includes(club.id) && (
                  <div className="mt-2 text-sm text-destructive font-medium">
                    Club is full
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <h2 className="text-2xl font-bold">Campus Announcements</h2>
          
          <div className="space-y-4">
            {announcements.map((announcement, idx) => (
              <Card key={idx} className={`p-6 ${
                announcement.priority === 'high' ? 'border-destructive/50 bg-destructive/5' : ''
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {announcement.department} • {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    announcement.priority === 'high' ? 'destructive' :
                    announcement.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {announcement.priority}
                  </Badge>
                </div>
                
                <p className="text-sm mb-4">{announcement.message}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
