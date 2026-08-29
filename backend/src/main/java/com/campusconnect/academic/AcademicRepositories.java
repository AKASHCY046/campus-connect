package com.campusconnect.academic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface StudyMaterialRepository extends JpaRepository<StudyMaterial, String> {
    List<StudyMaterial> findAllByOrderByCreatedAtDesc();
}

interface AssignmentRepository extends JpaRepository<Assignment, String> {
    List<Assignment> findAllByOrderByDueDateAsc();
}

interface StudyGroupRepository extends JpaRepository<StudyGroup, String> {
    List<StudyGroup> findAllByOrderByCreatedAtDesc();
}

interface StudyGroupMemberRepository extends JpaRepository<StudyGroupMember, String> {
    List<StudyGroupMember> findByGroupId(String groupId);

    boolean existsByGroupIdAndUserId(String groupId, String userId);
}

interface ForumRepository extends JpaRepository<Forum, String> {
    List<Forum> findAllByOrderByCreatedAtDesc();
}

interface ForumPostRepository extends JpaRepository<ForumPost, String> {
    long countByForumId(String forumId);
}
