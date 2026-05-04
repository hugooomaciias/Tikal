package com.tikal.api.service;

import com.tikal.api.exception.NotFoundTaskException;
import com.tikal.api.model.dto.task.CreateSubtaskRequest;
import com.tikal.api.model.dto.task.CreateTaskRequest;
import com.tikal.api.model.dto.task.TaskDTO;
import com.tikal.api.model.dto.task.UpdateTaskRequest;
import com.tikal.api.model.entity.Stage;
import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.StageRepository;
import com.tikal.api.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final StageRepository stageRepository;
    private final UserService userService;

    public List<TaskDTO> getTasksByStage(Integer stageId) {
        List<Task> tasks = taskRepository.findByStage_IdAndParentTaskIsNull(stageId);

        return tasks.stream().map(this::toDto).toList();
    }

    public List<TaskDTO> getSubtask(Integer parentId) {
        if (!taskRepository.existsById(parentId)) {
            throw new NotFoundTaskException("La tarea padre no existe");
        }
        List<Task> subtasks = taskRepository.findByParentTask_Id(parentId);
        return subtasks.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(CreateTaskRequest request) {
        User currentUser = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(request.getStageId())
                .orElseThrow(() -> new RuntimeException("Stage no encontrado"));

        Task parentTask = new Task();
        parentTask.setName(request.getName());
        parentTask.setDescription(request.getDescription());
        parentTask.setEstimatedTime(request.getEstimatedTime());
        parentTask.setEstimatedProfit(request.getEstimatedProfit());
        parentTask.setDeadline(request.getDeadline());

        parentTask.setStage(stage);
        parentTask.setAssignedUser(currentUser);

        if (request.getSubtasks() != null) {
            for (CreateSubtaskRequest subDto : request.getSubtasks()) {
                Task subtask = new Task();
                subtask.setName(subDto.getName());
                subtask.setEstimatedProfit(subDto.getEstimatedProfit());
                subtask.setEstimatedTime(subDto.getEstimatedTime());

                subtask.setStage(stage);
                subtask.setAssignedUser(currentUser);
                subtask.setParentTask(parentTask);

                parentTask.getSubtasks().add(subtask);
            }
        }

        Task savedTask = taskRepository.save(parentTask);
        return toDto(savedTask);
    }

    @Transactional
    public void deleteTask(Integer id) {
        if (!taskRepository.existsById(id)) {
            throw new NotFoundTaskException("No existe la tarea que se quiere eliminar");
        }
        taskRepository.deleteById(id);
    }

    @Transactional
    public TaskDTO updateTask(Integer id, UpdateTaskRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        // 1. Task searching
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));

        // 2. Security validation: only the owner can edit it
        if (!task.getAssignedUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("No tienes permiso para editar esta tarea");
        }

        // 3. Basic actualization (ignoring null values on the request)
        if (request.getName() != null) task.setName(request.getName());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getEstimatedTime() != null) task.setEstimatedTime(request.getEstimatedTime());
        if (request.getEstimatedProfit() != null) task.setEstimatedProfit(request.getEstimatedProfit());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());

        // 4. Business Logic: Completion Status
        if (request.getIsCompleted() != null) {
            if (request.getIsCompleted() && !task.getIsCompleted()) {
                task.setCompletionDate(LocalDateTime.now());
            }
            else if (!request.getIsCompleted() && task.getIsCompleted()) {
                task.setCompletionDate(null);
            }
            task.setIsCompleted(request.getIsCompleted());
        }

        // 5. Stage change
        if (request.getStageId() != null && !request.getStageId().equals(task.getStage().getId())) {
            Stage newStage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new RuntimeException("Fase destino no encontrada"));
            task.setStage(newStage);

            // Regla de Negocio: Si movemos al padre de fase, movemos también a los hijos
            if (task.getSubtasks() != null && !task.getSubtasks().isEmpty()) {
                for (Task subtask : task.getSubtasks()) {
                    subtask.setStage(newStage);
                }
            }
        }

        // 6. Changing the hierarchy
        if (request.getParentTaskId() != null) {
            if (request.getParentTaskId().equals(task.getId())) {
                throw new RuntimeException("Una tarea no puede ser subtarea de sí misma");
            }
            if (request.getParentTaskId() == -1) {
                task.setParentTask(null); //  to a main task
            } else {
                Task newParent = taskRepository.findById(request.getParentTaskId())
                        .orElseThrow(() -> new RuntimeException("Tarea padre destino no encontrada"));

                if (newParent.getParentTask() != null) {
                    throw new RuntimeException("No se permiten subtareas de 3er nivel (el destino ya es una subtarea)");
                }

                task.setParentTask(newParent);
                task.setStage(newParent.getStage());
            }
        }

        // 7. Save and return
        Task updatedTask = taskRepository.save(task);
        return toDto(updatedTask);
    }

    // ==========================================
    // MAPPER
    // ==========================================
    private TaskDTO toDto(Task task) {
        int count = (task.getSubtasks() != null) ? task.getSubtasks().size() : 0;
        List<TaskDTO> subtasks = (task.getSubtasks() != null)
                ? task.getSubtasks().stream().map(this::toDto).toList() : null;

        return TaskDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .estimatedTime(task.getEstimatedTime())
                .estimatedProfit(task.getEstimatedProfit())
                .isCompleted(task.getIsCompleted())
                .completionDate(task.getCompletionDate())
                .deadline(task.getDeadline())
                .totalLoggedMinutes(task.getTotalLoggedMinutes())
                .templeLoggedMinutes(task.getTempleLoggedMinutes())
                .colour(task.getStage().getColour())
                .logo(task.getStage().getProject().getLogoUrl())
                .subtasks(subtasks)
                .subtasksCount(count)
                .build();
    }
}
