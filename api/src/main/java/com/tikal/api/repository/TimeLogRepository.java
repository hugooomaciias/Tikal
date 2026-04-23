package com.tikal.api.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.tikal.api.model.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.TimeLog;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Integer> {
    /* --- Obtain time logs from a specific user --- */
    List<TimeLog> findByUser_Id(Integer userId);
    
    /* --- Obtain time logs from a specific project --- */
    List<TimeLog> findByProject_Id(Integer projectId);
    
    /* --- Obtain time logs from a specific stage --- */
    List<TimeLog> findByStage_Id(Integer stageId);
    
    /* --- Obtain time logs from a specific task --- */
    List<TimeLog> findByTask_Id(Integer taskId);

    /* --- Obtain the total minutes spent in temple mode by a specific user --- */
    @Query("SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, tl.initDateTime, tl.endDateTime)), 0) " +
            "FROM TimeLog tl " +
            "WHERE tl.user.id = :userId " +
            "AND tl.isTempleMode = true " +
            "AND tl.endDateTime IS NOT NULL")
    Integer sumMinutesInTempleModeByUserId(@Param("userId") Integer userId);

    /* --- Retrieve the latest time log for the user associated with a task --- */
    TimeLog findFirstByUser_IdAndTaskIsNotNullOrderByInitDateTimeDesc(Integer userId);

    /* --- Obtain total minutes worked between two dates --- */
    @Query(value = "SELECT SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)) " +
            "FROM time_logs " +
            "WHERE user_id = :userId " +
            "AND end_date_time IS NOT NULL " +
            "AND init_date_time >= :startDate AND init_date_time <= :endDate",
            nativeQuery = true)
    Integer getTotalMinutesBetweenDates(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /* --- Get the total minutes in Temple Mode within a date range --- */
    @Query(value = "SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)), 0) " +
            "FROM time_logs " +
            "WHERE user_id = :userId " +
            "AND is_temple_mode = 1 " +
            "AND end_date_time IS NOT NULL " +
            "AND init_date_time >= :startDate AND init_date_time <= :endDate",
            nativeQuery = true)
    Integer getTempleMinutesBetweenDates(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // ==========================================
    // SOLAR CHART (The 3 layers of drill-down)
    // ==========================================

    /* --- Solar Chart Capa 1: Total time grouped by Project --- */
    @Query(value =
            "SELECT p.id as projectId, p.name as projectName, p.logo_url as logoOrColour, " +
                    "SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time)) as totalMinutes " +
                    "FROM time_logs tl " +
                    "JOIN projects p ON tl.project_id = p.id " +
                    "WHERE tl.user_id = :userId " +
                    "AND tl.end_date_time IS NOT NULL " +
                    "AND tl.init_date_time >= :startDate AND tl.init_date_time <= :endDate " +
                    "GROUP BY p.id, p.name, p.logo_url " +
                    "ORDER BY totalMinutes DESC",
            nativeQuery = true)
    List<Object[]> getSolarChartProjectData(@Param("userId") Integer userId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    /* --- Solar Chart Capa 2: Total time grouped by Stage (Phase) --- */
    @Query(value =
            "SELECT s.id as stageId, s.name as stageName, s.colour as logoOrColour, " +
                    "SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time)) as totalMinutes " +
                    "FROM time_logs tl " +
                    "JOIN stages s ON tl.stage_id = s.id " +
                    "WHERE tl.project_id = :projectId " +
                    "AND tl.end_date_time IS NOT NULL " +
                    "AND tl.init_date_time >= :startDate AND tl.init_date_time <= :endDate " +
                    "GROUP BY s.id, s.name, s.colour " +
                    "ORDER BY totalMinutes DESC",
            nativeQuery = true)
    List<Object[]> getSolarChartStageData(@Param("projectId") Integer projectId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    /* --- Solar Chart Capa 3: Total time grouped by Task --- */
    @Query(value =
            "SELECT t.id as taskId, t.name as taskName, NULL as color, " +
                    "SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time)) as totalMinutes " +
                    "FROM time_logs tl " +
                    "JOIN tasks t ON tl.task_id = t.id " +
                    "WHERE tl.stage_id = :stageId " +
                    "AND tl.end_date_time IS NOT NULL " +
                    "AND tl.init_date_time >= :startDate AND tl.init_date_time <= :endDate " +
                    "GROUP BY t.id, t.name " +
                    "ORDER BY totalMinutes DESC",
            nativeQuery = true)
    List<Object[]> getSolarChartTaskData(@Param("stageId") Integer stageId,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    // ==========================================
    // CONCENTRATION HEATMAP
    // ==========================================

    /* --- Heatmap: Total minutes grouped by Day of Month --- */
    @Query(value =
            "SELECT DAY(init_date_time) as dayOfMonth, " +
                    "SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)) as totalMinutes " +
                    "FROM time_logs " +
                    "WHERE user_id = :userId " +
                    "AND init_date_time >= :startDate AND init_date_time < :endDate " +
                    "AND end_date_time IS NOT NULL " +
                    "GROUP BY DAY(init_date_time)",
            nativeQuery = true)
    List<Object[]> getHeatmapDataForMonth(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // ==========================================
    // EFFECTIVENESS CHART
    // ==========================================

    /* --- EffectivenessChart: concentration percentage grouped by day --- */
    @Query(value =
            "SELECT DATE(init_date_time) as logDate, " +
                    "(SUM(CASE WHEN is_temple_mode = 1 THEN TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time) ELSE 0 END) * 100.0) / " +
                    "SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)) as concentrationPercentage " +
                    "FROM time_logs " +
                    "WHERE user_id = :userId " +
                    "AND init_date_time >= :startDate AND init_date_time < :endDate " +
                    "AND end_date_time IS NOT NULL " +
                    "GROUP BY DATE(init_date_time) " +
                    "ORDER BY DATE(init_date_time) ASC",
            nativeQuery = true)
    List<Object[]> getDailyConcentrationPercentage(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /* --- EffectivenessChart: profit grouped by day --- */
    @Query(value =
            // Extraemos los tres campos de la vista para que el servicio tenga toda la info
            "SELECT log_date, daily_profit_per_minute, daily_profit, daily_minutes " +
                    "FROM daily_profitability_view " +
                    "WHERE user_id = :userId " +
                    "AND log_date >= DATE(:startDate) AND log_date < DATE(:endDate) " +
                    "ORDER BY log_date ASC",
            nativeQuery = true)
    List<Object[]> getDailyProfitability(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /* --- Weekly Progress: Total minutes grouped by exact Date --- */
    @Query(value =
            "SELECT DATE(init_date_time) as logDate, " +
                    "SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)) as totalMinutes " +
                    "FROM time_logs " +
                    "WHERE user_id = :userId " +
                    "AND init_date_time >= :startDate AND init_date_time <= :endDate " +
                    "AND end_date_time IS NOT NULL " +
                    "GROUP BY DATE(init_date_time)",
            nativeQuery = true)
    List<Object[]> getDailyTotalMinutesBetweenDates(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /* --- Obtain the total minutes spent in temple mode by a specific user strictly today --- */
    @Query(value =
            "SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)), 0) " +
                    "FROM time_logs " +
                    "WHERE user_id = :userId " +
                    "AND is_temple_mode = 1 " +
                    "AND init_date_time >= :startOfDay AND init_date_time <= :endOfDay " +
                    "AND end_date_time IS NOT NULL",
            nativeQuery = true)
    Integer sumTempleMinutesToday(
            @Param("userId") Integer userId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    // ==========================================
    // HEADERS METHODS
    // ==========================================

    /* --- Add up all the minutes in temple mode (total history) --- */
    @Query(value = "SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)), 0) " +
            "FROM time_logs " +
            "WHERE user_id = :userId AND is_temple_mode = 1 AND end_date_time IS NOT NULL",
            nativeQuery = true)
    Integer getHistoricalTempleMinutes(@Param("userId") Integer userId);

    /* --- Add up total minutes played --- */
    @Query(value = "SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, init_date_time, end_date_time)), 0) " +
            "FROM time_logs " +
            "WHERE user_id = :userId AND end_date_time IS NOT NULL",
            nativeQuery = true)
    Integer getHistoricalTotalMinutes(@Param("userId") Integer userId);

    List<TimeLog> findByUserIdAndInitDateTimeBetween(Integer currentUser, LocalDateTime startOfDay, LocalDateTime endOfDay);
}
