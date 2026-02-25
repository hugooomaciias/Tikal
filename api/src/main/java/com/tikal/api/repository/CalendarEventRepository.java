package com.tikal.api.repository;

import java.util.List;
import java.time.LocalDateTime;
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
    List<CalendarEvent> findByUserIdAndInitDateTimeBetweenOrderByInitDateTimeAsc(Integer userId, LocalDateTime start, LocalDateTime end);

    /* --- Obtain the user calendar events ordered depends on the initial event datetime --- */
    @Query("SELECT c FROM CalendarEvent c WHERE c.user.id = :userId " +
           "AND (c.project IS NOT NULL OR c.stage IS NOT NULL OR c.task IS NOT NULL) " +
           "ORDER BY c.initDateTime ASC")
    List<CalendarEvent> findLinkedEventsByUserId(@Param("userId") Integer userId);

    /* --- Obtain the user calendar events and name ordered depends on the initial event datetime --- */
    List<CalendarEvent> findByUserIdAndNameContainingIgnoreCaseOrderByInitDateTimeAsc(Integer userId, String name);
}
