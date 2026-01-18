package com.tikal.api.model.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardSummaryDTO {

    /* --- User information --- */
    private String userName;
    private String avatarUrl;
    private String rankTitle;
    private String templeName;
    private String badgeImageUrl;

    /* --- Proyects counters --- */
    private Integer projectsCompleted;
    private Integer projectsInProgress;
    private Integer pendingprojects;

    /* --- Key Statistics --- */
    private String timeSpentMonth;
    private BigDecimal globalEfficiency;
    private BigDecimal scoringPlanning;
    
    /* --- Temple mode state --- */
    private Integer currentLevel;
    private Integer hoursTotalConcentration; 
    private Integer hoursForNextLevel;
}