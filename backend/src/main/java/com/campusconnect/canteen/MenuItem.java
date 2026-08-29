package com.campusconnect.canteen;

import com.campusconnect.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
public class MenuItem extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "is_available", nullable = false)
    private Boolean available = true;

    @Column(length = 512)
    private String description;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}
