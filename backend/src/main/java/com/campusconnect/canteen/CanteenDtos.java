package com.campusconnect.canteen;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

record MenuItemDTO(
        String id,
        String name,
        String category,
        BigDecimal price,
        boolean available,
        String description,
        String imageUrl,
        LocalDateTime createdAt) {

    static MenuItemDTO from(MenuItem m) {
        return new MenuItemDTO(m.getId(), m.getName(), m.getCategory(), m.getPrice(),
                Boolean.TRUE.equals(m.getAvailable()), m.getDescription(), m.getImageUrl(), m.getCreatedAt());
    }
}

record MenuItemRequest(
        @NotBlank String name,
        @NotBlank String category,
        @NotNull @Positive BigDecimal price,
        Boolean available,
        String description,
        String imageUrl) {
}

record OrderItemLine(@NotBlank String menuItemId, @NotNull @Positive Integer quantity) {
}

record CreateOrderRequest(@NotNull List<OrderItemLine> items) {
}

record OrderItemDTO(String id, String menuItemId, String menuItemName, Integer quantity, BigDecimal price) {
}

record OrderDTO(
        String id,
        String userId,
        String userFullName,
        String status,
        BigDecimal totalAmount,
        Integer tokenNumber,
        LocalDateTime orderDate,
        List<OrderItemDTO> items) {

    static OrderDTO from(Order o, String userFullName) {
        List<OrderItemDTO> items = o.getItems().stream()
                .map(i -> new OrderItemDTO(
                        i.getId(),
                        i.getMenuItemId(),
                        i.getMenuItem() != null ? i.getMenuItem().getName() : null,
                        i.getQuantity(),
                        i.getPrice()))
                .toList();
        return new OrderDTO(o.getId(), o.getUserId(), userFullName, o.getStatus(),
                o.getTotalAmount(), o.getTokenNumber(), o.getOrderDate(), items);
    }
}
