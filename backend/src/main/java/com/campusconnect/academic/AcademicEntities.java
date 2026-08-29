package com.campusconnect.academic;

import com.campusconnect.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_materials")
@Getter
@Setter
@NoArgsConstructor
class StudyMaterial extends BaseEntity {
    @Column(nullable = false)
    private String title;
    @Column(length = 512)
    private String description;
    @Column(name = "file_url", nullable = false, length = 512)
    private String fileUrl = "";
    @Column(nullable = false, length = 50)
    private String category;
    @Column(length = 100)
    private String subject;
}

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
class Assignment extends BaseEntity {
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "file_url", length = 512)
    private String fileUrl;
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    @Column(nullable = false)
    private Integer points;
    @Column(nullable = false, length = 100)
    private String course;
}

@Entity
@Table(name = "study_groups")
@Getter
@Setter
@NoArgsConstructor
class StudyGroup extends BaseEntity {
    @Column(nullable = false)
    private String name;
    @Column(length = 512)
    private String description;
    @Column(nullable = false, length = 100)
    private String category;
    @Column(name = "member_count", nullable = false)
    private Integer memberCount = 0;
}

@Entity
@Table(name = "study_group_members")
@Getter
@Setter
@NoArgsConstructor
class StudyGroupMember extends BaseEntity {
    @Column(name = "group_id", nullable = false)
    private String groupId;
    @Column(name = "user_id", nullable = false)
    private String userId;
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;
}

@Entity
@Table(name = "forums")
@Getter
@Setter
@NoArgsConstructor
class Forum extends BaseEntity {
    @Column(nullable = false)
    private String title;
    @Column(length = 512)
    private String description;
    @Column(nullable = false, length = 100)
    private String category;
}

@Entity
@Table(name = "forum_posts")
@Getter
@Setter
@NoArgsConstructor
class ForumPost extends BaseEntity {
    @Column(name = "forum_id", nullable = false)
    private String forumId;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
}
