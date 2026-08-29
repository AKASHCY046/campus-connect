package com.campusconnect.campus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

record FacilityDTO(String id, String name, String type, String description, Integer capacity,
                   String location, BigDecimal hourlyRate, String imageUrl) {

    static FacilityDTO from(Facility f) {
        return new FacilityDTO(f.getId(), f.getName(), f.getType(), f.getDescription(), f.getCapacity(),
                f.getLocation(), f.getHourlyRate(), f.getImageUrl());
    }
}

record FacilityRequest(@NotBlank String name, @NotBlank String type, String description,
                       @NotNull Integer capacity, String location, BigDecimal hourlyRate, String imageUrl) {
}

record BookingRequest(@NotNull LocalDateTime startTime, @NotNull LocalDateTime endTime, String purpose) {
}

record BookingDTO(String id, String facilityId, String facilityName, String userId, String userFullName,
                  String purpose, LocalDateTime startTime, LocalDateTime endTime, String status,
                  LocalDateTime createdAt) {
}

record EventDTO(String id, String title, String description, String type, LocalDateTime eventDate,
                String location, Integer capacity, Integer registeredCount, String imageUrl,
                LocalDateTime createdAt) {

    static EventDTO from(CampusEvent e) {
        return new EventDTO(e.getId(), e.getTitle(), e.getDescription(), e.getType(), e.getEventDate(),
                e.getLocation(), e.getCapacity(), e.getRegisteredCount(), e.getImageUrl(), e.getCreatedAt());
    }
}

record EventRequest(@NotBlank String title, String description, @NotBlank String type,
                    @NotNull LocalDateTime eventDate, @NotBlank String location, Integer capacity, String imageUrl) {
}
