package com.campusconnect.notifications;

import com.campusconnect.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 512)
    private String message;

    @Column(nullable = false, length = 50)
    private String type = "info";

    @Column(name = "is_read", nullable = false)
    private Boolean read = false;
}
