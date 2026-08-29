package com.campusconnect.academic;

import com.campusconnect.users.Profile;
import com.campusconnect.users.ProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AcademicService {

    private final StudyMaterialRepository materialRepo;
    private final AssignmentRepository assignmentRepo;
    private final StudyGroupRepository groupRepo;
    private final StudyGroupMemberRepository memberRepo;
    private final ForumRepository forumRepo;
    private final ForumPostRepository postRepo;
    private final ProfileRepository profileRepo;

    public AcademicService(StudyMaterialRepository materialRepo, AssignmentRepository assignmentRepo,
                           StudyGroupRepository groupRepo, StudyGroupMemberRepository memberRepo,
                           ForumRepository forumRepo, ForumPostRepository postRepo,
                           ProfileRepository profileRepo) {
        this.materialRepo = materialRepo;
        this.assignmentRepo = assignmentRepo;
        this.groupRepo = groupRepo;
        this.memberRepo = memberRepo;
        this.forumRepo = forumRepo;
        this.postRepo = postRepo;
        this.profileRepo = profileRepo;
    }

    private String nameOf(String userId) {
        return profileRepo.findById(userId).map(Profile::getFullName).orElse(null);
    }

    // ---- Materials ----

    @Transactional(readOnly = true)
    public List<MaterialDTO> listMaterials() {
        return materialRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(m -> new MaterialDTO(m.getId(), m.getTitle(), m.getCategory(), m.getDescription(),
                        m.getSubject(), m.getFileUrl(), m.getCreatedBy(), nameOf(m.getCreatedBy()), m.getCreatedAt()))
                .toList();
    }

    public MaterialDTO createMaterial(MaterialRequest req, String actor) {
        StudyMaterial m = new StudyMaterial();
        m.setTitle(req.title());
        m.setCategory(req.category());
        m.setDescription(req.description());
        m.setSubject(req.subject() != null ? req.subject() : "General");
        m.setFileUrl(req.fileUrl() != null ? req.fileUrl() : "");
        m.setCreatedBy(actor);
        m.setUpdatedBy(actor);
        StudyMaterial saved = materialRepo.save(m);
        return new MaterialDTO(saved.getId(), saved.getTitle(), saved.getCategory(), saved.getDescription(),
                saved.getSubject(), saved.getFileUrl(), actor, nameOf(actor), saved.getCreatedAt());
    }

    public void updateMaterial(String id, MaterialRequest req, String actor) {
        StudyMaterial m = materialRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Material not found"));
        if (req.title() != null) m.setTitle(req.title());
        if (req.category() != null) m.setCategory(req.category());
        if (req.description() != null) m.setDescription(req.description());
        if (req.subject() != null) m.setSubject(req.subject());
        m.setUpdatedBy(actor);
        materialRepo.save(m);
    }

    public void deleteMaterial(String id) {
        materialRepo.deleteById(id);
    }

    // ---- Assignments ----

    @Transactional(readOnly = true)
    public List<AssignmentDTO> listAssignments() {
        return assignmentRepo.findAllByOrderByDueDateAsc().stream().map(AssignmentDTO::from).toList();
    }

    public AssignmentDTO createAssignment(AssignmentRequest req, String actor) {
        Assignment a = new Assignment();
        a.setTitle(req.title());
        a.setDescription(req.description());
        a.setCourse(req.course());
        a.setDueDate(req.dueDate());
        a.setPoints(req.points());
        a.setFileUrl(req.fileUrl());
        a.setCreatedBy(actor);
        a.setUpdatedBy(actor);
        return AssignmentDTO.from(assignmentRepo.save(a));
    }

    public AssignmentDTO updateAssignment(String id, AssignmentRequest req, String actor) {
        Assignment a = assignmentRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Assignment not found"));
        if (req.title() != null) a.setTitle(req.title());
        if (req.description() != null) a.setDescription(req.description());
        if (req.course() != null) a.setCourse(req.course());
        if (req.dueDate() != null) a.setDueDate(req.dueDate());
        if (req.points() != null) a.setPoints(req.points());
        if (req.fileUrl() != null) a.setFileUrl(req.fileUrl());
        a.setUpdatedBy(actor);
        return AssignmentDTO.from(assignmentRepo.save(a));
    }

    public void deleteAssignment(String id) {
        assignmentRepo.deleteById(id);
    }

    // ---- Study groups ----

    @Transactional(readOnly = true)
    public List<GroupDTO> listGroups() {
        List<StudyGroup> groups = groupRepo.findAllByOrderByCreatedAtDesc();
        return groups.stream().map(this::toGroupDto).toList();
    }

    private GroupDTO toGroupDto(StudyGroup g) {
        List<StudyGroupMember> members = memberRepo.findByGroupId(g.getId());
        Map<String, String> names = profileRepo.findAllById(members.stream().map(StudyGroupMember::getUserId).toList())
                .stream().collect(Collectors.toMap(Profile::getId, Profile::getFullName, (a, b) -> a));
        List<GroupMemberDTO> memberDtos = members.stream()
                .map(m -> new GroupMemberDTO(m.getUserId(), names.get(m.getUserId()), m.getJoinedAt()))
                .toList();
        return new GroupDTO(g.getId(), g.getName(), g.getCategory(), g.getDescription(),
                g.getMemberCount(), g.getCreatedBy(), g.getCreatedAt(), memberDtos);
    }

    public GroupDTO createGroup(GroupRequest req, String actor) {
        StudyGroup g = new StudyGroup();
        g.setName(req.name());
        g.setCategory(req.category());
        g.setDescription(req.description());
        g.setMemberCount(1);
        g.setCreatedBy(actor);
        g.setUpdatedBy(actor);
        StudyGroup saved = groupRepo.save(g);
        addMember(saved.getId(), actor);
        return toGroupDto(saved);
    }

    public void updateGroup(String id, GroupRequest req, String actor) {
        StudyGroup g = groupRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (req.name() != null) g.setName(req.name());
        if (req.category() != null) g.setCategory(req.category());
        if (req.description() != null) g.setDescription(req.description());
        g.setUpdatedBy(actor);
        groupRepo.save(g);
    }

    public void deleteGroup(String id) {
        groupRepo.deleteById(id);
    }

    public GroupDTO joinGroup(String groupId, String userId) {
        StudyGroup g = groupRepo.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!memberRepo.existsByGroupIdAndUserId(groupId, userId)) {
            addMember(groupId, userId);
            g.setMemberCount(g.getMemberCount() + 1);
            groupRepo.save(g);
        }
        return toGroupDto(g);
    }

    private void addMember(String groupId, String userId) {
        StudyGroupMember m = new StudyGroupMember();
        m.setGroupId(groupId);
        m.setUserId(userId);
        m.setJoinedAt(LocalDateTime.now());
        m.setCreatedBy(userId);
        m.setUpdatedBy(userId);
        memberRepo.save(m);
    }

    // ---- Forums ----

    @Transactional(readOnly = true)
    public List<ForumDTO> listForums() {
        return forumRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(f -> new ForumDTO(f.getId(), f.getTitle(), f.getDescription(), f.getCategory(),
                        f.getCreatedBy(), nameOf(f.getCreatedBy()), postRepo.countByForumId(f.getId()),
                        f.getCreatedAt(), f.getUpdatedAt()))
                .toList();
    }

    public ForumDTO createForum(ForumRequest req, String actor) {
        Forum f = new Forum();
        f.setTitle(req.title());
        f.setCategory(req.category());
        f.setDescription(req.description());
        f.setCreatedBy(actor);
        f.setUpdatedBy(actor);
        Forum saved = forumRepo.save(f);
        return new ForumDTO(saved.getId(), saved.getTitle(), saved.getDescription(), saved.getCategory(),
                actor, nameOf(actor), 0L, saved.getCreatedAt(), saved.getUpdatedAt());
    }

    public void updateForum(String id, ForumRequest req, String actor) {
        Forum f = forumRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Forum not found"));
        if (req.title() != null) f.setTitle(req.title());
        if (req.category() != null) f.setCategory(req.category());
        if (req.description() != null) f.setDescription(req.description());
        f.setUpdatedBy(actor);
        forumRepo.save(f);
    }

    public void deleteForum(String id) {
        forumRepo.deleteById(id);
    }
}
