package com.campusconnect.campus;

import com.campusconnect.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CampusController {

    private static final String STAFF = "hasAnyRole('PROFESSOR', 'ADMIN')";

    private final CampusService service;

    public CampusController(CampusService service) {
        this.service = service;
    }

    // ---- Facilities ----

    @GetMapping("/facilities")
    public ApiResponse<List<FacilityDTO>> listFacilities(@RequestParam(required = false) String type) {
        return ApiResponse.success(service.listFacilities(type));
    }

    @GetMapping("/facilities/{id}")
    public ApiResponse<FacilityDTO> getFacility(@PathVariable String id) {
        return ApiResponse.success(service.getFacility(id));
    }

    @PreAuthorize(STAFF)
    @PostMapping("/facilities")
    public ApiResponse<FacilityDTO> createFacility(@Valid @RequestBody FacilityRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createFacility(req, jwt.getSubject()));
    }

    @PreAuthorize(STAFF)
    @PutMapping("/facilities/{id}")
    public ApiResponse<FacilityDTO> updateFacility(@PathVariable String id, @RequestBody FacilityRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.updateFacility(id, req, jwt.getSubject()));
    }

    @PreAuthorize(STAFF)
    @DeleteMapping("/facilities/{id}")
    public ApiResponse<Void> deleteFacility(@PathVariable String id) {
        service.deleteFacility(id);
        return ApiResponse.success(null, "Deleted");
    }

    // ---- Bookings ----

    @GetMapping("/facilities/bookings")
    public ApiResponse<List<BookingDTO>> listBookings(@RequestParam(required = false) String userId) {
        return ApiResponse.success(service.listBookings(userId));
    }

    @PostMapping("/facilities/{facilityId}/book")
    public ApiResponse<BookingDTO> book(@PathVariable String facilityId, @Valid @RequestBody BookingRequest req,
                                        @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.book(facilityId, req, jwt.getSubject()));
    }

    @PreAuthorize(STAFF)
    @PutMapping("/facilities/bookings/{id}/approve")
    public ApiResponse<BookingDTO> approveBooking(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.setBookingStatus(id, "APPROVED", jwt.getSubject()));
    }

    @PutMapping("/facilities/bookings/{id}/reject")
    public ApiResponse<BookingDTO> rejectBooking(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.setBookingStatus(id, "REJECTED", jwt.getSubject()));
    }

    // ---- Events ----

    @GetMapping("/events")
    public ApiResponse<List<EventDTO>> listEvents(@RequestParam(required = false) String type) {
        return ApiResponse.success(service.listEvents(type));
    }

    @GetMapping("/events/{id}")
    public ApiResponse<EventDTO> getEvent(@PathVariable String id) {
        return ApiResponse.success(service.getEvent(id));
    }

    @PreAuthorize(STAFF)
    @PostMapping("/events")
    public ApiResponse<EventDTO> createEvent(@Valid @RequestBody EventRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createEvent(req, jwt.getSubject()));
    }

    @PreAuthorize(STAFF)
    @PutMapping("/events/{id}")
    public ApiResponse<EventDTO> updateEvent(@PathVariable String id, @RequestBody EventRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.updateEvent(id, req, jwt.getSubject()));
    }

    @PreAuthorize(STAFF)
    @DeleteMapping("/events/{id}")
    public ApiResponse<Void> deleteEvent(@PathVariable String id) {
        service.deleteEvent(id);
        return ApiResponse.success(null, "Deleted");
    }

    @PostMapping("/events/{id}/register")
    public ApiResponse<EventDTO> register(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.register(id, jwt.getSubject()));
    }
}
