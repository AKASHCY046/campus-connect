package com.campusconnect.notifications;

import com.campusconnect.common.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
}

record NotificationDTO(String id, String userId, String title, String message, String type,
                       boolean read, LocalDateTime createdAt) {
    static NotificationDTO from(Notification n) {
        return new NotificationDTO(n.getId(), n.getUserId(), n.getTitle(), n.getMessage(),
                n.getType(), Boolean.TRUE.equals(n.getRead()), n.getCreatedAt());
    }
}

record NotificationRequest(@NotBlank String title, @NotBlank String message, String type) {
}

@Service
@Transactional
class NotificationService {

    private final NotificationRepository repo;

    NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    List<NotificationDTO> list(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream().map(NotificationDTO::from).toList();
    }

    NotificationDTO create(String userId, NotificationRequest req, String actor) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(req.title());
        n.setMessage(req.message());
        n.setType(req.type() != null ? req.type() : "info");
        n.setCreatedBy(actor);
        n.setUpdatedBy(actor);
        return NotificationDTO.from(repo.save(n));
    }

    void markAllRead(String userId) {
        List<Notification> items = repo.findByUserIdOrderByCreatedAtDesc(userId);
        items.forEach(n -> n.setRead(true));
        repo.saveAll(items);
    }
}

@RestController
@RequestMapping("/api/v1")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/notifications")
    public ApiResponse<List<NotificationDTO>> list(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.list(jwt.getSubject()));
    }

    @PostMapping("/notifications")
    public ApiResponse<NotificationDTO> create(@RequestBody NotificationRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.create(jwt.getSubject(), req, jwt.getSubject()));
    }

    @PostMapping("/notifications/read-all")
    public ApiResponse<Void> markAllRead(@AuthenticationPrincipal Jwt jwt) {
        service.markAllRead(jwt.getSubject());
        return ApiResponse.success(null, "All notifications marked read");
    }
}
