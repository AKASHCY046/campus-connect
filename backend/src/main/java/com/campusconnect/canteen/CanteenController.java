package com.campusconnect.canteen;

import com.campusconnect.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CanteenController {

    private final CanteenService service;

    public CanteenController(CanteenService service) {
        this.service = service;
    }

    // ---- Menu ----

    @GetMapping("/menu")
    public ApiResponse<List<MenuItemDTO>> listMenu(@RequestParam(required = false) String category) {
        return ApiResponse.success(service.listMenu(category));
    }

    @GetMapping("/menu/{id}")
    public ApiResponse<MenuItemDTO> getMenuItem(@PathVariable String id) {
        return ApiResponse.success(service.getMenuItem(id));
    }

    @PreAuthorize("hasAnyRole('CANTEEN_STAFF', 'ADMIN')")
    @PostMapping("/menu")
    public ApiResponse<MenuItemDTO> createMenuItem(@Valid @RequestBody MenuItemRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createMenuItem(req, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('CANTEEN_STAFF', 'ADMIN')")
    @PutMapping("/menu/{id}")
    public ApiResponse<MenuItemDTO> updateMenuItem(@PathVariable String id,
                                                   @RequestBody MenuItemRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.updateMenuItem(id, req, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('CANTEEN_STAFF', 'ADMIN')")
    @DeleteMapping("/menu/{id}")
    public ApiResponse<Void> deleteMenuItem(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        service.deleteMenuItem(id, jwt.getSubject());
        return ApiResponse.success(null, "Menu item removed");
    }

    // ---- Orders ----

    @GetMapping("/orders")
    public ApiResponse<List<OrderDTO>> listOrders(@RequestParam(required = false) String userId,
                                                  @RequestParam(required = false) String status) {
        return ApiResponse.success(service.listOrders(userId, status));
    }

    @GetMapping("/orders/{id}")
    public ApiResponse<OrderDTO> getOrder(@PathVariable String id) {
        return ApiResponse.success(service.getOrder(id));
    }

    @PostMapping("/orders")
    public ApiResponse<OrderDTO> createOrder(@Valid @RequestBody CreateOrderRequest req,
                                             @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createOrder(req, jwt.getSubject()));
    }

    @PutMapping("/orders/{id}/status")
    public ApiResponse<OrderDTO> updateStatus(@PathVariable String id,
                                              @RequestParam String status,
                                              @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.updateStatus(id, status, jwt.getSubject()));
    }
}
