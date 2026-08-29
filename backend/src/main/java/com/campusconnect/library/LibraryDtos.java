package com.campusconnect.library;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

record BookDTO(
        String id,
        String title,
        String author,
        String isbn,
        String category,
        Integer totalCopies,
        Integer availableCopies,
        String coverUrl,
        String description,
        LocalDateTime createdAt) {

    static BookDTO from(Book b) {
        return new BookDTO(b.getId(), b.getTitle(), b.getAuthor(), b.getIsbn(), b.getCategory(),
                b.getTotalCopies(), b.getAvailableCopies(), b.getCoverUrl(), b.getDescription(), b.getCreatedAt());
    }
}

record BookRequest(
        @NotBlank String title,
        @NotBlank String author,
        String isbn,
        String category,
        @NotNull @Positive Integer totalCopies,
        String description,
        String coverUrl) {
}

record BookUpdateRequest(
        String title,
        String author,
        String isbn,
        String category,
        Integer totalCopies,
        String description,
        String coverUrl) {
}

record IssuedBookDTO(
        String id,
        String bookId,
        String bookTitle,
        String userId,
        LocalDate issueDate,
        LocalDate returnDate,
        LocalDate actualReturnDate,
        String status,
        String notes,
        LocalDateTime createdAt) {

    static IssuedBookDTO from(IssuedBook ib) {
        String title = ib.getBook() != null ? ib.getBook().getTitle() : null;
        return new IssuedBookDTO(ib.getId(), ib.getBookId(), title, ib.getUserId(),
                ib.getIssueDate(), ib.getReturnDate(), ib.getActualReturnDate(),
                ib.getStatus(), ib.getNotes(), ib.getCreatedAt());
    }
}

record DenyRequest(String notes) {
}

record FineDTO(
        String id,
        String issuedBookId,
        String userId,
        BigDecimal amount,
        String status,
        LocalDateTime paidDate,
        LocalDateTime createdAt) {

    static FineDTO from(Fine f) {
        return new FineDTO(f.getId(), f.getIssuedBookId(), f.getUserId(), f.getAmount(),
                f.getStatus(), f.getPaidDate(), f.getCreatedAt());
    }
}
