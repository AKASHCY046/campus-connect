package com.campusconnect.campus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface FacilityRepository extends JpaRepository<Facility, String> {
    List<Facility> findAllByOrderByNameAsc();

    List<Facility> findByTypeOrderByNameAsc(String type);
}

interface FacilityBookingRepository extends JpaRepository<FacilityBooking, String> {
    List<FacilityBooking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<FacilityBooking> findByFacilityIdOrderByStartTime(String facilityId);

    List<FacilityBooking> findAllByOrderByCreatedAtDesc();
}

interface CampusEventRepository extends JpaRepository<CampusEvent, String> {
    List<CampusEvent> findAllByOrderByEventDateAsc();

    List<CampusEvent> findByTypeOrderByEventDateAsc(String type);
}

interface EventRegistrationRepository extends JpaRepository<EventRegistration, String> {
    boolean existsByEventIdAndUserId(String eventId, String userId);
}
