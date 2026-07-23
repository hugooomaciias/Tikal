package com.tikal.api.service;

import com.tikal.api.exception.BadRequestException;
import com.tikal.api.exception.ForbiddenAccessException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.model.dto.timer.ActiveTimerDTO;
import com.tikal.api.model.dto.timer.TimeLogBatchRequest;
import com.tikal.api.model.dto.TimeLogDTO;
import com.tikal.api.model.dto.timer.TimeLogPause;
import com.tikal.api.model.dto.timer.TimeLogRequest;
import com.tikal.api.model.entity.*;
import com.tikal.api.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
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
            throw new BadRequestException("El dia no puede ser nulo");
        }
        User currentUser = userService.getAuthenticatedUser();

        Instant startOfDay = day.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = day.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

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
            throw new BadRequestException("Un time log debe tener siempre un proyecto, fase o tarea adjunto.");
        }

        if (request.getTaskId() != null) {
            // Comes with tasks
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + request.getTaskId()));

            Stage taskStage = task.getStage();
            Project taskProject = taskStage.getProject();

            // Validation of cross IDs
            if (request.getStageId() != null && !request.getStageId().equals(taskStage.getId())) {
                throw new BadRequestException("La tarea no pertenece a la fase enviada.");
            }
            if (request.getProjectId() != null && !request.getProjectId().equals(taskProject.getId())) {
                throw new BadRequestException("La tarea no pertenece al proyecto enviado.");
            }

            // We save the three levels
            timeLog.setTask(task);
            timeLog.setStage(taskStage);
            timeLog.setProject(taskProject);

        } else if (request.getStageId() != null) {
            // Comes with stage but without task
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fase no encontrada con id: " + request.getStageId()));

            Project stageProject = stage.getProject();

            if (request.getProjectId() != null && !request.getProjectId().equals(stageProject.getId())) {
                throw new BadRequestException("La fase no pertenece al proyecto enviado.");
            }

            // We save both levels
            timeLog.setStage(stage);
            timeLog.setProject(stageProject);

        } else if (request.getProjectId() != null) {
            // Only the project comes
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + request.getProjectId()));

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
            throw new BadRequestException("TimeLog id is required for update");
        }

        TimeLog existingTimeLog = timeLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeLog not found with id: " + id));

        User user = userService.getAuthenticatedUser();
        if (existingTimeLog.getUser().getId() != user.getId()) {
            throw new ForbiddenAccessException("Este usuario no tiene permiso para editar la tarea con id: " + id);
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
        if (request.getIsCompleted() != null) {
            existingTimeLog.setIsCompleted(request.getIsCompleted());
        }

        // Update relationships if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            existingTimeLog.setProject(project);
        } else {
            throw new BadRequestException("Un time log siempre debe de pertenecer a un proyecto/lista");
        }

        if (request.getStageId() != null) {
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stage not found with id: " + request.getStageId()));
            existingTimeLog.setStage(stage);
        } else {
            existingTimeLog.setStage(null);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));
            existingTimeLog.setTask(task);
        } else {
            existingTimeLog.setTask(null);
        }

        TimeLog updatedTimeLog = timeLogRepository.save(existingTimeLog);
        return toDto(updatedTimeLog);
    }

    public void delete(Integer id) {
        User user = userService.getAuthenticatedUser();
        TimeLog timeLog = timeLogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("TimeLog not found with id: " + id));
        if (timeLog.getUser().getId() != user.getId()) {
            throw new ForbiddenAccessException("Este usuario no tiene permiso para eliminar la tarea con id: " + id);
        }

        timeLogRepository.deleteById(id);
    }

    // ==========================================
    // DYNAMIC USE OF THE TIMER
    // ==========================================

    public ActiveTimerDTO getActiveTimeLog() {
        User user = userService.getAuthenticatedUser();
        List<TimeLog> uncompletedLogs = timeLogRepository.findByUserIdAndIsCompletedFalse(user.getId());

        if (uncompletedLogs.isEmpty()) {
            return null;
        }

        long accumulatedSeconds = 0;
        TimeLog runningLog = null;

        TimeLog referenceLog = uncompletedLogs.get(0);

        for (TimeLog log : uncompletedLogs) {
            if (log.getEndDateTime() != null) {
                accumulatedSeconds += java.time.Duration.between(log.getInitDateTime(), log.getEndDateTime()).getSeconds();
            } else {
                runningLog = log;
            }
        }

        return ActiveTimerDTO.builder()
                .id(runningLog != null ? runningLog.getId() : null)
                .colour(extractColor(referenceLog))
                .logo(extractLogo(referenceLog))
                .entityName(extractName(referenceLog))
                .initDateTime(runningLog != null ? runningLog.getInitDateTime() : null)
                .accumulatedSeconds(accumulatedSeconds)
                .build();
    }

    @Transactional
    public TimeLogDTO start(TimeLogRequest request) {
        User user = userService.getAuthenticatedUser();
        List<TimeLog> previousUncompletedLogs = timeLogRepository.findByUserIdAndIsCompletedFalse(user.getId());

        if (!previousUncompletedLogs.isEmpty()) {
            boolean isSameBatch = isSameTarget(previousUncompletedLogs.get(0), request);

            for (TimeLog oldLog : previousUncompletedLogs) {
                if (oldLog.getEndDateTime() == null) {
                    oldLog.setEndDateTime(Instant.now());
                }

                if (!isSameBatch) {
                    oldLog.setIsCompleted(true);
                    oldLog.setActivityDescription(null);
                }
            }
            timeLogRepository.saveAll(previousUncompletedLogs);
        }

        // Set basic fields
        TimeLog timeLog = new TimeLog();
        timeLog.setInitDateTime(request.getInitDateTime());
        timeLog.setEndDateTime(null);
        timeLog.setTargetTime(request.getTargetTime());
        timeLog.setIsTempleMode(request.getIsTempleMode() != null ? request.getIsTempleMode() : false);
        timeLog.setActivityDescription(request.getActivityDescription());
        timeLog.setUser(user);

        // All the linked entities can't be null
        if (request.getTaskId() == null && request.getStageId() == null && request.getProjectId() == null) {
            throw new BadRequestException("Un time log debe tener siempre un proyecto, fase o tarea adjunto.");
        }

        if (request.getTaskId() != null) {
            // Comes with tasks
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + request.getTaskId()));

            Stage taskStage = task.getStage();
            Project taskProject = taskStage.getProject();

            // Validation of cross IDs
            if (request.getStageId() != null && !request.getStageId().equals(taskStage.getId())) {
                throw new BadRequestException("La tarea no pertenece a la fase enviada.");
            }
            if (request.getProjectId() != null && !request.getProjectId().equals(taskProject.getId())) {
                throw new BadRequestException("La tarea no pertenece al proyecto enviado.");
            }

            // We save the three levels
            timeLog.setTask(task);
            timeLog.setStage(taskStage);
            timeLog.setProject(taskProject);

        } else if (request.getStageId() != null) {
            // Comes with stage but without task
            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fase no encontrada con id: " + request.getStageId()));

            Project stageProject = stage.getProject();

            if (request.getProjectId() != null && !request.getProjectId().equals(stageProject.getId())) {
                throw new BadRequestException("La fase no pertenece al proyecto enviado.");
            }

            // We save both levels
            timeLog.setStage(stage);
            timeLog.setProject(stageProject);

        } else if (request.getProjectId() != null) {
            // Only the project comes
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + request.getProjectId()));

            // We save this only level
            timeLog.setProject(project);
        }

        // Save and map it
        TimeLog savedTimeLog = timeLogRepository.save(timeLog);
        return toDto(savedTimeLog);
    }

    public TimeLogDTO pause(TimeLogPause request, Integer id) {
        TimeLog timeLog = timeLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El time log que se intenta pausar no existe en la base de datos"));


        if (timeLog.getEndDateTime() != null) {
            throw new BadRequestException("Se esta intentando pausar un timer que no se ha iniciado");
        }
        timeLog.setEndDateTime(request.getEndDateTime());

        TimeLog timeLog1 = timeLogRepository.save(timeLog);
        return toDto(timeLog1);
    }

    @Transactional
    public List<TimeLogDTO> stop(TimeLogBatchRequest request) {
        User user = userService.getAuthenticatedUser();
        List<TimeLog> noCompletedTimeLogs = timeLogRepository.findByUserIdAndIsCompletedFalse(user.getId());

        if (request.getId() != null) {
            if (request.getEndDateTime() == null) {
                throw new BadRequestException("Para parar un registro de tiempo activo se debe enviar el momento de finalización.");
            }

            TimeLog activeLog = noCompletedTimeLogs.stream()
                    .filter(log -> log.getId().equals(request.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("El time log que intentas parar no existe o ya estaba completado."));

            activeLog.setEndDateTime(request.getEndDateTime());
        }

        for (TimeLog timeLog : noCompletedTimeLogs) {
            timeLog.setIsCompleted(true);
            timeLog.setActivityDescription(request.getActivityDescription());
        }

        timeLogRepository.saveAll(noCompletedTimeLogs);

        return noCompletedTimeLogs.stream().map(this::toDto).toList();
    }

    // ==========================================
    // AUXILIAR METHODS
    // ==========================================

    private String extractColor(TimeLog log) {
        if (log.getStage() != null) return log.getStage().getColour();
        if (log.getTask() != null && log.getTask().getStage() != null) return log.getTask().getStage().getColour();
        return null;
    }

    private String extractLogo(TimeLog log) {
        if (log.getProject() != null) return log.getProject().getLogoUrl();
        if (log.getStage() != null) return log.getStage().getProject().getLogoUrl();
        if (log.getTask() != null) return log.getTask().getStage().getProject().getLogoUrl();
        return null;
    }

    private String extractName(TimeLog log) {
        if (log.getTask() != null) return log.getTask().getName();
        if (log.getStage() != null) return log.getStage().getName();
        if (log.getProject() != null) return log.getProject().getName();
        return "Actividad Desconocida";
    }

    private boolean isSameTarget(TimeLog log, TimeLogRequest request) {
        if (request.getTaskId() != null) {
            return log.getTask() != null && log.getTask().getId().equals(request.getTaskId());
        } else if (request.getStageId() != null) {
            return log.getTask() == null && log.getStage() != null && log.getStage().getId().equals(request.getStageId());
        } else if (request.getProjectId() != null) {
            return log.getTask() == null && log.getStage() == null && log.getProject() != null && log.getProject().getId().equals(request.getProjectId());
        }
        return false;
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
                .initDateTime(timeLog.getInitDateTime())
                .endDateTime(timeLog.getEndDateTime())
                .minutes(timeLog.getMinutes())
                .logo(timeLog.getProject().getLogoUrl())
                .color(color)
                .taskName(taskName)
                .build();
    }
}
