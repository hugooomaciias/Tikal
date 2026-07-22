package com.tikal.api.service;

import com.tikal.api.exception.ForbiddenAccessException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.model.dto.calendar.*;
import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.EventType;
import com.tikal.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final StageRepository stageRepository;
    private final TaskRepository taskRepository;

    public List<CalendarEventDTO> getEventsBetweenDates(Instant start, Instant end) {
        User user = userService.getAuthenticatedUser();

        List<CalendarEvent> events = calendarEventRepository
                .findByUserIdAndInitDateTimeGreaterThanEqualAndEndDateTimeLessThanEqual(user.getId(), start, end);

        return events.stream().map(this::toDto).toList();
    }

    @Transactional
    public CalendarEventDTO createEvent(CalendarEventRequest request) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = new CalendarEvent();
        event.setUser(user);

        mapRequestToEntity(request, event);
        mapLinkedEntities(request, event);

        CalendarEvent savedEvent = calendarEventRepository.save(event);
        return toDto(savedEvent);
    }

    @Transactional
    public CalendarEventDTO updateEvent(Integer id, CalendarEventRequest request) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new ForbiddenAccessException("No tienes permiso para editar este evento");
        }

        mapRequestToEntity(request, event);
        mapLinkedEntities(request, event);

        return toDto(calendarEventRepository.save(event));
    }

    @Transactional
    public CalendarEventDTO changeEventTime(Integer id, ChangeTimeRequest request) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new ForbiddenAccessException("No tienes permiso");
        }

        event.setInitDateTime(request.getInitDateTime());
        event.setEndDateTime(request.getEndDateTime());

        return toDto(calendarEventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Integer id) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));;

        if (!event.getUser().getId().equals(user.getId())) {
            throw new ForbiddenAccessException("No tienes permiso");
        }

        calendarEventRepository.delete(event);
    }

    // ==========================================
    //          AUXILIARY METHODS
    // ==========================================

    private void mapLinkedEntities(CalendarEventRequest request, CalendarEvent event) {
        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("No existe la tarea con el id indicado"));
            event.setTask(task);
            event.setStage(task.getStage());
            event.setProject(task.getStage().getProject());

        } else if (request.getStageId() != null) {
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new ResourceNotFoundException("No existe la fase con el id indicado"));
            event.setTask(null);
            event.setStage(stage);
            event.setProject(stage.getProject());

            if (event.getCustomColour() == null) {
                event.setCustomColour(stage.getColour());
            }

        } else if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("No existe el proyecto con el id indicado"));
            event.setTask(null);
            event.setStage(null);
            event.setProject(project);

        } else {
            event.setTask(null);
            event.setStage(null);
            event.setProject(null);
        }
    }

    private void mapRequestToEntity(CalendarEventRequest request, CalendarEvent event) {
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setInitDateTime(request.getInitDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setCustomColour(request.getColour());

        boolean isCompleteDay = request.getIsCompleteDay() != null ? request.getIsCompleteDay() : false;
        event.setIsCompleteDay(isCompleteDay);

        if (isCompleteDay) {
            // Start = 00:00:00 UTC on the date of initDateTime
            LocalDate startDate = request.getInitDateTime()
                    .atZone(ZoneOffset.UTC)
                    .toLocalDate();
            event.setInitDateTime(startDate.atStartOfDay(ZoneOffset.UTC).toInstant());

            // Which instant should be used to derive the end day?
            Instant endReference = (request.getEndDateTime() != null)
                    ? request.getEndDateTime()
                    : request.getInitDateTime();

            // End = 23:59:59 UTC on the date of that reference instant
            LocalDate endDate = endReference
                    .atZone(ZoneOffset.UTC)
                    .toLocalDate();
            event.setEndDateTime(endDate.atTime(23, 59, 59)
                    .atZone(ZoneOffset.UTC)
                    .toInstant());
        } else {
            event.setInitDateTime(request.getInitDateTime());
            event.setEndDateTime(request.getEndDateTime());
        }

        EventType type = request.getEventType() != null ? request.getEventType() : EventType.GENERAL;
        event.setEventType(type);

        switch (type) {
            case WORK_SESSION ->
                    event.setIsActivateTracker(request.getIsActivateTracker() != null ? request.getIsActivateTracker() : false);
            case GENERAL, DEADLINE ->
                    event.setIsActivateTracker(false);
        }
    }

    private CalendarEventDTO toDto(CalendarEvent event) {

        String idLinkedEntity = null;
        if (event.getProject() != null && event.getProject().getId() != null) {
            idLinkedEntity = "p_" + event.getProject().getId();
        }
        if (event.getStage() != null && event.getStage().getId() != null) {
            idLinkedEntity = "f_" + event.getStage().getId();
        }
        if (event.getTask() != null && event.getTask().getId() != null) {
            idLinkedEntity = "t_" + event.getTask().getId();
        }

        return CalendarEventDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .initDateTime(event.getInitDateTime())
                .endDateTime(event.getEndDateTime())
                .isActivateTracker(event.getIsActivateTracker())
                .colour(event.getCustomColour())
                .eventType(event.getEventType())
                .isCompleteDay(event.getIsCompleteDay())
                .logo(event.getProject() != null ? event.getProject().getLogoUrl() : null)
                .linkedEntity(idLinkedEntity)
                .build();
    }
}
