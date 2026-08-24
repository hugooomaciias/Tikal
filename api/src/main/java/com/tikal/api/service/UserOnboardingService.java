package com.tikal.api.service;

import com.tikal.api.model.dto.auth.RegisterRequest;
import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.*;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import com.tikal.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

@Service
public class UserOnboardingService {

    @Autowired private CalendarEventRepository calendarEventRepository;
    @Autowired private UserSettingsRepository settingsRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private StageRepository stageRepository;
    @Autowired private TaskRepository taskRepository;

    /**
     * This method is called just after to save a new user
     */
    public void readyNewAccount(User newUser, String language, String timeZone) {
        createDefaultSettings(newUser, language, timeZone);
        generateSampleData(newUser);
    }

    private void createDefaultSettings(User user, String language, String timeZone) {
        UserSettings settings = new UserSettings();
        settings.setUser(user);
        settings.setTheme(ThemeSetting.MAYA);
        settings.setTimeRange(TimeRangeSetting.SEMANAL);

        if (language == null || language.trim().isEmpty()) {
            settings.setUserLanguage(SupportedLanguages.ES);
        } else {
            if (language.toLowerCase().startsWith("en")) {
                settings.setUserLanguage(SupportedLanguages.EN);
            } else {
                settings.setUserLanguage(SupportedLanguages.ES);
            }
        }

        if (timeZone == null || timeZone.trim().isEmpty()) {
            settings.setTimezone("UTC");
        } else {
            settings.setTimezone(timeZone);
        }
        settings.setHoursGoal(40);
        settings.setFocusSessionMinutes(25);
        settings.setNotificationSettings(new NotificationSettingsMetadata());
        settings.setWidgetPreferences(new WidgetPreferencesMetadata());

        LayoutsDashboardMetadata layouts = new LayoutsDashboardMetadata();

        // Home widgets
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("weeklyProgressWidget", 0, 0, 1, 1));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("timeTrackerWidget", 1, 0, 1, 1));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("templeModeWidget", 2, 0, 1, 1));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("taskWidget", 3, 0, 1, 2));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("AIMainWidget", 0, 1, 1, 1));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("calendarWidget", 1, 1, 2, 1));

        // Cajas para las Estadísticas
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("solarChartWidget", 0, 0, 1, 2));
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("effectivenessChartWidget", 1, 0, 2, 1));
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("timeGoalWidget", 3, 0, 1, 1));
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("concentrationHeatmapWidget", 1, 1, 1, 1));
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("comparisonWidget", 2, 1, 1, 1));
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("iaAdviceWidget", 3, 1, 1, 1));

        settings.setLayoutsDashboards(layouts);

        settingsRepository.save(settings);
    }

    private void generateSampleData(User user) {
        Instant now = Instant.now();

        // ==========================================
        // 1. TUTORIAL PROJECT
        // ==========================================
        Project tutorialProject = new Project();
        tutorialProject.setName("Campamento Base (Tutorial)");
        tutorialProject.setDescription("Sigue estas tareas para dominar Tikal en 3 minutos.");
        tutorialProject.setUserOwner(user);
        tutorialProject.setLogoUrl("IconFlag");
        tutorialProject.setIsGroupBased(false);
        tutorialProject.setProjectType(ProjectType.PROJECT);
        tutorialProject = projectRepository.save(tutorialProject);

        Stage stageTodo = new Stage();
        stageTodo.setName("Por descubrir");
        stageTodo.setProject(tutorialProject);
        stageTodo.setColour("b3");
        stageTodo = stageRepository.save(stageTodo);

        Stage stage2 = new Stage();
        stage2.setName("Prueba a añadir alguna tarea");
        stage2.setProject(tutorialProject);
        stage2.setColour("y2");
        stage2 = stageRepository.save(stage2);

        // Task 1: show the subtasks
        Task task1 = new Task();
        task1.setName("Descubre el poder de las subtareas");
        task1.setDescription("Haz clic en la tarea para ver cómo funciona.");
        task1.setStage(stageTodo);
        task1.setAssignedUser(user);

        Task subtask1 = new Task();
        subtask1.setName("Crear mi primer proyecto propio");
        subtask1.setStage(stageTodo);
        subtask1.setAssignedUser(user);
        subtask1.setParentTask(task1);

        Task subtask2 = new Task();
        subtask2.setName("Invitar a un amigo al equipo");
        subtask2.setStage(stageTodo);
        subtask2.setAssignedUser(user);
        subtask2.setParentTask(task1);

        task1.getSubtasks().add(subtask1);
        task1.getSubtasks().add(subtask2);
        taskRepository.save(task1);

        // Task 2: show in the calendar and deadlines
        Task task2 = new Task();
        task2.setName("Revisar mi calendario de Tikal");
        task2.setDescription("Esta tarea tiene una fecha límite y se ha añadido a tu calendario automáticamente.");
        task2.setStage(stageTodo);
        task2.setAssignedUser(user);
        Instant deadline = now.atZone(ZoneOffset.UTC)
                .plusDays(1)
                .withHour(18)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        task2.setDeadline(deadline);
        task2 = taskRepository.save(task2);

        // -> We create the deadline event for the task
        CalendarEvent calendarEvent = new CalendarEvent();
        calendarEvent.setName("Entrega Tarea: " + task2.getName());
        calendarEvent.setInitDateTime(task2.getDeadline().minus(1, ChronoUnit.HOURS));
        calendarEvent.setEndDateTime(task2.getDeadline());
        calendarEvent.setEventType(EventType.DEADLINE);
        calendarEvent.setUser(user);
        calendarEvent.setProject(tutorialProject);
        calendarEvent.setStage(stageTodo);
        calendarEvent.setTask(task2);
        calendarEventRepository.save(calendarEvent);

        // Task 3: completed task for the visual feedback
        Task task3 = new Task();
        task3.setName("Registrarme en Tikal");
        task3.setStage(stage2);
        task3.setAssignedUser(user);
        task3.setIsCompleted(true);
        task3.setCompletionDate(now);
        taskRepository.save(task3);


        // ==========================================
        // 2. Example List
        // ==========================================
        Project personalList = new Project();
        personalList.setName("Vida Personal");
        personalList.setDescription("Un espacio para tus recados y notas.");
        personalList.setUserOwner(user);
        personalList.setLogoUrl("IconHome");
        personalList.setIsGroupBased(false);
        personalList.setProjectType(ProjectType.LIST);
        personalList = projectRepository.save(personalList);

        Stage sublist1 = new Stage();
        sublist1.setName("Trámites");
        sublist1.setProject(personalList);
        sublist1.setColour("y2");
        sublist1 = stageRepository.save(sublist1);

        Stage sublist2 = new Stage();
        sublist2.setName("Lista de la compra");
        sublist2.setProject(personalList);
        sublist2.setColour("b2");
        sublist2 = stageRepository.save(sublist2);

        Task listTask1 = new Task();
        listTask1.setName("Renovar el DNI");
        listTask1.setStage(sublist1);
        listTask1.setAssignedUser(user);
        taskRepository.save(listTask1);

        Task listTask2 = new Task();
        listTask1.setName("Tomate");
        listTask1.setStage(sublist2);
        listTask1.setAssignedUser(user);
        taskRepository.save(listTask2);

        Task listTask3 = new Task();
        listTask1.setName("Leche");
        listTask1.setStage(sublist2);
        listTask1.setAssignedUser(user);
        taskRepository.save(listTask3);

        Task listTask4 = new Task();
        listTask1.setName("Pan");
        listTask1.setStage(sublist2);
        listTask1.setAssignedUser(user);
        taskRepository.save(listTask4);
    }
}