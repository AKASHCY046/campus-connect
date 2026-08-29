package com.campusconnect.campus;

import com.campusconnect.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "facilities")
@Getter
@Setter
@NoArgsConstructor
class Facility extends BaseEntity {
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, length = 50)
    private String type;
    @Column(length = 512)
    private String description;
    @Column(nullable = false)
    private Integer capacity;
    @Column(nullable = false, length = 100)
    private String location;
    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate = BigDecimal.ZERO;
    @Column(name = "image_url", length = 512)
    private String imageUrl;
}

@Entity
@Table(name = "facility_bookings")
@Getter
@Setter
@NoArgsConstructor
class FacilityBooking extends BaseEntity {
    @Column(name = "facility_id", nullable = false)
    private String facilityId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", insertable = false, updatable = false)
    private Facility facility;
    @Column(name = "user_id", nullable = false)
    private String userId;
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    @Column(nullable = false, length = 50)
    private String status = "PENDING";
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;
    @Column(length = 512)
    private String purpose;
}

@Entity
@Table(name = "campus_events")
@Getter
@Setter
@NoArgsConstructor
class CampusEvent extends BaseEntity {
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false, length = 50)
    private String type;
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;
    @Column(nullable = false, length = 100)
    private String location;
    @Column(nullable = false)
    private Integer capacity;
    @Column(name = "registered_count", nullable = false)
    private Integer registeredCount = 0;
    @Column(name = "image_url", length = 512)
    private String imageUrl;
}

@Entity
@Table(name = "event_registrations")
@Getter
@Setter
@NoArgsConstructor
class EventRegistration extends BaseEntity {
    @Column(name = "event_id", nullable = false)
    private String eventId;
    @Column(name = "user_id", nullable = false)
    private String userId;
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;
}
