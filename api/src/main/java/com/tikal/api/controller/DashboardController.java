package com.tikal.api.controller;

import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.widgets.EffectivenessChartWidgetData;
import com.tikal.api.model.dto.sync.widgets.SolarChartWidgetData;
import com.tikal.api.service.DashboardService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

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