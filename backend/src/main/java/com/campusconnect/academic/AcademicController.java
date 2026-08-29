package com.campusconnect.academic;

import com.campusconnect.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AcademicController {

    private static final String FACULTY = "hasAnyRole('PROFESSOR', 'ADMIN')";

    private final AcademicService service;

    public AcademicController(AcademicService service) {
        this.service = service;
    }

    // ---- Materials ----

    @GetMapping("/materials")
    public ApiResponse<List<MaterialDTO>> listMaterials() {
        return ApiResponse.success(service.listMaterials());
    }

    @PreAuthorize(FACULTY)
    @PostMapping("/materials")
    public ApiResponse<MaterialDTO> createMaterial(@Valid @RequestBody MaterialRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createMaterial(req, jwt.getSubject()));
    }

    @PreAuthorize(FACULTY)
    @PutMapping("/materials/{id}")
    public ApiResponse<Void> updateMaterial(@PathVariable String id, @RequestBody MaterialRequest req, @AuthenticationPrincipal Jwt jwt) {
        service.updateMaterial(id, req, jwt.getSubject());
        return ApiResponse.success(null, "Updated");
    }

    @PreAuthorize(FACULTY)
    @DeleteMapping("/materials/{id}")
    public ApiResponse<Void> deleteMaterial(@PathVariable String id) {
        service.deleteMaterial(id);
        return ApiResponse.success(null, "Deleted");
    }

    // ---- Assignments ----

    @GetMapping("/assignments")
    public ApiResponse<List<AssignmentDTO>> listAssignments() {
        return ApiResponse.success(service.listAssignments());
    }

    @PreAuthorize(FACULTY)
    @PostMapping("/assignments")
    public ApiResponse<AssignmentDTO> createAssignment(@Valid @RequestBody AssignmentRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createAssignment(req, jwt.getSubject()));
    }

    @PreAuthorize(FACULTY)
    @PutMapping("/assignments/{id}")
    public ApiResponse<AssignmentDTO> updateAssignment(@PathVariable String id, @RequestBody AssignmentRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.updateAssignment(id, req, jwt.getSubject()));
    }

    @PreAuthorize(FACULTY)
    @DeleteMapping("/assignments/{id}")
    public ApiResponse<Void> deleteAssignment(@PathVariable String id) {
        service.deleteAssignment(id);
        return ApiResponse.success(null, "Deleted");
    }

    // ---- Study groups ----

    @GetMapping("/groups")
    public ApiResponse<List<GroupDTO>> listGroups() {
        return ApiResponse.success(service.listGroups());
    }

    @PostMapping("/groups")
    public ApiResponse<GroupDTO> createGroup(@Valid @RequestBody GroupRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createGroup(req, jwt.getSubject()));
    }

    @PutMapping("/groups/{id}")
    public ApiResponse<Void> updateGroup(@PathVariable String id, @RequestBody GroupRequest req, @AuthenticationPrincipal Jwt jwt) {
        service.updateGroup(id, req, jwt.getSubject());
        return ApiResponse.success(null, "Updated");
    }

    @DeleteMapping("/groups/{id}")
    public ApiResponse<Void> deleteGroup(@PathVariable String id) {
        service.deleteGroup(id);
        return ApiResponse.success(null, "Deleted");
    }

    @PostMapping("/groups/{id}/join")
    public ApiResponse<GroupDTO> joinGroup(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.joinGroup(id, jwt.getSubject()));
    }

    // ---- Forums ----

    @GetMapping("/forums")
    public ApiResponse<List<ForumDTO>> listForums() {
        return ApiResponse.success(service.listForums());
    }

    @PostMapping("/forums")
    public ApiResponse<ForumDTO> createForum(@Valid @RequestBody ForumRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.createForum(req, jwt.getSubject()));
    }

    @PutMapping("/forums/{id}")
    public ApiResponse<Void> updateForum(@PathVariable String id, @RequestBody ForumRequest req, @AuthenticationPrincipal Jwt jwt) {
        service.updateForum(id, req, jwt.getSubject());
        return ApiResponse.success(null, "Updated");
    }

    @DeleteMapping("/forums/{id}")
    public ApiResponse<Void> deleteForum(@PathVariable String id) {
        service.deleteForum(id);
        return ApiResponse.success(null, "Deleted");
    }
}
