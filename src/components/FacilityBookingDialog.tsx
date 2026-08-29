import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Facility, BookingRequest } from '@/types/facility';
import { toast } from 'sonner';

interface FacilityBookingDialogProps {
  facility: Facility;
  onBookingSubmit: (booking: BookingRequest) => void;
  trigger?: React.ReactNode;
}

export function FacilityBookingDialog({ facility, onBookingSubmit, trigger }: FacilityBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [eventType, setEventType] = useState<'class' | 'meeting' | 'presentation' | 'workshop' | 'exam' | 'other'>('class');
  const [attendees, setAttendees] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [equipmentRequested, setEquipmentRequested] = useState<string[]>([]);

  const handleEquipmentToggle = (equipment: string) => {
    setEquipmentRequested(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime || !purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (attendees > facility.capacity) {
      toast.error(`Number of attendees (${attendees}) exceeds facility capacity (${facility.capacity})`);
      return;
    }

    const booking: BookingRequest = {
      facilityId: facility.id,
      purpose,
      eventType,
      startTime,
      endTime,
      date: format(date, 'yyyy-MM-dd'),
      attendees,
      notes,
      equipmentRequested
    };

    onBookingSubmit(booking);
    setOpen(false);
    
    // Reset form
    setDate(undefined);
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setEventType('class');
    setAttendees(1);
    setNotes('');
    setEquipmentRequested([]);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Book Facility
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Book {facility.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Facility Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{facility.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{facility.building}, {facility.floor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Capacity: {facility.capacity}</span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Select Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(d) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return d < today;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose/Event Name *</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Data Structures Lecture, Team Meeting"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attendees">Expected Attendees *</Label>
              <Input
                id="attendees"
                type="number"
                min="1"
                max={facility.capacity}
                value={attendees}
                onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Equipment Selection */}
          {facility.equipment.length > 0 && (
            <div className="space-y-2">
              <Label>Required Equipment</Label>
              <div className="grid grid-cols-2 gap-2">
                {facility.equipment.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={equipmentRequested.includes(equipment)}
                      onCheckedChange={() => handleEquipmentToggle(equipment)}
                    />
                    <Label htmlFor={equipment} className="text-sm">
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or additional information..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Book Facility
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
