package com.tikal.api.controller;

import com.tikal.api.model.dto.team.*;
import com.tikal.api.service.TeamService;
import com.tikal.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Operaciones relacionadas con equipos y sus miembros")
@SecurityRequirement(name = "bearerAuth")
public class TeamController {

    private final TeamService teamService;
    private final UserService userService;

    /**
     * GET /api/teams
     * Search the actual user teams
     */
    @Operation(summary = "Buscar equipos", description = "Busca los equipos en los que participa el usuario autenticado. El parámetro opcional 'isAdmin' filtra por membresía de administrador.")
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
    @Operation(summary = "Crear equipo", description = "Crea un nuevo equipo. El usuario autenticado se convierte en propietario/administrador del equipo creado.")
    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody CreateTeamRequest request) {
        TeamDTO response = teamService.createTeam(userService.getAuthenticatedUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/teams/join
     * Join a Team Using an Invitation Code
     */
    @Operation(summary = "Unirse por código", description = "Unirse a un equipo usando su código de invitación.")
    @PostMapping("/join")
    public ResponseEntity<TeamDTO> joinTeam(@RequestBody JoinTeamRequest request) {
        TeamDTO response = teamService.joinTeamWithCode(userService.getAuthenticatedUser(), request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/teams/{teamId}/code/regenerate
     * Regenerate the invitation code (Admins Only)
     */
    @Operation(summary = "Regenerar código de invitación", description = "Regenera el código de invitación de un equipo (solo admin). Devuelve el nuevo código.")
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
    @Operation(summary = "Abandonar equipo", description = "Abandonar un equipo en el que el usuario autenticado es miembro.")
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
    @Operation(summary = "Actualizar equipo", description = "Actualizar datos generales de un equipo (solo admin).")
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
    @Operation(summary = "Subir imagen del equipo", description = "Sube o elimina la imagen del equipo. El parámetro multipart 'file' es opcional.")
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
    @Operation(summary = "Obtener miembros", description = "Devuelve la lista de miembros de un equipo. El parámetro opcional 'search' filtra por nombre.")
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
    @Operation(summary = "Eliminar miembro", description = "Elimina a un miembro del equipo especificado (solo admin).")
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
    @Operation(summary = "Alternar admin", description = "Conceder o revocar privilegios de administrador a un miembro del equipo (solo admin).")
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
    @Operation(summary = "Actualizar rol", description = "Actualizar el rol de un miembro en el equipo (admin o el propio usuario).")
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
