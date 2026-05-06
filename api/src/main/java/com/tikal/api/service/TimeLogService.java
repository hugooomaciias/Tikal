package com.tikal.api.service;

import com.tikal.api.model.dto.TimeLogDTO;
import com.tikal.api.model.dto.TimeLogRequest;
import com.tikal.api.model.entity.*;
import com.tikal.api.repository.*;
import com.tikal.api.utils.DateUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeLogService {
    private final TimeLogRepository timeLogRepository;
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final StageRepository stageRepository;
    private final TaskRepository taskRepository;

    public List<TimeLogDTO> listByDay(LocalDate day) {
        if (day == null) {
            throw new RuntimeException("El dia no puede ser nulo");
        }
        User currentUser = userService.getAuthenticatedUser();

        LocalDateTime startOfDay = day.atStartOfDay();
        LocalDateTime endOfDay = day.atTime(23, 59, 59);

        List<TimeLog> timeLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(
                currentUser.getId(),
                startOfDay,
                endOfDay
        );

        return timeLogs.stream().map(this::toDto).toList();
    }

    @Transactional
    public TimeLogDTO create(TimeLogRequest request) {
        TimeLog timeLog = new TimeLog();

        // Set basic fields
        timeLog.setInitDateTime(request.getInitDateTime());
        timeLog.setEndDateTime(request.getEndDateTime());
        timeLog.setTargetTime(request.getTargetTime());
        timeLog.setIsTempleMode(request.getIsTempleMode() != null ? request.getIsTempleMode() : false);
        timeLog.setActivityDescription(request.getActivityDescription());

        // Set user
        User user = userService.getAuthenticatedUser();
        timeLog.setUser(user);

        // All the linked entities can't be null
        if (request.getTaskId() == null && request.getStageId() == null && request.getProjectId() == null) {
            throw new RuntimeException("Un time log debe tener siempre un proyecto, fase o tarea adjunto.");
        }

        if (request.getTaskId() != null) {
            // Comes with tasks
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + request.getTaskId()));

            Stage taskStage = task.getStage();
            Project taskProject = taskStage.getProject();

            // Validamos que el frontend no nos intente engañar con IDs cruzados
            if (request.getStageId() != null && !request.getStageId().equals(taskStage.getId())) {
                throw new RuntimeException("La tarea no pertenece a la fase enviada.");
            }
            if (request.getProjectId() != null && !request.getProjectId().equals(taskProject.getId())) {
                throw new RuntimeException("La tarea no pertenece al proyecto enviado.");
            }

            // We save the three levels
            timeLog.setTask(task);
            timeLog.setStage(taskStage);
            timeLog.setProject(taskProject);

        } else if (request.getStageId() != null) {
            // Comes with stage but without task
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new RuntimeException("Fase no encontrada con id: " + request.getStageId()));

            Project stageProject = stage.getProject();

            if (request.getProjectId() != null && !request.getProjectId().equals(stageProject.getId())) {
                throw new RuntimeException("La fase no pertenece al proyecto enviado.");
            }

            // We save both levels
            timeLog.setStage(stage);
            timeLog.setProject(stageProject);

        } else if (request.getProjectId() != null) {
            // Only the project comes
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + request.getProjectId()));

            // We save this only level
            timeLog.setProject(project);
        }

        // Save and map it
        TimeLog savedTimeLog = timeLogRepository.save(timeLog);
        return toDto(savedTimeLog);
    }

    public TimeLogDTO update(TimeLogRequest request, Integer id) {
        // Validate required id
        if (id == null) {
            throw new RuntimeException("TimeLog id is required for update");
        }

        TimeLog existingTimeLog = timeLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TimeLog not found with id: " + id));

        User user = userService.getAuthenticatedUser();
        if (existingTimeLog.getUser().getId() != user.getId()) {
            throw new RuntimeException("Este usuario no tiene permiso para editar la tarea con id: " + id);
        }

        // Update basic fields (only if provided in request)
        if (request.getInitDateTime() != null) {
            existingTimeLog.setInitDateTime(request.getInitDateTime());
        }
        if (request.getEndDateTime() != null) {
            existingTimeLog.setEndDateTime(request.getEndDateTime());
        }
        if (request.getTargetTime() != null) {
            existingTimeLog.setTargetTime(request.getTargetTime());
        }
        if (request.getIsTempleMode() != null) {
            existingTimeLog.setIsTempleMode(request.getIsTempleMode());
        }
        if (request.getActivityDescription() != null) {
            existingTimeLog.setActivityDescription(request.getActivityDescription());
        }

        // Update relationships if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));
            existingTimeLog.setProject(project);
        } else {
            throw new RuntimeException("Un time log siempre debe de pertenecer a un proyecto/lista");
        }

        if (request.getStageId() != null) {
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new RuntimeException("Stage not found with id: " + request.getStageId()));
            existingTimeLog.setStage(stage);
        } else {
            existingTimeLog.setStage(null);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found with id: " + request.getTaskId()));
            existingTimeLog.setTask(task);
        } else {
            existingTimeLog.setTask(null);
        }

        TimeLog updatedTimeLog = timeLogRepository.save(existingTimeLog);
        return toDto(updatedTimeLog);
    }

    public void delete(Integer id) {
        User user = userService.getAuthenticatedUser();
        TimeLog timeLog = timeLogRepository.findById(id).orElseThrow(() -> new RuntimeException("TimeLog not found with id: " + id));
        if (timeLog.getUser().getId() != user.getId()) {
            throw new RuntimeException("Este usuario no tiene permiso para eliminar la tarea con id: " + id);
        }

        timeLogRepository.deleteById(id);
    }

    // ==========================================
    // MAPPER
    // ==========================================
    private TimeLogDTO toDto(TimeLog timeLog) {
        String color = timeLog.getStage().getColour() != null ? timeLog.getStage().getColour() : null;

        String taskName = timeLog.getProject().getName();
        if (timeLog.getTask() != null) {
            taskName = timeLog.getTask().getName();
        } else if (timeLog.getStage() != null) {
            taskName = timeLog.getStage().getName();
        }

        return TimeLogDTO.builder()
                .id(timeLog.getId())
                .initTime(DateUtils.formatLocalDateTime(timeLog.getInitDateTime()))
                .endTime(DateUtils.formatLocalDateTime(timeLog.getEndDateTime()))
                .minutes(timeLog.getMinutes())
                .logo(timeLog.getProject().getLogoUrl())
                .color(color)
                .taskName(taskName)
                .build();
    }
}
