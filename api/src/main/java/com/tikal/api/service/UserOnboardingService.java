package com.tikal.api.service;

import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.ThemeSetting;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
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
    public void prepararCuentaNueva(User nuevoUsuario) {
        crearConfiguracionPorDefecto(nuevoUsuario);
        crearDatosDeEjemplo(nuevoUsuario);
    }

    private void crearConfiguracionPorDefecto(User usuario) {
        UserSettings settings = new UserSettings();
        settings.setUser(usuario);
        settings.setTheme(ThemeSetting.MAYA);
        settings.setTimeRange(TimeRangeSetting.SEMANAL);

        LayoutsDashboardMetadata layouts = new LayoutsDashboardMetadata();

        // Cajas para el Home
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("headerStats", 0, 0, 12, 2));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("timeTracker", 0, 2, 4, 4));
        layouts.getHome().add(new LayoutsDashboardMetadata.WidgetPosition("taskList", 4, 2, 8, 8));

        // Cajas para las Estadísticas
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("solarChart", 0, 0, 6, 6));
        layouts.getStatistics().add(new LayoutsDashboardMetadata.WidgetPosition("heatmap", 6, 0, 6, 6));

        settings.setLayoutsDashboards(layouts);

        settingsRepository.save(settings);
    }

    private void crearDatosDeEjemplo(User usuario) {
        Project proyectoBienvenida = new Project();
        proyectoBienvenida.setName("👋 Bienvenido a Tikal");
        proyectoBienvenida.setDescription("Proyecto de ejemplo para que aprendas a usar la plataforma.");
        proyectoBienvenida.setUserOwner(usuario);
        proyectoBienvenida = projectRepository.save(proyectoBienvenida);

        Stage fasePorHacer = new Stage();
        fasePorHacer.setName("Stage 1 de ejemplo");
        fasePorHacer.setProject(proyectoBienvenida);
        fasePorHacer = stageRepository.save(fasePorHacer);

        Stage faseCompletado = new Stage();
        faseCompletado.setName("Stage 2 de ejemplo");
        faseCompletado.setProject(proyectoBienvenida);
        faseCompletado = stageRepository.save(faseCompletado);

        Task tarea1 = new Task();
        tarea1.setName("Explorar el Dashboard Solar");
        tarea1.setStage(fasePorHacer);
        tarea1.setAssignedUser(usuario);
        taskRepository.save(tarea1);

        Task tarea2 = new Task();
        tarea2.setName("Configurar mi perfil y avatar");
        tarea2.setStage(faseCompletado);
        tarea2.setAssignedUser(usuario);
        taskRepository.save(tarea2);
    }
}