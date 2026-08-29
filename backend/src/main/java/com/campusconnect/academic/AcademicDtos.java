package com.campusconnect.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

record MaterialDTO(String id, String title, String category, String description, String subject,
                   String fileUrl, String createdBy, String creatorName, LocalDateTime createdAt) {
}

record MaterialRequest(@NotBlank String title, @NotBlank String category, String description,
                       String subject, String fileUrl) {
}

record AssignmentDTO(String id, String title, String description, String course,
                     LocalDateTime dueDate, Integer points, String fileUrl,
                     String createdBy, LocalDateTime createdAt) {

    static AssignmentDTO from(Assignment a) {
        return new AssignmentDTO(a.getId(), a.getTitle(), a.getDescription(), a.getCourse(),
                a.getDueDate(), a.getPoints(), a.getFileUrl(), a.getCreatedBy(), a.getCreatedAt());
    }
}

record AssignmentRequest(@NotBlank String title, String description, @NotBlank String course,
                         @NotNull LocalDateTime dueDate, @NotNull Integer points, String fileUrl) {
}

record GroupMemberDTO(String userId, String userName, LocalDateTime joinedAt) {
}

record GroupDTO(String id, String name, String subject, String description, Integer memberCount,
                String createdBy, LocalDateTime createdAt, List<GroupMemberDTO> members) {
}

record GroupRequest(@NotBlank String name, @NotBlank String category, String description, Integer maxMembers) {
}

record ForumDTO(String id, String topic, String description, String subject, String authorId,
                String authorName, Long posts, LocalDateTime createdAt, LocalDateTime updatedAt) {
}

record ForumRequest(@NotBlank String title, String description, @NotBlank String category, String tags) {
}
