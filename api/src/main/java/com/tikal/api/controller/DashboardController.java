package com.tikal.api.controller;

import com.tikal.api.model.dto.sync.ProjectDashboardDTO;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.domain.GamificationEventDTO;
import com.tikal.api.model.dto.temple.TempleUpdateResponse;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.TimeLogRepository;
import com.tikal.api.service.DashboardService;
import com.tikal.api.service.GamificationService;
import com.tikal.api.service.ProjectDashboardService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ProjectDashboardService projectDashboardService;
    private final GamificationService gamificationService;
    private final UserService userService;
    private final TimeLogRepository timeLogRepository;

    /**
     * GET /dashboard/sync
     * Builds and returns the entire initial state of the user's workspace.
     */
    @GetMapping("/sync")
    public ResponseEntity<WorkspaceSyncDTO> getInitialSync() {
        WorkspaceSyncDTO syncData = dashboardService.buildInitialWorkspaceSync();

        return ResponseEntity.ok(syncData);
    }

    /**
     * GET /dashboard/project/{projectId}
     * Builds and returns the entire dashboard state for a specific project.
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProjectDashboardDTO> getProjectDashboard(@PathVariable Integer projectId) {
        ProjectDashboardDTO dashboardData = projectDashboardService.getProjectDashboard(projectId);
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/temple-status")
    public ResponseEntity<TempleUpdateResponse> getTempleStatus() {
        User currentUser = userService.getAuthenticatedUser(); // O como lo extraigas

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
     * GET /dashboard/widgets/solar-chart
     * It is called when the user changes the time filter in the drop-down menu.
     */
    /**
    @GetMapping("/widgets/solar-chart")
    public ResponseEntity<SolarChartWidgetData> getSolarChartData(
            @RequestParam(defaultValue = "GLOBAL") SolarChartWidgetData.TimeRangeFilter timeRange) {

        Integer myId = userService.getAuthenticatedUserID();
        SolarChartWidgetData data = dashboardService.getSolarChartData(myId, timeRange);

        return ResponseEntity.ok(data);
    }
    */

    /**
     * GET /dashboard/widgets/effectiveness-chart
     * It is called when the user changes the metric (Concentration/Profitability)
     * or the range (Week/Month).
     */
    /**
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