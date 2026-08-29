package com.campusconnect.library;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {

    @Mock BookRepository bookRepository;
    @Mock IssuedBookRepository issuedBookRepository;
    @Mock FineRepository fineRepository;

    LibraryService service;
    Book book;

    @BeforeEach
    void setUp() {
        service = new LibraryService(bookRepository, issuedBookRepository, fineRepository);
        book = new Book();
        book.setId("b1");
        book.setTitle("Clean Code");
        book.setAuthor("Robert Martin");
        book.setTotalCopies(3);
        book.setAvailableCopies(2);
        book.setIsDeleted(false);

        lenient().when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(issuedBookRepository.save(any(IssuedBook.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(fineRepository.save(any(Fine.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(bookRepository.findById("b1")).thenReturn(Optional.of(book));
    }

    @Test
    void requestBook_rejectedWhenNoCopies() {
        book.setAvailableCopies(0);
        assertThatThrownBy(() -> service.requestBook("b1", "u_student"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void approve_decrementsAvailableCopiesAndSetsDueDate() {
        IssuedBook req = issued("i1", "b1", "PENDING");
        when(issuedBookRepository.findById("i1")).thenReturn(Optional.of(req));

        IssuedBookDTO dto = service.approve("i1", "u_librarian");

        assertThat(dto.status()).isEqualTo("APPROVED");
        assertThat(dto.returnDate()).isEqualTo(LocalDate.now().plusDays(14));
        assertThat(book.getAvailableCopies()).isEqualTo(1);
    }

    @Test
    void returnBook_onTime_incrementsCopiesAndRaisesNoFine() {
        IssuedBook loan = issued("i1", "b1", "APPROVED");
        loan.setReturnDate(LocalDate.now().plusDays(3));
        when(issuedBookRepository.findById("i1")).thenReturn(Optional.of(loan));

        service.returnBook("i1", "u_librarian");

        assertThat(book.getAvailableCopies()).isEqualTo(3);
        verify(fineRepository, never()).save(any());
    }

    @Test
    void returnBook_overdue_raisesFine() {
        IssuedBook loan = issued("i1", "b1", "APPROVED");
        loan.setReturnDate(LocalDate.now().minusDays(4));
        when(issuedBookRepository.findById("i1")).thenReturn(Optional.of(loan));

        service.returnBook("i1", "u_librarian");

        ArgumentCaptor<Fine> captor = ArgumentCaptor.forClass(Fine.class);
        verify(fineRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("20.00"); // 4 days * 5
        assertThat(captor.getValue().getStatus()).isEqualTo("PENDING");
    }

    @Test
    void payFine_marksPaid() {
        Fine fine = new Fine();
        fine.setStatus("PENDING");
        when(fineRepository.findById("f1")).thenReturn(Optional.of(fine));

        FineDTO dto = service.payFine("f1", "u_librarian");

        assertThat(dto.status()).isEqualTo("PAID");
        assertThat(dto.paidDate()).isNotNull();
    }

    private static IssuedBook issued(String id, String bookId, String status) {
        IssuedBook ib = new IssuedBook();
        ib.setId(id);
        ib.setBookId(bookId);
        ib.setUserId("u_student");
        ib.setStatus(status);
        return ib;
    }
}
