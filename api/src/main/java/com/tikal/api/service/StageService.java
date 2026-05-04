package com.tikal.api.service;

import com.tikal.api.exception.ProjectAccessDeniedException;
import com.tikal.api.model.dto.task.StageDTO;
import com.tikal.api.model.dto.task.StageRequest;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.Stage;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.StageRepository;
import com.tikal.api.repository.TeamMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StageService {
    private final StageRepository stageRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserService userService;

    public List<StageDTO> getMyStages() {
        User user = userService.getAuthenticatedUser();
        List<Stage> stages = stageRepository.findByUserId(user.getId());

        return stages.stream().map(this::toDto).toList();
    }

    public List<StageDTO> getStagesByProject(Integer projectId) {
        User user = userService.getAuthenticatedUser();
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Debe de existir el proyecto por el que se quieren listar las fases");
        }
        List<Stage> stages = stageRepository.findByUserIdAndProjectId(user.getId(), projectId);

        return stages.stream().map(this::toDto).toList();
    }

    @Transactional
    public StageDTO createStage(StageRequest request) {
        User user = userService.getAuthenticatedUser();
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("El proyecto adjunto debe de existir"));

        validateStagePermissions(project, user, "crear");

        Stage stage = Stage.builder()
                .name(request.getName())
                .description(request.getDescription())
                .colour(request.getColour())
                .deadline(request.getDeadline())
                .project(project)
                .build();

        return toDto(stageRepository.save(stage));
    }

    @Transactional
    public void deleteStage(Integer id) {
        User user = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe la fase que se quiere eliminar"));

        validateStagePermissions(stage.getProject(), user, "borrar");

        stageRepository.delete(stage);
    }

    @Transactional
    public StageDTO updateStage(Integer stageId, StageRequest request) {
        User user = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new RuntimeException("No existe la fase que se quiere editar"));

        validateStagePermissions(stage.getProject(), user, "actualizar");

        if (request.getName() != null && !request.getName().isBlank()) {
            stage.setName(request.getName());
        }
        if (request.getDescription() != null) {
            stage.setDescription(request.getDescription());
        }
        if (request.getColour() != null) {
            stage.setColour(request.getColour());
        }
        if (request.getDeadline() != null) {
            stage.setDeadline(request.getDeadline());
        }

        return toDto(stageRepository.save(stage));
    }

    private void validateStagePermissions(Project project, User user, String action) {
        if (project.getIsGroupBased()) {
            List<TeamMember> adminMembers = teamMemberRepository.findTeamAdmins(project.getTeam().getId());
            boolean isCurrentUserAdmin = adminMembers.stream()
                    .anyMatch(member -> member.getUser().getId().equals(user.getId()));

            if (!isCurrentUserAdmin) {
                throw new ProjectAccessDeniedException("Solo los administradores del equipo pueden " + action + " una fase para este proyecto.");
            }
        } else {
            if (project.getUserOwner() == null || !project.getUserOwner().getId().equals(user.getId())) {
                throw new ProjectAccessDeniedException("No tienes permiso para " + action + " una fase en este proyecto personal.");
            }
        }
    }

    private StageDTO toDto(Stage stage) {
        return StageDTO.builder()
                .id(stage.getId())
                .name(stage.getName())
                .description(stage.getDescription())
                .colour(stage.getColour())
                .deadline(stage.getDeadline())
                .templeLoggedMinutes(stage.getTempleLoggedMinutes())
                .totalLoggedMinutes(stage.getTotalLoggedMinutes())
                .logo(stage.getProject().getLogoUrl())
                .build();
    }
}
