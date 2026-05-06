package com.tikal.api.service;

import com.tikal.api.model.dto.calendar.*;
import com.tikal.api.model.entity.*;
import com.tikal.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final StageRepository stageRepository;
    private final TaskRepository taskRepository;

    public List<CalendarEventDTO> getEventsBetweenDates(LocalDateTime start, LocalDateTime end) {
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

        // Linked entities logic
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("No existe el proyecto con el id que se ha buscado"));
            event.setProject(project);
        }

        if (request.getStageId() != null) {
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new RuntimeException("No existe la fase con el id que se ha buscado"));
            event.setStage(stage);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("No existe la fase con el id que se ha buscado"));
            event.setTask(task);
        }

        CalendarEvent savedEvent = calendarEventRepository.save(event);
        return toDto(savedEvent);
    }

    @Transactional
    public CalendarEventDTO updateEvent(Integer id, CalendarEventRequest request) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para editar este evento");
        }

        mapRequestToEntity(request, event);

        // Linked entities logic
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("No existe el proyecto con el id que se ha buscado"));
            event.setProject(project);
        }

        if (request.getStageId() != null) {
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new RuntimeException("No existe la fase con el id que se ha buscado"));
            event.setStage(stage);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("No existe la fase con el id que se ha buscado"));
            event.setTask(task);
        }

        return toDto(calendarEventRepository.save(event));
    }

    @Transactional
    public CalendarEventDTO changeEventTime(Integer id, ChangeTimeRequest request) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso");
        }

        event.setInitDateTime(request.getInitDateTime());
        event.setEndDateTime(request.getEndDateTime());

        return toDto(calendarEventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Integer id) {
        User user = userService.getAuthenticatedUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso");
        }

        calendarEventRepository.delete(event);
    }

    // ==========================================
    //          AUXILIARY METHODS
    // ==========================================

    private void mapRequestToEntity(CalendarEventRequest request, CalendarEvent event) {
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setInitDateTime(request.getInitDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setIsActivateTracker(request.getIsActivateTracker() != null ? request.getIsActivateTracker() : false);
        event.setCustomColour(request.getCustomColour());
        event.setEventType(request.getEventType());
    }

    private CalendarEventDTO toDto(CalendarEvent event) {
        return CalendarEventDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .initDateTime(event.getInitDateTime())
                .endDateTime(event.getEndDateTime())
                .isActivateTracker(event.getIsActivateTracker())
                .colour(event.getStage() != null ? event.getStage().getColour() : null)
                .build();
    }
}
