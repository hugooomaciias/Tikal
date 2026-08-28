package com.tikal.api.controller;

import com.tikal.api.model.dto.team.*;
import com.tikal.api.service.TeamService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final UserService userService;

    /**
     * GET /api/teams
     * Search the actual user teams
     */
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getTeams(
            @RequestParam(required = false) Boolean isAdmin) {

        List<TeamDTO> response = teamService.searchTeams(
                userService.getAuthenticatedUser(),
                isAdmin
        );
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/teams
     * Create a new Team
     */
    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody CreateTeamRequest request) {
        TeamDTO response = teamService.createTeam(userService.getAuthenticatedUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/teams/join
     * Join a Team Using an Invitation Code
     */
    @PostMapping("/join")
    public ResponseEntity<TeamDTO> joinTeam(@RequestBody JoinTeamRequest request) {
        TeamDTO response = teamService.joinTeamWithCode(userService.getAuthenticatedUser(), request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/teams/{teamId}/code/regenerate
     * Regenerate the invitation code (Admins Only)
     */
    @PatchMapping("/{teamId}/code/regenerate")
    public ResponseEntity<JoinTeamRequest> regenerateInvitationCode(@PathVariable Integer teamId) {
        Integer myId = userService.getAuthenticatedUser().getId();
        JoinTeamRequest newCode = teamService.regenerateCode(myId, teamId);
        return ResponseEntity.ok(newCode);
    }

    /**
     * DELETE /api/teams/{teamId}/leave
     * Leave a team
     */
    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(@PathVariable Integer teamId) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.leaveTeam(myId, teamId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/teams/{teamId}
     * Edit General Equipment Data (Admins Only)
     */
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamDTO> updateTeam(
            @PathVariable Integer teamId,
            @RequestBody UpdateTeamRequest request) {
        Integer myId = userService.getAuthenticatedUser().getId();
        TeamDTO response = teamService.updateTeam(myId, teamId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/teams/{teamId}/image
     * Update or delete the computer's image
     */
    @PostMapping("/{teamId}/image")
    public ResponseEntity<TeamDTO> uploadTeamImage(
            @PathVariable Integer teamId,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Integer myId = userService.getAuthenticatedUser().getId();
        TeamDTO response = teamService.updateTeamImage(myId, teamId, file);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/teams/{teamId}/members
     * Get all members of a team
     */
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembers(
            @PathVariable Integer teamId,
            @RequestParam(required = false) String search) {

        Integer myId = userService.getAuthenticatedUser().getId();
        return ResponseEntity.ok(teamService.getTeamMembers(myId, teamId, search));
    }

    /**
     * DELETE /api/teams/{teamId}/members/{userId}
     * Remove a member from the team (Admins Only)
     */
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> kickMember(
            @PathVariable Integer teamId,
            @PathVariable Integer userId) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.kickMember(myId, teamId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/teams/{teamId}/members/{userId}/admin
     * Toggle admin status for a team member (Admins Only)
     */
    @PatchMapping("/{teamId}/members/{userId}/admin")
    public ResponseEntity<Void> toggleAdminStatus(
            @PathVariable Integer teamId,
            @PathVariable Integer userId,
            @RequestParam Boolean isAdmin) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.updateAdminStatus(myId, teamId, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/teams/{teamId}/members/{userId}/role
     * Update the role of a team member (Admins Only or the own user)
     */
    @PatchMapping("/{teamId}/members/{userId}/role")
    public ResponseEntity<Void> updateTeamRole(
            @PathVariable Integer teamId,
            @PathVariable Integer userId,
            @RequestBody UpdateRoleRequest request) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.updateTeamRole(myId, teamId, userId, request.getTeamRole());
        return ResponseEntity.noContent().build();
    }
}
