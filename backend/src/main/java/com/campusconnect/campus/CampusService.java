package com.campusconnect.campus;

import com.campusconnect.users.Profile;
import com.campusconnect.users.ProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CampusService {

    private final FacilityRepository facilityRepo;
    private final FacilityBookingRepository bookingRepo;
    private final CampusEventRepository eventRepo;
    private final EventRegistrationRepository registrationRepo;
    private final ProfileRepository profileRepo;

    public CampusService(FacilityRepository facilityRepo, FacilityBookingRepository bookingRepo,
                         CampusEventRepository eventRepo, EventRegistrationRepository registrationRepo,
                         ProfileRepository profileRepo) {
        this.facilityRepo = facilityRepo;
        this.bookingRepo = bookingRepo;
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
        this.profileRepo = profileRepo;
    }

    private String nameOf(String id) {
        return profileRepo.findById(id).map(Profile::getFullName).orElse(null);
    }

    // ---- Facilities ----

    @Transactional(readOnly = true)
    public List<FacilityDTO> listFacilities(String type) {
        List<Facility> list = (type == null || type.isBlank())
                ? facilityRepo.findAllByOrderByNameAsc()
                : facilityRepo.findByTypeOrderByNameAsc(type.toUpperCase());
        return list.stream().map(FacilityDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public FacilityDTO getFacility(String id) {
        return FacilityDTO.from(facility(id));
    }

    public FacilityDTO createFacility(FacilityRequest req, String actor) {
        Facility f = new Facility();
        apply(f, req);
        f.setCreatedBy(actor);
        f.setUpdatedBy(actor);
        return FacilityDTO.from(facilityRepo.save(f));
    }

    public FacilityDTO updateFacility(String id, FacilityRequest req, String actor) {
        Facility f = facility(id);
        apply(f, req);
        f.setUpdatedBy(actor);
        return FacilityDTO.from(facilityRepo.save(f));
    }

    public void deleteFacility(String id) {
        facilityRepo.deleteById(id);
    }

    private void apply(Facility f, FacilityRequest req) {
        if (req.name() != null) f.setName(req.name());
        if (req.type() != null) f.setType(req.type().toUpperCase());
        if (req.description() != null) f.setDescription(req.description());
        if (req.capacity() != null) f.setCapacity(req.capacity());
        if (req.location() != null) f.setLocation(req.location());
        if (req.hourlyRate() != null) f.setHourlyRate(req.hourlyRate());
        if (req.imageUrl() != null) f.setImageUrl(req.imageUrl());
    }

    private Facility facility(String id) {
        return facilityRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Facility not found"));
    }

    // ---- Bookings ----

    @Transactional(readOnly = true)
    public List<BookingDTO> listBookings(String userId) {
        List<FacilityBooking> list = (userId != null && !userId.isBlank())
                ? bookingRepo.findByUserIdOrderByCreatedAtDesc(userId)
                : bookingRepo.findAllByOrderByCreatedAtDesc();
        return list.stream().map(this::toBookingDto).toList();
    }

    public BookingDTO book(String facilityId, BookingRequest req, String userId) {
        Facility f = facility(facilityId);
        if (!req.endTime().isAfter(req.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        boolean clash = bookingRepo.findByFacilityIdOrderByStartTime(facilityId).stream()
                .filter(b -> !"REJECTED".equals(b.getStatus()))
                .anyMatch(b -> req.startTime().isBefore(b.getEndTime()) && req.endTime().isAfter(b.getStartTime()));
        if (clash) {
            throw new IllegalStateException("That time slot is already booked for this facility");
        }

        long hours = Math.max(1, Duration.between(req.startTime(), req.endTime()).toHours());
        FacilityBooking b = new FacilityBooking();
        b.setFacilityId(facilityId);
        b.setUserId(userId);
        b.setStartTime(req.startTime());
        b.setEndTime(req.endTime());
        b.setPurpose(req.purpose());
        b.setStatus("PENDING");
        b.setTotalPrice(f.getHourlyRate().multiply(BigDecimal.valueOf(hours)));
        b.setCreatedBy(userId);
        b.setUpdatedBy(userId);
        FacilityBooking saved = bookingRepo.save(b);
        saved.setFacility(f);
        return toBookingDto(saved);
    }

    public BookingDTO setBookingStatus(String id, String status, String actor) {
        FacilityBooking b = bookingRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        b.setStatus(status);
        b.setUpdatedBy(actor);
        return toBookingDto(bookingRepo.save(b));
    }

    private BookingDTO toBookingDto(FacilityBooking b) {
        String facilityName = b.getFacility() != null ? b.getFacility().getName()
                : facilityRepo.findById(b.getFacilityId()).map(Facility::getName).orElse(null);
        return new BookingDTO(b.getId(), b.getFacilityId(), facilityName, b.getUserId(), nameOf(b.getUserId()),
                b.getPurpose(), b.getStartTime(), b.getEndTime(), b.getStatus(), b.getCreatedAt());
    }

    // ---- Events ----

    @Transactional(readOnly = true)
    public List<EventDTO> listEvents(String type) {
        List<CampusEvent> list = (type == null || type.isBlank())
                ? eventRepo.findAllByOrderByEventDateAsc()
                : eventRepo.findByTypeOrderByEventDateAsc(type.toUpperCase());
        return list.stream().map(EventDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public EventDTO getEvent(String id) {
        return EventDTO.from(event(id));
    }

    public EventDTO createEvent(EventRequest req, String actor) {
        CampusEvent e = new CampusEvent();
        apply(e, req);
        e.setCreatedBy(actor);
        e.setUpdatedBy(actor);
        return EventDTO.from(eventRepo.save(e));
    }

    public EventDTO updateEvent(String id, EventRequest req, String actor) {
        CampusEvent e = event(id);
        apply(e, req);
        e.setUpdatedBy(actor);
        return EventDTO.from(eventRepo.save(e));
    }

    public void deleteEvent(String id) {
        eventRepo.deleteById(id);
    }

    public EventDTO register(String eventId, String userId) {
        CampusEvent e = event(eventId);
        if (!registrationRepo.existsByEventIdAndUserId(eventId, userId)) {
            EventRegistration r = new EventRegistration();
            r.setEventId(eventId);
            r.setUserId(userId);
            r.setRegisteredAt(LocalDateTime.now());
            r.setCreatedBy(userId);
            r.setUpdatedBy(userId);
            registrationRepo.save(r);
            e.setRegisteredCount(e.getRegisteredCount() + 1);
            eventRepo.save(e);
        }
        return EventDTO.from(e);
    }

    private void apply(CampusEvent e, EventRequest req) {
        if (req.title() != null) e.setTitle(req.title());
        if (req.description() != null) e.setDescription(req.description());
        if (req.type() != null) e.setType(req.type().toUpperCase());
        if (req.eventDate() != null) e.setEventDate(req.eventDate());
        if (req.location() != null) e.setLocation(req.location());
        if (req.capacity() != null) e.setCapacity(req.capacity());
        if (req.imageUrl() != null) e.setImageUrl(req.imageUrl());
        if (e.getCapacity() == null) e.setCapacity(100);
    }

    private CampusEvent event(String id) {
        return eventRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
    }
}
