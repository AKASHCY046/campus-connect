package com.campusconnect.library;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface IssuedBookRepository extends JpaRepository<IssuedBook, String> {
    List<IssuedBook> findByUserIdOrderByCreatedAtDesc(String userId);

    List<IssuedBook> findByStatusOrderByCreatedAtDesc(String status);

    List<IssuedBook> findAllByOrderByCreatedAtDesc();
}

interface FineRepository extends JpaRepository<Fine, String> {
    List<Fine> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Fine> findAllByOrderByCreatedAtDesc();
}
