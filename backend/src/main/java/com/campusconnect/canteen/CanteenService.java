package com.campusconnect.canteen;

import com.campusconnect.users.Profile;
import com.campusconnect.users.ProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class CanteenService {

    private static final Set<String> ORDER_STATUSES =
            Set.of("PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED");

    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final ProfileRepository profileRepository;

    public CanteenService(MenuItemRepository menuItemRepository,
                          OrderRepository orderRepository,
                          ProfileRepository profileRepository) {
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.profileRepository = profileRepository;
    }

    // ---- Menu ----

    @Transactional(readOnly = true)
    public List<MenuItemDTO> listMenu(String category) {
        List<MenuItem> items = (category == null || category.isBlank())
                ? menuItemRepository.findAllActive()
                : menuItemRepository.findActiveByCategory(category.toUpperCase());
        return items.stream().map(MenuItemDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public MenuItemDTO getMenuItem(String id) {
        return MenuItemDTO.from(activeMenuItem(id));
    }

    public MenuItemDTO createMenuItem(MenuItemRequest req, String actor) {
        MenuItem m = new MenuItem();
        apply(m, req);
        m.setCreatedBy(actor);
        m.setUpdatedBy(actor);
        return MenuItemDTO.from(menuItemRepository.save(m));
    }

    public MenuItemDTO updateMenuItem(String id, MenuItemRequest req, String actor) {
        MenuItem m = activeMenuItem(id);
        apply(m, req);
        m.setUpdatedBy(actor);
        return MenuItemDTO.from(menuItemRepository.save(m));
    }

    public void deleteMenuItem(String id, String actor) {
        MenuItem m = activeMenuItem(id);
        m.setIsDeleted(true);
        m.setUpdatedBy(actor);
        menuItemRepository.save(m);
    }

    private void apply(MenuItem m, MenuItemRequest req) {
        if (req.name() != null) m.setName(req.name());
        if (req.category() != null) m.setCategory(req.category().toUpperCase());
        if (req.price() != null) m.setPrice(req.price());
        if (req.available() != null) m.setAvailable(req.available());
        if (req.description() != null) m.setDescription(req.description());
        if (req.imageUrl() != null) m.setImageUrl(req.imageUrl());
    }

    private MenuItem activeMenuItem(String id) {
        MenuItem m = menuItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));
        if (Boolean.TRUE.equals(m.getIsDeleted())) {
            throw new EntityNotFoundException("Menu item not found");
        }
        return m;
    }

    // ---- Orders ----

    @Transactional(readOnly = true)
    public List<OrderDTO> listOrders(String userId, String status) {
        List<Order> orders;
        if (userId != null && status != null) {
            orders = orderRepository.findByUserIdAndStatusOrderByOrderDateDesc(userId, status.toUpperCase());
        } else if (userId != null) {
            orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        } else if (status != null) {
            orders = orderRepository.findByStatusOrderByOrderDateDesc(status.toUpperCase());
        } else {
            orders = orderRepository.findAllOrdered();
        }
        return orders.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrder(String id) {
        return toDto(orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found")));
    }

    public OrderDTO createOrder(CreateOrderRequest req, String userId) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new IllegalArgumentException("An order must contain at least one item");
        }

        Map<String, MenuItem> menuItems = menuItemRepository.findAllById(
                        req.items().stream().map(OrderItemLine::menuItemId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(MenuItem::getId, m -> m));

        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setTokenNumber(ThreadLocalRandom.current().nextInt(100, 1000));
        order.setCreatedBy(userId);
        order.setUpdatedBy(userId);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemLine line : req.items()) {
            MenuItem menu = menuItems.get(line.menuItemId());
            if (menu == null || Boolean.TRUE.equals(menu.getIsDeleted())) {
                throw new EntityNotFoundException("Menu item not found: " + line.menuItemId());
            }
            if (!Boolean.TRUE.equals(menu.getAvailable())) {
                throw new IllegalStateException(menu.getName() + " is not available");
            }
            OrderItem item = new OrderItem();
            item.setMenuItemId(menu.getId());
            item.setMenuItem(menu);
            item.setQuantity(line.quantity());
            item.setPrice(menu.getPrice());
            item.setCreatedBy(userId);
            item.setUpdatedBy(userId);
            order.addItem(item);
            total = total.add(menu.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        order.setTotalAmount(total);

        return toDto(orderRepository.save(order));
    }

    public OrderDTO updateStatus(String id, String status, String actor) {
        String normalized = status == null ? "" : status.toUpperCase();
        if (!ORDER_STATUSES.contains(normalized)) {
            throw new IllegalArgumentException("Unknown order status: " + status);
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setStatus(normalized);
        order.setUpdatedBy(actor);
        return toDto(orderRepository.save(order));
    }

    private OrderDTO toDto(Order o) {
        String name = profileRepository.findById(o.getUserId()).map(Profile::getFullName).orElse(null);
        return OrderDTO.from(o, name);
    }
}
