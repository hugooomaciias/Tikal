package com.tikal.api.service;

import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.SupportedLanguages;
import com.tikal.api.model.entity.enumerated.ThemeSetting;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import com.tikal.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserOnboardingService {

    @Autowired private UserSettingsRepository settingsRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private StageRepository stageRepository;
    @Autowired private TaskRepository taskRepository;

    /**
     * Este método se llama justo después de guardar al nuevo usuario en BD.
     */
    public void readyNewAccount(User newUser) {
        createDefaultSettings(newUser);
        generateSampleData(newUser);
    }

    private void createDefaultSettings(User user) {
        UserSettings settings = new UserSettings();
        settings.setUser(user);
        settings.setTheme(ThemeSetting.MAYA);
        settings.setTimeRange(TimeRangeSetting.SEMANAL);
        settings.setUserLanguage(SupportedLanguages.ES);
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
        Project welcomeProject = new Project();
        welcomeProject.setName("Proyecto de prueba");
        welcomeProject.setDescription("Proyecto de ejemplo para aprender a usar la plataforma");
        welcomeProject.setUserOwner(user);
        welcomeProject.setLogoUrl("IconBook");
        welcomeProject.setIsGroupBased(false);
        welcomeProject = projectRepository.save(welcomeProject);

        Stage stage1 = new Stage();
        stage1.setName("Fase 1 de ejemplo");
        stage1.setProject(welcomeProject);
        stage1.setColour("g4");
        stage1 = stageRepository.save(stage1);

        Stage stage2 = new Stage();
        stage2.setName("Fase 2 de ejemplo");
        stage2.setProject(welcomeProject);
        stage2.setColour("y5");
        stage2 = stageRepository.save(stage2);

        Task task1 = new Task();
        task1.setName("Explorar el Dashboard Solar");
        task1.setStage(stage1);
        task1.setAssignedUser(user);
        taskRepository.save(task1);

        Task task2 = new Task();
        task2.setName("Configurar mi perfil y avatar");
        task2.setStage(stage2);
        task2.setAssignedUser(user);
        taskRepository.save(task2);
    }
}