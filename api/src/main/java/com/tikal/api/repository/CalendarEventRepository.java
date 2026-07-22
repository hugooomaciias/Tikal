package com.tikal.api.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

import com.tikal.api.model.entity.enumerated.EventType;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.CalendarEvent;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Integer> {
    /* --- Obtain the user calendar events ordered depends on the initial event datetime --- */
    List<CalendarEvent> findByUserIdOrderByInitDateTimeAsc(Integer userId);

    /* --- Obtain orderly the user calendar events which are between two dateTimes --- */
    List<CalendarEvent> findByUserIdAndInitDateTimeBetweenOrderByInitDateTimeAsc(Integer userId, Instant start, Instant end);

    /* --- Obtain the user calendar events ordered depends on the initial event datetime --- */
    @Query("SELECT c FROM CalendarEvent c WHERE c.user.id = :userId " +
           "AND (c.project IS NOT NULL OR c.stage IS NOT NULL OR c.task IS NOT NULL) " +
           "ORDER BY c.initDateTime ASC")
    List<CalendarEvent> findLinkedEventsByUserId(@Param("userId") Integer userId);

    /* --- Obtain the user calendar events and name ordered depends on the initial event datetime --- */
    List<CalendarEvent> findByUserIdAndNameContainingIgnoreCaseOrderByInitDateTimeAsc(Integer userId, String name);

    /* --- Obtain calendar events within a specific time window --- */
    @Query("SELECT c FROM CalendarEvent c " +
            "WHERE c.user.id = :userId " +
            "AND c.initDateTime >= :startDate " +
            "AND c.initDateTime <= :endDate " +
            "ORDER BY c.initDateTime ASC")
    List<CalendarEvent> findEventsInWindow(
            @Param("userId") Integer userId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    /* --- To check whether a project already has a DEADLINE event --- */
    Optional<CalendarEvent> findByProjectIdAndEventTypeAndStageIsNullAndTaskIsNull(Integer id, EventType eventType);

    /* --- Obtain all events which are linked to one of the projects from the list --- */
    List<CalendarEvent> findByProjectIdInAndEventTypeAndStageIsNullAndTaskIsNull(List<Integer> projectIds, EventType eventType);

    /* --- To check whether a stage already has a DEADLINE event --- */
    Optional<CalendarEvent> findByStageIdAndEventTypeAndTaskIsNull(Integer id, EventType eventType);

    /* --- Obtain all events which are linked to one of the stage from the list --- */
    List<CalendarEvent> findByStageIdInAndEventTypeAndTaskIsNull(List<Integer> stagesIds, EventType eventType);

    /* --- To check whether a task already has a DEADLINE event --- */
    Optional<CalendarEvent> findByTaskIdAndEventType(Integer id, EventType eventType);

    /* --- Obtain all events which are linked to one of the tasks from the list --- */
    List<CalendarEvent> findByTaskIdInAndEventType(List<Integer> mainTaskIds, EventType eventType);

    /* --- Obtain all events of a user and filtered between two dates --- */
    List<CalendarEvent> findByUserIdAndInitDateTimeGreaterThanEqualAndEndDateTimeLessThanEqual(Integer id,
                                                                                               Instant start,
                                                                                               Instant end);
    /* --- Fetch of all deadlines for stages and tasks in one query --- */
    @Query("SELECT ce FROM CalendarEvent ce " +
            "WHERE (ce.project.id IN :projectIds OR ce.stage.id IN :stageIds OR ce.task.id IN :taskIds) " +
            "AND ce.eventType = :eventType")
    List<CalendarEvent> findDeadlinesByProyectIdsOrStageIdsOrTaskIds(@Param("projectIds") Collection<Integer> projectIds,
                                                         @Param("stageIds") Collection<Integer> stageIds,
                                                         @Param("taskIds") Collection<Integer> taskIds,
                                                         @Param("eventType") EventType eventType);
}
