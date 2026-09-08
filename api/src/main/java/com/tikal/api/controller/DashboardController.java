package com.tikal.api.controller;

import com.tikal.api.model.dto.sync.ProjectDashboardDTO;
import com.tikal.api.model.dto.sync.TeamMemberDashboardDTO;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.domain.GamificationEventDTO;
import com.tikal.api.model.dto.temple.TempleUpdateResponse;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.TimeLogRepository;
import com.tikal.api.service.*;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints para construir la vista del dashboard y widgets")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ProjectDashboardService projectDashboardService;
    private final GamificationService gamificationService;
    private final UserService userService;
    private final TimeLogRepository timeLogRepository;
    private final TeamMemberDashboardService teamMemberDashboardService;

    /**
     * GET /dashboard/sync
     * Builds and returns the entire initial state of the user's workspace.
     */
    @Operation(summary = "Sincronización inicial del workspace", description = "Construye y devuelve el estado inicial completo del workspace del usuario (proyectos, tareas, equipos, configuraciones, etc.).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Workspace sincronizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = WorkspaceSyncDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/sync")
    public ResponseEntity<WorkspaceSyncDTO> getInitialSync() {
        WorkspaceSyncDTO syncData = dashboardService.buildInitialWorkspaceSync();

        return ResponseEntity.ok(syncData);
    }

    /**
     * GET /dashboard/project/{projectId}
     * Builds and returns the entire dashboard state for a specific project.
     */
    @Operation(summary = "Dashboard del proyecto", description = "Construye y devuelve el estado completo del dashboard para un proyecto específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard del proyecto", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectDashboardDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido"),
            @ApiResponse(responseCode = "404", description = "Proyecto no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProjectDashboardDTO> getProjectDashboard(@Parameter(description = "ID del proyecto", example = "5", in = ParameterIn.PATH) @PathVariable Integer projectId) {
        ProjectDashboardDTO dashboardData = projectDashboardService.getProjectDashboard(projectId);
        return ResponseEntity.ok(dashboardData);
    }

    /**
     * GET /dashboard/temple-status
     * Builds and returns the current temple status and related gamification events for the authenticated user.
     */
    @Operation(summary = "Estado Temple", description = "Construye y devuelve el estado actual del modo 'Temple' y los eventos de gamificación relacionados para el usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado Temple generado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TempleUpdateResponse.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/temple-status")
    public ResponseEntity<TempleUpdateResponse> getTempleStatus() {
        User currentUser = userService.getAuthenticatedUser();

        List<GamificationEventDTO> events = new ArrayList<>();

        int globalTempleMinutes = timeLogRepository.sumMinutesInTempleModeByUserId(currentUser.getId());

        WorkspaceSyncDTO.TempleSyncDTO templeMode = gamificationService.buildTempleMode(currentUser, globalTempleMinutes, events);

        TempleUpdateResponse response = TempleUpdateResponse.builder()
                .templeMode(templeMode)
                .gamificationEvents(events)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * GET /dashboard/team/{teamId}/member
     * Builds and returns the entire dashboard state for a standard team member.
     */
    @Operation(summary = "Dashboard miembro de equipo", description = "Construye y devuelve el estado completo del dashboard para un miembro estándar de un equipo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard del miembro de equipo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamMemberDashboardDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/team/{teamId}/member")
    public ResponseEntity<TeamMemberDashboardDTO> getTeamMemberDashboard(@Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId) {
        TeamMemberDashboardDTO dashboardData = teamMemberDashboardService.getTeamMemberDashboard(teamId);
        return ResponseEntity.ok(dashboardData);
    }

    /*
     * GET /dashboard/widgets/solar-chart
     * It is called when the user changes the time filter in the drop-down menu.
     */
    /*
    @GetMapping("/widgets/solar-chart")
    public ResponseEntity<SolarChartWidgetData> getSolarChartData(
            @RequestParam(defaultValue = "GLOBAL") SolarChartWidgetData.TimeRangeFilter timeRange) {

        Integer myId = userService.getAuthenticatedUserID();
        SolarChartWidgetData data = dashboardService.getSolarChartData(myId, timeRange);

        return ResponseEntity.ok(data);
    }
    */

    /*
     * GET /dashboard/widgets/effectiveness-chart
     * It is called when the user changes the metric (Concentration/Profitability)
     * or the range (Week/Month).
     */
    /*
    @GetMapping("/widgets/effectiveness-chart")
    public ResponseEntity<EffectivenessChartWidgetData> getEffectivenessChartData(
            @RequestParam(defaultValue = "WEEKLY") EffectivenessChartWidgetData.TimeRange timeRange,
            @RequestParam(defaultValue = "CONCENTRATION") EffectivenessChartWidgetData.MetricType metric) {

        Integer myId = userService.getAuthenticatedUserID();
        EffectivenessChartWidgetData data = dashboardService.getEffectivenessChartData(myId, timeRange, metric);

        return ResponseEntity.ok(data);
    }
     */
}