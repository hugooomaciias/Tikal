package com.tikal.api.controller;

import com.tikal.api.model.dto.team.*;
import com.tikal.api.service.TeamService;
import com.tikal.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de equipos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getTeams(
            @Parameter(description = "Si true, filtra solo equipos donde el usuario es admin", example = "true", in = ParameterIn.QUERY) @RequestParam(required = false) Boolean isAdmin) {

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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Equipo creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "409", description = "Conflicto (nombre ya existe)"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos para crear un equipo", required = true, content = @Content(schema = @Schema(implementation = CreateTeamRequest.class))) @RequestBody CreateTeamRequest request) {
        TeamDTO response = teamService.createTeam(userService.getAuthenticatedUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/teams/join
     * Join a Team Using an Invitation Code
     */
    @Operation(summary = "Unirse por código", description = "Unirse a un equipo usando su código de invitación.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Unido al equipo correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamDTO.class))),
            @ApiResponse(responseCode = "400", description = "Código inválido"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "409", description = "Conflicto (ya miembro)"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/join")
    public ResponseEntity<TeamDTO> joinTeam(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Código de invitación para unirse al equipo", required = true, content = @Content(schema = @Schema(implementation = JoinTeamRequest.class))) @RequestBody JoinTeamRequest request) {
        TeamDTO response = teamService.joinTeamWithCode(userService.getAuthenticatedUser(), request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/teams/{teamId}/code/regenerate
     * Regenerate the invitation code (Admins Only)
     */
    @Operation(summary = "Regenerar código de invitación", description = "Regenera el código de invitación de un equipo (solo admin). Devuelve el nuevo código.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Nuevo código generado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = JoinTeamRequest.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido (no admin)"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{teamId}/code/regenerate")
    public ResponseEntity<JoinTeamRequest> regenerateInvitationCode(@Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId) {
        Integer myId = userService.getAuthenticatedUser().getId();
        JoinTeamRequest newCode = teamService.regenerateCode(myId, teamId);
        return ResponseEntity.ok(newCode);
    }

    /**
     * DELETE /api/teams/{teamId}/leave
     * Leave a team
     */
    @Operation(summary = "Abandonar equipo", description = "Abandonar un equipo en el que el usuario autenticado es miembro.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuario abandonó el equipo (sin contenido)"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(@Parameter(description = "ID del equipo a abandonar", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.leaveTeam(myId, teamId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/teams/{teamId}
     * Edit General Equipment Data (Admins Only)
     */
    @Operation(summary = "Actualizar equipo", description = "Actualizar datos generales de un equipo (solo admin).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Equipo actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido (no admin)"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamDTO> updateTeam(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos para actualizar el equipo", required = true, content = @Content(schema = @Schema(implementation = UpdateTeamRequest.class))) @RequestBody UpdateTeamRequest request) {
        Integer myId = userService.getAuthenticatedUser().getId();
        TeamDTO response = teamService.updateTeam(myId, teamId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/teams/{teamId}/image
     * Update or delete the computer's image
     */
    @Operation(summary = "Subir imagen del equipo", description = "Sube o elimina la imagen del equipo. El parámetro multipart 'file' es opcional.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Imagen actualizada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamDTO.class))),
            @ApiResponse(responseCode = "400", description = "Archivo inválido"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido (no admin)"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/{teamId}/image")
    public ResponseEntity<TeamDTO> uploadTeamImage(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @Parameter(description = "Archivo de imagen opcional", content = @Content(mediaType = "application/octet-stream", schema = @Schema(type = "string", format = "binary"))) @RequestParam(value = "file", required = false) MultipartFile file) {

        Integer myId = userService.getAuthenticatedUser().getId();
        TeamDTO response = teamService.updateTeamImage(myId, teamId, file);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/teams/{teamId}/members
     * Get all members of a team
     */
    @Operation(summary = "Obtener miembros", description = "Devuelve la lista de miembros de un equipo. El parámetro opcional 'search' filtra por nombre.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de miembros", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamMemberDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembers(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @Parameter(description = "Texto para filtrar por nombre", example = "María", in = ParameterIn.QUERY) @RequestParam(required = false) String search) {

        Integer myId = userService.getAuthenticatedUser().getId();
        return ResponseEntity.ok(teamService.getTeamMembers(myId, teamId, search));
    }

    /**
     * DELETE /api/teams/{teamId}/members/{userId}
     * Remove a member from the team (Admins Only)
     */
    @Operation(summary = "Eliminar miembro", description = "Elimina a un miembro del equipo especificado (solo admin).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Miembro eliminado (sin contenido)"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido (no admin)"),
            @ApiResponse(responseCode = "404", description = "Usuario o equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> kickMember(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @Parameter(description = "ID del usuario a eliminar", example = "45", in = ParameterIn.PATH) @PathVariable Integer userId) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.kickMember(myId, teamId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/teams/{teamId}/members/{userId}/admin
     * Toggle admin status for a team member (Admins Only)
     */
    @Operation(summary = "Alternar admin", description = "Conceder o revocar privilegios de administrador a un miembro del equipo (solo admin).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Estado de admin actualizado (sin contenido)"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido (no admin)"),
            @ApiResponse(responseCode = "404", description = "Usuario o equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{teamId}/members/{userId}/admin")
    public ResponseEntity<Void> toggleAdminStatus(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @Parameter(description = "ID del usuario", example = "45", in = ParameterIn.PATH) @PathVariable Integer userId,
            @Parameter(description = "Nuevo estado de administrador", example = "true", in = ParameterIn.QUERY) @RequestParam Boolean isAdmin) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.updateAdminStatus(myId, teamId, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/teams/{teamId}/members/{userId}/role
     * Update the role of a team member (Admins Only or the own user)
     */
    @Operation(summary = "Actualizar rol", description = "Actualizar el rol de un miembro en el equipo (admin o el propio usuario).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Rol actualizado (sin contenido)"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido"),
            @ApiResponse(responseCode = "404", description = "Usuario o equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{teamId}/members/{userId}/role")
    public ResponseEntity<Void> updateTeamRole(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @Parameter(description = "ID del usuario", example = "45", in = ParameterIn.PATH) @PathVariable Integer userId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevo rol del miembro", required = true, content = @Content(schema = @Schema(implementation = UpdateRoleRequest.class))) @RequestBody UpdateRoleRequest request) {
        Integer myId = userService.getAuthenticatedUser().getId();
        teamService.updateTeamRole(myId, teamId, userId, request.getTeamRole());
        return ResponseEntity.noContent().build();
    }
}
