package com.campusconnect.canteen;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    @Query("SELECT m FROM MenuItem m WHERE m.isDeleted = false ORDER BY m.category, m.name")
    List<MenuItem> findAllActive();

    @Query("SELECT m FROM MenuItem m WHERE m.isDeleted = false AND m.category = ?1 ORDER BY m.name")
    List<MenuItem> findActiveByCategory(String category);
}

interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserIdOrderByOrderDateDesc(String userId);

    List<Order> findByStatusOrderByOrderDateDesc(String status);

    List<Order> findByUserIdAndStatusOrderByOrderDateDesc(String userId, String status);

    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findAllOrdered();
}
