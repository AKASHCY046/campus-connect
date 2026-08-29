package com.campusconnect.library;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class LibraryService {

    private static final int LOAN_DAYS = 14;
    private static final BigDecimal FINE_PER_DAY = new BigDecimal("5.00");

    private final BookRepository bookRepository;
    private final IssuedBookRepository issuedBookRepository;
    private final FineRepository fineRepository;

    public LibraryService(BookRepository bookRepository,
                          IssuedBookRepository issuedBookRepository,
                          FineRepository fineRepository) {
        this.bookRepository = bookRepository;
        this.issuedBookRepository = issuedBookRepository;
        this.fineRepository = fineRepository;
    }

    // ---- Books ----

    @Transactional(readOnly = true)
    public List<BookDTO> listBooks(String search, String category) {
        return bookRepository.findAll().stream()
                .filter(b -> !Boolean.TRUE.equals(b.getIsDeleted()))
                .filter(b -> search == null || search.isBlank()
                        || b.getTitle().toLowerCase().contains(search.toLowerCase())
                        || b.getAuthor().toLowerCase().contains(search.toLowerCase()))
                .filter(b -> category == null || category.isBlank() || category.equalsIgnoreCase(b.getCategory()))
                .map(BookDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookDTO getBook(String id) {
        return BookDTO.from(activeBook(id));
    }

    public BookDTO createBook(BookRequest req, String actor) {
        Book b = new Book();
        b.setTitle(req.title());
        b.setAuthor(req.author());
        b.setIsbn(req.isbn());
        b.setCategory(req.category() != null ? req.category() : "General");
        b.setTotalCopies(req.totalCopies());
        b.setAvailableCopies(req.totalCopies());
        b.setDescription(req.description());
        b.setCoverUrl(req.coverUrl());
        b.setCreatedBy(actor);
        b.setUpdatedBy(actor);
        return BookDTO.from(bookRepository.save(b));
    }

    public BookDTO updateBook(String id, BookUpdateRequest req, String actor) {
        Book b = activeBook(id);
        if (req.title() != null) b.setTitle(req.title());
        if (req.author() != null) b.setAuthor(req.author());
        if (req.isbn() != null) b.setIsbn(req.isbn());
        if (req.category() != null) b.setCategory(req.category());
        if (req.description() != null) b.setDescription(req.description());
        if (req.coverUrl() != null) b.setCoverUrl(req.coverUrl());
        if (req.totalCopies() != null) {
            int delta = req.totalCopies() - b.getTotalCopies();
            b.setTotalCopies(req.totalCopies());
            b.setAvailableCopies(Math.max(0, b.getAvailableCopies() + delta));
        }
        b.setUpdatedBy(actor);
        return BookDTO.from(bookRepository.save(b));
    }

    public void deleteBook(String id, String actor) {
        Book b = activeBook(id);
        b.setIsDeleted(true);
        b.setUpdatedBy(actor);
        bookRepository.save(b);
    }

    private Book activeBook(String id) {
        Book b = bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));
        if (Boolean.TRUE.equals(b.getIsDeleted())) throw new EntityNotFoundException("Book not found");
        return b;
    }

    // ---- Issued books ----

    @Transactional(readOnly = true)
    public List<IssuedBookDTO> listIssued(String userId, String status) {
        List<IssuedBook> list;
        if (userId != null && !userId.isBlank()) {
            list = issuedBookRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else if (status != null && !status.isBlank()) {
            list = issuedBookRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            list = issuedBookRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(IssuedBookDTO::from).toList();
    }

    public IssuedBookDTO requestBook(String bookId, String userId) {
        Book book = activeBook(bookId);
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("This book has no available copies");
        }
        IssuedBook ib = new IssuedBook();
        ib.setBookId(bookId);
        ib.setUserId(userId);
        ib.setStatus("PENDING");
        ib.setCreatedBy(userId);
        ib.setUpdatedBy(userId);
        IssuedBook saved = issuedBookRepository.save(ib);
        saved.setBook(book);
        return IssuedBookDTO.from(saved);
    }

    public IssuedBookDTO approve(String id, String actor) {
        IssuedBook ib = issuedBookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));
        Book book = activeBook(ib.getBookId());
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available to issue");
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        ib.setStatus("APPROVED");
        ib.setIssueDate(LocalDate.now());
        ib.setReturnDate(LocalDate.now().plusDays(LOAN_DAYS));
        ib.setUpdatedBy(actor);
        IssuedBook saved = issuedBookRepository.save(ib);
        saved.setBook(book);
        return IssuedBookDTO.from(saved);
    }

    public IssuedBookDTO deny(String id, String notes, String actor) {
        IssuedBook ib = issuedBookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));
        ib.setStatus("REJECTED");
        ib.setNotes(notes);
        ib.setUpdatedBy(actor);
        return IssuedBookDTO.from(issuedBookRepository.save(ib));
    }

    public IssuedBookDTO returnBook(String id, String actor) {
        IssuedBook ib = issuedBookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Loan not found"));
        if (!"APPROVED".equals(ib.getStatus())) {
            throw new IllegalStateException("Only an issued book can be returned");
        }

        Book book = bookRepository.findById(ib.getBookId()).orElse(null);
        if (book != null) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }

        LocalDate today = LocalDate.now();
        ib.setStatus("RETURNED");
        ib.setActualReturnDate(today);
        ib.setUpdatedBy(actor);
        IssuedBook saved = issuedBookRepository.save(ib);

        if (ib.getReturnDate() != null && today.isAfter(ib.getReturnDate())) {
            long overdue = ChronoUnit.DAYS.between(ib.getReturnDate(), today);
            Fine fine = new Fine();
            fine.setUserId(ib.getUserId());
            fine.setIssuedBookId(ib.getId());
            fine.setAmount(FINE_PER_DAY.multiply(BigDecimal.valueOf(overdue)));
            fine.setStatus("PENDING");
            fine.setCreatedBy(actor);
            fine.setUpdatedBy(actor);
            fineRepository.save(fine);
        }

        saved.setBook(book);
        return IssuedBookDTO.from(saved);
    }

    // ---- Fines ----

    @Transactional(readOnly = true)
    public List<FineDTO> listFines(String userId) {
        List<Fine> list = (userId != null && !userId.isBlank())
                ? fineRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : fineRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(FineDTO::from).toList();
    }

    public FineDTO payFine(String id, String actor) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fine not found"));
        fine.setStatus("PAID");
        fine.setPaidDate(LocalDateTime.now());
        fine.setUpdatedBy(actor);
        return FineDTO.from(fineRepository.save(fine));
    }
}
