package com.campusconnect.canteen;

import com.campusconnect.users.Profile;
import com.campusconnect.users.ProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CanteenServiceTest {

    @Mock MenuItemRepository menuItemRepository;
    @Mock OrderRepository orderRepository;
    @Mock ProfileRepository profileRepository;

    CanteenService service;

    private MenuItem burger;

    @BeforeEach
    void setUp() {
        service = new CanteenService(menuItemRepository, orderRepository, profileRepository);
        burger = new MenuItem();
        burger.setId("m1");
        burger.setName("Burger");
        burger.setCategory("SNACKS");
        burger.setPrice(new BigDecimal("90.00"));
        burger.setAvailable(true);
        burger.setIsDeleted(false);

        lenient().when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(profileRepository.findById("u_student"))
                .thenReturn(Optional.of(profileNamed("Alex Johnson")));
    }

    @Test
    void createOrder_computesTotalAndToken() {
        when(menuItemRepository.findAllById(anySet())).thenReturn(List.of(burger));

        OrderDTO dto = service.createOrder(
                new CreateOrderRequest(List.of(new OrderItemLine("m1", 3))), "u_student");

        assertThat(dto.totalAmount()).isEqualByComparingTo("270.00");
        assertThat(dto.tokenNumber()).isBetween(100, 999);
        assertThat(dto.status()).isEqualTo("PENDING");
        assertThat(dto.items()).singleElement()
                .satisfies(i -> assertThat(i.menuItemName()).isEqualTo("Burger"));
    }

    @Test
    void createOrder_rejectsUnavailableItem() {
        burger.setAvailable(false);
        when(menuItemRepository.findAllById(anySet())).thenReturn(List.of(burger));

        assertThatThrownBy(() -> service.createOrder(
                new CreateOrderRequest(List.of(new OrderItemLine("m1", 1))), "u_student"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void createOrder_rejectsEmptyBasket() {
        assertThatThrownBy(() -> service.createOrder(new CreateOrderRequest(List.of()), "u_student"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateStatus_rejectsUnknownStatus() {
        assertThatThrownBy(() -> service.updateStatus("o1", "TELEPORTED", "u_canteen"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateStatus_transitionsOrder() {
        Order order = new Order();
        order.setStatus("PENDING");
        when(orderRepository.findById("o1")).thenReturn(Optional.of(order));
        OrderDTO dto = service.updateStatus("o1", "ready", "u_canteen");
        assertThat(dto.status()).isEqualTo("READY");
    }

    @Test
    void getMenuItem_missingOrDeletedThrows() {
        MenuItem deleted = new MenuItem();
        deleted.setIsDeleted(true);
        when(menuItemRepository.findById("x")).thenReturn(Optional.of(deleted));
        assertThatThrownBy(() -> service.getMenuItem("x")).isInstanceOf(EntityNotFoundException.class);
    }

    private static Profile profileNamed(String name) {
        Profile p = new Profile();
        p.setFullName(name);
        return p;
    }
}
