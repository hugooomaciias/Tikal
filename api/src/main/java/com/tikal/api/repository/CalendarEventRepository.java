package com.tikal.api.repository;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Calendar_Event;

@Repository
public interface CalendarEventRepository extends JpaRepository<Calendar_Event, Integer> {
    /* --- Obtain the user calendar events orded depends of the initial event datetime --- */
    List<Calendar_Event> findByUserIdOrderByInitDateTimeAsc(Integer userId);

    /* --- Obtain orderly the user calendar events which are between two dateTimes --- */
    List<Calendar_Event> findByUserIdAndInitDateTimeBetweenOrderByStartTimeAsc(Integer userId, LocalDateTime start, LocalDateTime end);

    /* --- Obtain the user calendar events orded depends of the initial event datetime --- */
    @Query("SELECT c FROM Calendar_Event c WHERE c.user.id = :userId " +
           "AND (c.project IS NOT NULL OR c.stage IS NOT NULL OR c.task IS NOT NULL) " +
           "ORDER BY c.initDateTime ASC")
    List<Calendar_Event> findLinkedEventsByUserId(@Param("userId") Integer userId);

    /* --- Obtain the user calendar events and name ordeded depends of the initial event datetime --- */
    List<Calendar_Event> findByUserIdAndNameContainingIgnoreCaseOrderByInitDateTimeAsc(Integer userId, String name);
}
