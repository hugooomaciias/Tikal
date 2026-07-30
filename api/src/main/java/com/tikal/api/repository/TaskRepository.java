package com.tikal.api.repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer>{
    /* --- Obtain tasks from a specific phase --- */
    List<Task> findByStage_Id(Integer stageId);
    
    /* --- Obtain subtasks from a parent task --- */
    List<Task> findByParentTask_Id(Integer parentTaskId);
    
    /* --- Obtain tasks from an assigned user --- */
    List<Task> findByAssignedUser_Id(Integer userId);

    /* --- Obtain main tasks (without a parent) from an assigned user --- */
    @Query("SELECT t FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.parentTask IS NULL")
    List<Task> findByAssignedUser_IdWithoutParent(Integer userId);

    /* --- Obtain main tasks (without a parent) from a stage  --- */
    List<Task> findByStage_IdAndParentTaskIsNull(Integer stageId);

    /* --- Obtain tasks which stageId is on the given list --- */
    List<Task> findByStage_IdIn(List<Integer> stagesIds);

    /* --- Fallback: Get any task from the user (for onboarding) --- */
    Task findFirstByAssignedUser_Id(Integer userId);

    /* --- Count the number of main tasks completed within a date range --- */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.isCompleted = true " +
            "AND t.parentTask IS NULL " +
            "AND t.completionDate >= :startDate AND t.completionDate <= :endDate")
    Integer countCompletedTasksBetweenDates(
            @Param("userId") Integer userId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    /* --- Show main tasks (without a parent) that are pending or have been recently completed --- */
    @Query("SELECT t FROM Task t " +
            "WHERE t.stage.project.userOwner.id= :userId " +
            "AND t.parentTask IS NULL " +
            "AND t.deadline IS NOT NULL " +
            "AND (t.isCompleted = false OR (t.isCompleted = true AND t.completionDate >= :since))")
    List<Task> findMainTasksPendingOrCompletedSince(
            @Param("userId") Integer userId,
            @Param("since") Instant since);

    /* --- Count pending subtasks grouped by their parent task --- */
    @Query("SELECT t.parentTask.id, COUNT(t.id) FROM Task t " +
            "WHERE t.parentTask.id IN :parentTaskIds AND t.isCompleted = false " +
            "GROUP BY t.parentTask.id")
    List<Object[]> countPendingSubtasksByParentIds(@Param("parentTaskIds") List<Integer> parentTaskIds);

    /* --- Obtain completed parent tasks with a valid time estimate for a specific user since a given date --- */
    @Query("SELECT t FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.isCompleted = true " +
            "AND t.estimatedTime IS NOT NULL " +
            "AND t.estimatedTime > 0 " +
            "AND t.completionDate >= :since " +
            "AND t.parentTask IS NULL")
    List<Task> findCompletedTasksWithEstimateByUserAndDate(
            @Param("userId") Integer userId,
            @Param("since") Instant since);

    /* --- Obtain the total number of completed parent tasks with a valid time estimate for a specific user since a given date --- */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.isCompleted = true " +
            "AND t.estimatedTime IS NOT NULL " +
            "AND t.estimatedTime > 0 " +
            "AND t.completionDate >= :since " +
            "AND t.parentTask IS NULL")
    Integer countTasksWithEstimateByUserAndDate(
            @Param("userId") Integer userId,
            @Param("since") Instant since);

    /* --- Obtain the total number of completed parent tasks for a specific user since a given date --- */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.isCompleted = true " +
            "AND t.completionDate >= :since " +
            "AND t.parentTask IS NULL")
    Integer countCompletedTasksByUserAndDate(
            @Param("userId") Integer userId,
            @Param("since") Instant since);

    /* --- Obtain the daily average effectiveness percentage based on actual versus estimated time for a specific user --- */
    @Query("SELECT DATE(t.completionDate), AVG(" +
            "CASE " +
            "   WHEN (t.totalLoggedMinutes IS NOT NULL AND t.estimatedTime IS NOT NULL AND t.estimatedTime > 0) " +
            "   THEN " +
            "       CASE " +
            "           WHEN t.totalLoggedMinutes <= t.estimatedTime THEN 100.0 " +
            "           ELSE GREATEST(0.0, 100.0 - ((t.totalLoggedMinutes - t.estimatedTime) * 100.0 / t.estimatedTime)) " +
            "       END " +
            "   ELSE NULL " +
            "END) " +
            "FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.isCompleted = true " +
            "AND t.parentTask IS NULL " +
            "AND t.completionDate IS NOT NULL " +
            "GROUP BY DATE(t.completionDate) " +
            "ORDER BY DATE(t.completionDate) DESC")
    List<Object[]> findDailyAverageEffectiveness(@Param("userId") Integer userId);

    /* --- Count the user's pending tasks --- */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.stage.project.userOwner.id = :userId " +
            "AND t.isCompleted = false " +
            "AND t.parentTask IS NULL " +
            "AND t.deadline IS NOT NULL")
    Integer countPendingTasks(@Param("userId")  Integer userId);
    
    /* --- Count the user's pending tasks --- */
    @Query("""
        SELECT COUNT(t)
        FROM Task t
        WHERE t.stage.project.userOwner.id = :userId
        AND t.isCompleted = false
        AND t.parentTask IS NULL
        AND t.deadline >= :startOfDay
        AND t.deadline < :endOfDay
        """)
    Integer countTodayPendingTasks(
        @Param("userId") Integer userId,
        @Param("startOfDay") Instant startOfDay,
        @Param("endOfDay") Instant endOfDay
    );

    /* --- Count the total number of tasks completed by the user --- */
    Integer countByAssignedUser_IdAndIsCompletedTrue(Integer userId);
}
