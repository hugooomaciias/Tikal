package com.tikal.api.service;

import com.tikal.api.exception.NotFoundTaskException;
import com.tikal.api.exception.ProjectAccessDeniedException;
import com.tikal.api.model.dto.task.*;
import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.EventType;
import com.tikal.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final StageRepository stageRepository;
    private final UserService userService;
    private final TeamMemberRepository teamMemberRepository;
    private final CalendarEventRepository calendarEventRepository;

    public List<TaskDTO> getTasksByStage(Integer stageId) {
        User currentUser = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new RuntimeException("Fase no encontrada"));

        validateTaskPermissions(stage.getProject(), currentUser, "ver");

        List<Task> tasks = taskRepository.findByStage_IdAndParentTaskIsNull(stageId);

        if (tasks.isEmpty()) {
            return List.of();
        }

        List<Integer> mainTaskIds = tasks.stream().map(Task::getId).toList();

        List<CalendarEvent> deadlineEvents = calendarEventRepository
                .findByTaskIdInAndEventType(mainTaskIds, EventType.DEADLINE);

        Set<Integer> tasksWithDeadline = deadlineEvents.stream()
                .filter(event -> event.getTask() != null)
                .map(event -> event.getTask().getId())
                .collect(Collectors.toSet());

        return tasks.stream()
                .map(task -> toDtoMainTask(task, tasksWithDeadline))
                .toList();
    }

    @Transactional
    public TaskDTO createTask(TaskRequest request) {
        User currentUser = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(request.getStageId())
                .orElseThrow(() -> new RuntimeException("Stage no encontrado"));

        validateTaskPermissions(stage.getProject(), currentUser, "crear");

        Task parentTask = new Task();
        parentTask.setName(request.getName());
        parentTask.setDescription(request.getDescription());
        parentTask.setEstimatedTime(request.getEstimatedTime());
        parentTask.setTimeUnit(request.getTimeUnit());
        parentTask.setEstimatedProfit(request.getEstimatedProfit());
        parentTask.setDeadline(request.getDeadline());
        parentTask.setStage(stage);
        parentTask.setAssignedUser(currentUser);

        // For subtask, we only save the name
        if (request.getSubtasks() != null) {
            for (TaskRequest.SubtaskRequest subDto : request.getSubtasks()) {
                Task subtask = new Task();
                subtask.setName(subDto.getName());
                subtask.setStage(stage);
                subtask.setAssignedUser(currentUser);
                subtask.setParentTask(parentTask);

                parentTask.getSubtasks().add(subtask);
            }
        }

        Task savedTask = taskRepository.save(parentTask);

        // Calendar logic only for the parent task
        if (Boolean.TRUE.equals(request.getAddToCalendar()) && savedTask.getDeadline() != null) {
            createDeadlineEvent(savedTask, currentUser);
        }

        Set<Integer> deadlineSet = Boolean.TRUE.equals(request.getAddToCalendar())
                ? Set.of(savedTask.getId()) : Set.of();

        return toDtoMainTask(savedTask, deadlineSet);
    }

    @Transactional
    public void deleteTask(Integer id) {
        User currentUser = userService.getAuthenticatedUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundTaskException("No existe la tarea que se quiere eliminar"));

        validateTaskPermissions(task.getStage().getProject(), currentUser, "borrar");

        taskRepository.delete(task);
    }

    @Transactional
    public TaskDTO updateTask(Integer id, TaskRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));

        validateTaskPermissions(task.getStage().getProject(), currentUser, "actualizar");

        // Basic actualization
        if (request.getName() != null) task.setName(request.getName());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getEstimatedTime() != null) task.setEstimatedTime(request.getEstimatedTime());
        if (request.getEstimatedProfit() != null) task.setEstimatedProfit(request.getEstimatedProfit());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
        if (request.getTimeUnit() != null) task.setTimeUnit(request.getTimeUnit());

        // Subtask synchronization
        if (request.getSubtasks() != null) {
            List<Task> currentSubtasks = task.getSubtasks();

            // We retrieve the IDs of the subtasks sent to us from the frontend
            Set<Integer> requestedSubtaskIds = request.getSubtasks().stream()
                    .map(TaskRequest.SubtaskRequest::getId)
                    .filter(subId -> subId != null)
                    .collect(Collectors.toSet());

            // DELETE: We remove the subtasks that are NO LONGER in the Frontend Request
            // Thanks to `orphanRemoval = true` in the Task entity, Hibernate will delete them from MySQL automatically
            currentSubtasks.removeIf(subtask -> !requestedSubtaskIds.contains(subtask.getId()));

            // B. UPDATE OR CREATE
            for (TaskRequest.SubtaskRequest subDto : request.getSubtasks()) {
                if (subDto.getId() == null) {
                    // If it has no ID, it is a NEW subtask
                    Task newSubtask = new Task();
                    newSubtask.setName(subDto.getName());
                    newSubtask.setStage(task.getStage());
                    newSubtask.setAssignedUser(currentUser);
                    newSubtask.setParentTask(task);
                    currentSubtasks.add(newSubtask);
                } else {
                    // If it has an ID, we UPDATE the existing one
                    currentSubtasks.stream()
                            .filter(sub -> sub.getId().equals(subDto.getId()))
                            .findFirst()
                            .ifPresent(existingSub -> existingSub.setName(subDto.getName()));
                }
            }
        }

        Task updatedTask = taskRepository.save(task);

        // 3. Calendar logic
        boolean hasDeadline = false;
        if (updatedTask.getParentTask() == null) {
            hasDeadline = syncDeadlineEvent(updatedTask, currentUser, request.getAddToCalendar());
        }

        Set<Integer> deadlineSet = hasDeadline ? Set.of(updatedTask.getId()) : Set.of();

        return toDtoMainTask(updatedTask, deadlineSet);
    }

    @Transactional
    public TaskDTO toggleTaskStatus(Integer id) {
        User currentUser = userService.getAuthenticatedUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundTaskException("Tarea no encontrada con ID: " + id));

        validateTaskPermissions(task.getStage().getProject(), currentUser, "actualizar");

        boolean newStatus = !task.getIsCompleted();
        LocalDateTime completionDate = newStatus ? LocalDateTime.now() : null;

        task.setIsCompleted(newStatus);
        task.setCompletionDate(completionDate);

        // Fallthrough of complete and uncompleted a task: the subtasks has to be completed or uncompleted automatically
        if (task.getSubtasks() != null && !task.getSubtasks().isEmpty()) {
            for (Task subtask : task.getSubtasks()) {
                subtask.setIsCompleted(newStatus);
                subtask.setCompletionDate(completionDate);
            }
        }

        Task updatedTask = taskRepository.save(task);

        boolean hasDeadline = false;
        if (updatedTask.getParentTask() == null) {
            hasDeadline = calendarEventRepository
                    .findByTaskIdAndEventType(updatedTask.getId(), EventType.DEADLINE)
                    .isPresent();
        }

        Set<Integer> deadlineSet = hasDeadline ? Set.of(updatedTask.getId()) : Set.of();

        return toDtoMainTask(updatedTask, deadlineSet);
    }

    // ==========================================
    //          AUXILIARY METHODS
    // ==========================================

    private void validateTaskPermissions(Project project, User user, String action) {
        if (project.getIsGroupBased()) {
            if (action.equalsIgnoreCase("ver")) {
                boolean isMember = teamMemberRepository
                        .findByUserIdAndTeamId(user.getId(), project.getTeam().getId())
                        .isPresent();
                if (!isMember) {
                    throw new ProjectAccessDeniedException("Debes ser miembro del equipo para ver las tareas.");
                }
            } else {
                List<TeamMember> adminMembers = teamMemberRepository.findTeamAdmins(project.getTeam().getId());
                boolean isCurrentUserAdmin = adminMembers.stream()
                        .anyMatch(member -> member.getUser().getId().equals(user.getId()));

                if (!isCurrentUserAdmin) {
                    throw new ProjectAccessDeniedException("Solo los administradores del equipo pueden " + action + " tareas.");
                }
            }
        } else {
            if (project.getUserOwner() == null || !project.getUserOwner().getId().equals(user.getId())) {
                throw new ProjectAccessDeniedException("No tienes permiso para " + action + " esta tarea.");
            }
        }
    }

    private void createDeadlineEvent(Task task, User user) {
        CalendarEvent event = new CalendarEvent();
        event.setName("Entrega Tarea: " + task.getName());
        event.setInitDateTime(task.getDeadline().minusHours(1));
        event.setEndDateTime(task.getDeadline());
        event.setEventType(EventType.DEADLINE);
        event.setUser(user);
        event.setProject(task.getStage().getProject());
        event.setStage(task.getStage());
        event.setTask(task);
        calendarEventRepository.save(event);
    }

    private boolean syncDeadlineEvent(Task task, User user, Boolean requestedAddToCalendar) {
        Optional<CalendarEvent> existingEventOpt = calendarEventRepository
                .findByTaskIdAndEventType(task.getId(), EventType.DEADLINE);

        boolean wantsInCalendar = Boolean.TRUE.equals(requestedAddToCalendar) && task.getDeadline() != null;

        if (wantsInCalendar) {
            if (existingEventOpt.isPresent()) {
                CalendarEvent event = existingEventOpt.get();
                event.setName("Entrega Tarea: " + task.getName());
                event.setInitDateTime(task.getDeadline().minusHours(1));
                event.setEndDateTime(task.getDeadline());
                calendarEventRepository.save(event);
            } else {
                createDeadlineEvent(task, user);
            }
            return true;
        } else {
            existingEventOpt.ifPresent(calendarEventRepository::delete);
            return false;
        }
    }

    // MAIN MAPPER FOR PARENT TASKS
    private TaskDTO toDtoMainTask(Task task, Set<Integer> tasksWithDeadline) {
        int count = (task.getSubtasks() != null) ? task.getSubtasks().size() : 0;

        // Easier mapper for subtasks
        List<TaskDTO> subtasks = (task.getSubtasks() != null)
                ? task.getSubtasks().stream().map(this::toDtoSubtask).toList()
                : null;

        return TaskDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .estimatedTime(task.getEstimatedTime())
                .timeUnit(task.getTimeUnit())
                .estimatedProfit(task.getEstimatedProfit())
                .isCompleted(task.getIsCompleted())
                .completionDate(task.getCompletionDate())
                .deadline(task.getDeadline())
                .totalLoggedMinutes(task.getTotalLoggedMinutes())
                .templeLoggedMinutes(task.getTempleLoggedMinutes())
                .colour(task.getStage().getColour())
                .logo(task.getStage().getProject().getLogoUrl())
                .addToCalendar(tasksWithDeadline.contains(task.getId()))
                .subtasks(subtasks)
                .subtasksCount(count)
                .build();
    }

    // SIMPLIFIED MAPPER FOR SUBTASKS
    private TaskDTO toDtoSubtask(Task subtask) {
        return TaskDTO.builder()
                .id(subtask.getId())
                .name(subtask.getName())
                .isCompleted(subtask.getIsCompleted())
                .build();
    }
}