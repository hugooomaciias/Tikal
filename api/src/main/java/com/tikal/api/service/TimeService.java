package com.tikal.api.service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.tikal.api.model.entity.Calendar_Event;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.Stage;
import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.Time_Log;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.CalendarEventRepository;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.StageRepository;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TimeLogRepository;

/**
 * Service responsible for managing time-related operations in the application:
 * - Creating projects, stages, and tasks
 * - Starting and stopping timers for projects, stages, and tasks
 * - Recording and calculating time logs
 * - Managing calendar events
 */
@Service
public class TimeService {
    @Autowired
    private ProjectRepository projectRepo;
    
    @Autowired
    private StageRepository stageRepo;
    
    @Autowired
    private TaskRepository taskRepo;
    
    @Autowired
    private TimeLogRepository timeLogRepo;
    
    @Autowired
    private CalendarEventRepository calendarRepo;
    
    /**
     * Creates a new project for a user
     * @param project The project entity to create
     * @return The saved project
     */
    public Project createProject(Project project) {
        return projectRepo.save(project);
    }
    
    /**
     * Gets all projects owned by a specific user
     * @param userId The ID of the user
     * @return List of projects owned by the user
     */
    public List<Project> getProjectsByUser(Integer userId) {
        return projectRepo.findByOwnerUser_Id(userId);
    }
    
    /**
     * Gets a specific project by ID
     * @param projectId The ID of the project
     * @return The project if found, empty Optional otherwise
     */
    public Optional<Project> getProjectById(Integer projectId) {
        return projectRepo.findById(projectId);
    }
    
    /**
     * Updates an existing project
     * @param projectId The ID of the project to update
     * @param project The updated project data
     * @return The updated project
     */
    public Project updateProject(Integer projectId, Project project) {
        project.setId(projectId);
        return projectRepo.save(project);
    }
    
    /**
     * Deletes a project
     * @param projectId The ID of the project to delete
     */
    public void deleteProject(Integer projectId) {
        projectRepo.deleteById(projectId);
    }
    
    /**
     * Creates a new stage within a project
     * @param stage The stage entity to create
     * @return The saved stage
     */
    public Stage createStage(Stage stage) {
        return stageRepo.save(stage);
    }
    
    /**
     * Gets all stages of a specific project
     * @param projectId The ID of the project
     * @return List of stages in the project
     */
    public List<Stage> getStagesByProject(Integer projectId) {
        return stageRepo.findByProject_Id(projectId);
    }
    
    /**
     * Gets a specific stage by ID
     * @param stageId The ID of the stage
     * @return The stage if found, empty Optional otherwise
     */
    public Optional<Stage> getStageById(Integer stageId) {
        return stageRepo.findById(stageId);
    }
    
    /**
     * Updates an existing stage
     * @param stageId The ID of the stage to update
     * @param stage The updated stage data
     * @return The updated stage
     */
    public Stage updateStage(Integer stageId, Stage stage) {
        stage.setId(stageId);
        return stageRepo.save(stage);
    }
    
    /**
     * Deletes a stage
     * @param stageId The ID of the stage to delete
     */
    public void deleteStage(Integer stageId) {
        stageRepo.deleteById(stageId);
    }
    
    /**
     * Creates a new task within a stage
     * @param task The task entity to create
     * @return The saved task
     */
    public Task createTask(Task task) {
        return taskRepo.save(task);
    }
    
    /**
     * Gets all tasks in a specific stage
     * @param stageId The ID of the stage
     * @return List of tasks in the stage
     */
    public List<Task> getTasksByStage(Integer stageId) {
        return taskRepo.findByStage_Id(stageId);
    }
    
    /**
     * Gets all subtasks of a parent task
     * @param parentTaskId The ID of the parent task
     * @return List of subtasks
     */
    public List<Task> getSubtasks(Integer parentTaskId) {
        return taskRepo.findByParentTask_Id(parentTaskId);
    }
    
    /**
     * Gets all tasks assigned to a specific user
     * @param userId The ID of the user
     * @return List of tasks assigned to the user
     */
    public List<Task> getTasksByUser(Integer userId) {
        return taskRepo.findByAssignedUser_Id(userId);
    }
    
    /**
     * Gets a specific task by ID
     * @param taskId The ID of the task
     * @return The task if found, empty Optional otherwise
     */
    public Optional<Task> getTaskById(Integer taskId) {
        return taskRepo.findById(taskId);
    }
    
    /**
     * Updates an existing task
     * @param taskId The ID of the task to update
     * @param task The updated task data
     * @return The updated task
     */
    public Task updateTask(Integer taskId, Task task) {
        task.setId(taskId);
        return taskRepo.save(task);
    }
    
    /**
     * Deletes a task
     * @param taskId The ID of the task to delete
     */
    public void deleteTask(Integer taskId) {
        taskRepo.deleteById(taskId);
    }
    
    /**
     * Starts a timer for a project by creating a Time_Log entry
     * @param user The user starting the timer
     * @param project The project to track time for
     * @param targetTime Optional target time in minutes
     * @param isTempleMode Whether temple mode is activated
     * @return The created Time_Log entry
     */
    public Time_Log startProjectTimer(User user, Project project, Integer targetTime, Boolean isTempleMode) {
        Time_Log timeLog = new Time_Log();
        timeLog.setUser(user);
        timeLog.setProject(project);
        timeLog.setInitDateTime(LocalDateTime.now());
        timeLog.setTargetTime(targetTime);
        timeLog.setIsTempleMode(isTempleMode != null ? isTempleMode : false);
        
        return timeLogRepo.save(timeLog);
    }
    
    /**
     * Starts a timer for a stage
     * @param user The user starting the timer
     * @param stage The stage to track time for
     * @param targetTime Optional target time in minutes
     * @param isTempleMode Whether temple mode is activated
     * @return The created Time_Log entry
     */
    public Time_Log startStageTimer(User user, Stage stage, Integer targetTime, Boolean isTempleMode) {
        Time_Log timeLog = new Time_Log();
        timeLog.setUser(user);
        timeLog.setStage(stage);
        timeLog.setInitDateTime(LocalDateTime.now());
        timeLog.setTargetTime(targetTime);
        timeLog.setIsTempleMode(isTempleMode != null ? isTempleMode : false);
        
        return timeLogRepo.save(timeLog);
    }
    
    /**
     * Starts a timer for a task
     * @param user The user starting the timer
     * @param task The task to track time for
     * @param targetTime Optional target time in minutes
     * @param isTempleMode Whether temple mode is activated
     * @return The created Time_Log entry
     */
    public Time_Log startTaskTimer(User user, Task task, Integer targetTime, Boolean isTempleMode) {
        Time_Log timeLog = new Time_Log();
        timeLog.setUser(user);
        timeLog.setTask(task);
        timeLog.setInitDateTime(LocalDateTime.now());
        timeLog.setTargetTime(targetTime);
        timeLog.setIsTempleMode(isTempleMode != null ? isTempleMode : false);
        
        return timeLogRepo.save(timeLog);
    }
    
    /**
     * Stops a running timer by setting the end time
     * @param timeLogId The ID of the Time_Log entry
     * @param activityDescription Optional description of the activity performed
     * @return The updated Time_Log entry, or empty Optional if not found
     */
    public Optional<Time_Log> stopTimer(Integer timeLogId, String activityDescription) {
        Optional<Time_Log> timeLog = timeLogRepo.findById(timeLogId);
        
        if (timeLog.isPresent()) {
            Time_Log log = timeLog.get();
            log.setEndDateTime(LocalDateTime.now());
            log.setActivityDescription(activityDescription);

            timeLogRepo.save(log);
        }
        
        return timeLog;
    }
    
    /**
     * Stops a running timer by setting the end time
     * @param timeLogId The ID of the Time_Log entry
     * @return The updated Time_Log entry, or empty Optional if not found
     */
    public Optional<Time_Log> stopTimer(Integer timeLogId) {
        return stopTimer(timeLogId, null);
    }
    
    /**
     * Gets the elapsed time for a Time_Log in seconds
     * @param timeLogId The ID of the Time_Log entry
     * @return The elapsed time in seconds, or 0 if not found or not stopped
     */
    public long getElapsedTime(Integer timeLogId) {
        Optional<Time_Log> timeLog = timeLogRepo.findById(timeLogId);
        
        if (timeLog.isPresent()) {
            Time_Log log = timeLog.get();
            LocalDateTime endTime = log.getEndDateTime() != null ? log.getEndDateTime() : LocalDateTime.now();
            return Duration.between(log.getInitDateTime(), endTime).getSeconds();
        }
        
        return 0;
    }
    
    /**
     * Gets all time logs for a specific user
     * @param userId The ID of the user
     * @return List of time logs for the user
     */
    public List<Time_Log> getTimeLogsByUser(Integer userId) {
        return timeLogRepo.findByUser_Id(userId);
    }
    
    /**
     * Gets all time logs for a specific project
     * @param projectId The ID of the project
     * @return List of time logs for the project
     */
    public List<Time_Log> getTimeLogsByProject(Integer projectId) {
        return timeLogRepo.findByProject_Id(projectId);
    }
    
    /**
     * Gets all time logs for a specific stage
     * @param stageId The ID of the stage
     * @return List of time logs for the stage
     */
    public List<Time_Log> getTimeLogsByStage(Integer stageId) {
        return timeLogRepo.findByStage_Id(stageId);
    }
    
    /**
     * Gets all time logs for a specific task
     * @param taskId The ID of the task
     * @return List of time logs for the task
     */
    public List<Time_Log> getTimeLogsByTask(Integer taskId) {
        return timeLogRepo.findByTask_Id(taskId);
    }
    
    /**
     * Creates a new calendar event
     * @param event The calendar event to create
     * @return The saved calendar event
     */
    public Calendar_Event createCalendarEvent(Calendar_Event event) {
        return calendarRepo.save(event);
    }
    
    /**
     * Gets all calendar events for a specific user
     * @param userId The ID of the user
     * @return List of calendar events ordered by date
     */
    public List<Calendar_Event> getCalendarEventsByUser(Integer userId) {
        return calendarRepo.findByUserIdOrderByInitDateTimeAsc(userId);
    }
    
    /**
     * Gets calendar events for a user within a specific time range
     * @param userId The ID of the user
     * @param start The start date and time
     * @param end The end date and time
     * @return List of calendar events in the time range
     */
    public List<Calendar_Event> getCalendarEventsByUserAndDateRange(Integer userId, LocalDateTime start, LocalDateTime end) {
        return calendarRepo.findByUserIdAndInitDateTimeBetweenOrderByStartTimeAsc(userId, start, end);
    }
    
    /**
     * Gets all linked calendar events for a user (events associated with a project, stage, or task)
     * @param userId The ID of the user
     * @return List of linked calendar events
     */
    public List<Calendar_Event> getLinkedCalendarEventsByUser(Integer userId) {
        return calendarRepo.findLinkedEventsByUserId(userId);
    }
    
    /**
     * Gets calendar events for a user by name search
     * @param userId The ID of the user
     * @param name The name to search for
     * @return List of calendar events matching the name
     */
    public List<Calendar_Event> searchCalendarEventsByName(Integer userId, String name) {
        return calendarRepo.findByUserIdAndNameContainingIgnoreCaseOrderByInitDateTimeAsc(userId, name);
    }
    
    /**
     * Gets a specific calendar event by ID
     * @param eventId The ID of the event
     * @return The calendar event if found, empty Optional otherwise
     */
    public Optional<Calendar_Event> getCalendarEventById(Integer eventId) {
        return calendarRepo.findById(eventId);
    }
    
    /**
     * Updates an existing calendar event
     * @param eventId The ID of the event to update
     * @param event The updated event data
     * @return The updated calendar event
     */
    public Calendar_Event updateCalendarEvent(Integer eventId, Calendar_Event event) {
        event.setId(eventId);
        return calendarRepo.save(event);
    }
    
    /**
     * Deletes a calendar event
     * @param eventId The ID of the event to delete
     */
    public void deleteCalendarEvent(Integer eventId) {
        calendarRepo.deleteById(eventId);
    }
}
