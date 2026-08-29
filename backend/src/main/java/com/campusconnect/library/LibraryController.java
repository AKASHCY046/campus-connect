package com.campusconnect.library;

import com.campusconnect.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class LibraryController {

    private final LibraryService service;

    public LibraryController(LibraryService service) {
        this.service = service;
    }

    // ---- Books ----

    @GetMapping("/books")
    public ApiResponse<List<BookDTO>> listBooks(@RequestParam(required = false) String search,
                                                @RequestParam(required = false) String category) {
        return ApiResponse.success(service.listBooks(search, category));
    }

    @GetMapping("/books/{id}")
    public ApiResponse<BookDTO> getBook(@PathVariable String id) {
        return ApiResponse.success(service.getBook(id));
    }

    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @PostMapping("/books")
    public ApiResponse<BookDTO> createBook(@Valid @RequestBody BookRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createBook(req, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @PutMapping("/books/{id}")
    public ApiResponse<BookDTO> updateBook(@PathVariable String id,
                                           @RequestBody BookUpdateRequest req,
                                           @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.updateBook(id, req, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @DeleteMapping("/books/{id}")
    public ApiResponse<Void> deleteBook(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        service.deleteBook(id, jwt.getSubject());
        return ApiResponse.success(null, "Book removed");
    }

    // ---- Issued books ----

    @GetMapping("/issued-books")
    public ApiResponse<List<IssuedBookDTO>> listIssued(@RequestParam(required = false) String userId,
                                                       @RequestParam(required = false) String status) {
        return ApiResponse.success(service.listIssued(userId, status));
    }

    @PostMapping("/issued-books/request")
    public ApiResponse<IssuedBookDTO> requestBook(@RequestParam String bookId, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.requestBook(bookId, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @PutMapping("/issued-books/{id}/approve")
    public ApiResponse<IssuedBookDTO> approve(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.approve(id, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @PutMapping("/issued-books/{id}/deny")
    public ApiResponse<IssuedBookDTO> deny(@PathVariable String id,
                                           @RequestBody(required = false) DenyRequest req,
                                           @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.deny(id, req != null ? req.notes() : null, jwt.getSubject()));
    }

    @PostMapping("/issued-books/{id}/return")
    public ApiResponse<IssuedBookDTO> returnBook(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.returnBook(id, jwt.getSubject()));
    }

    // ---- Fines ----

    @GetMapping("/fines")
    public ApiResponse<List<FineDTO>> listFines(@RequestParam(required = false) String userId) {
        return ApiResponse.success(service.listFines(userId));
    }

    @PostMapping("/fines/{id}/pay")
    public ApiResponse<FineDTO> payFine(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.payFine(id, jwt.getSubject()));
    }
}
