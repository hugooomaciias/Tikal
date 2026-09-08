    package com.tikal.api.service;

import com.tikal.api.exception.BadRequestException;
import com.tikal.api.exception.ForbiddenAccessException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.exception.UnauthorizedException;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.team.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tikal.api.model.entity.Team;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.TeamMemberRepository;
import com.tikal.api.repository.TeamRepository;
import com.tikal.api.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service responsible for managing team-related operations in the application:
 * - Creating teams with hierarchical structure (max 3 levels: department > team > subteam)
 * - Managing team members and invitations
 * - Adding users to teams using invitation codes
 * - Managing team administrators
 * - Validating team hierarchy levels
 */
@Service
@RequiredArgsConstructor
public class TeamService {
    @Autowired
    private TeamRepository teamRepo;
    
    @Autowired
    private TeamMemberRepository teamMemberRepo;
    
    @Autowired
    private UserRepository userRepo;

    private final ImageUploadService imageUploadService;
    
    /* ===== TEAM CREATION AND MANAGEMENT ===== */

    // CREATE A TEAM
    @Transactional
    public TeamDTO createTeam(User user, CreateTeamRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setImageUrl(team.getDefaultImageUrl());
        team.setInvitationCode(generateUniqueInvitationCode());
        Team savedTeam = teamRepo.save(team);

        TeamMember adminMember = new TeamMember();
        adminMember.setUser(user);
        adminMember.setTeam(savedTeam);
        adminMember.setIsAdmin(true);
        TeamMember savedMember = teamMemberRepo.save(adminMember);

        return mapToDTO(savedTeam, savedMember);
    }

    // JOIN A TEAM
    @Transactional
    public TeamDTO joinTeamWithCode(User user, String code) {
        Team team = teamRepo.findByInvitationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Código de invitación inválido."));

        if (teamMemberRepo.existsByUserIdAndTeamId(user.getId(), team.getId())) {
            throw new BadRequestException("Ya perteneces a este equipo.");
        }

        TeamMember newMember = new TeamMember();
        newMember.setUser(user);
        newMember.setTeam(team);
        newMember.setIsAdmin(false);
        TeamMember savedMember = teamMemberRepo.save(newMember);

        return mapToDTO(team, savedMember);
    }

    // CODE REGENERATION
    @Transactional
    public JoinTeamRequest regenerateCode(Integer myId, Integer teamId) {
        TeamMember member = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario no pertenece al equipo que intenta acceder"));

        if (!member.getIsAdmin()) {
            throw new ForbiddenAccessException("Solo los administradores pueden regenerar el código del equipo.");
        }

        Team team = member.getTeam();
        String newCode = generateUniqueInvitationCode();
        team.setInvitationCode(newCode);
        teamRepo.save(team);

        return JoinTeamRequest.builder().code(newCode).build();
    }

    // TEAM ACTUALIZATION
    @Transactional
    public TeamDTO updateTeam(Integer myId, Integer teamId, UpdateTeamRequest request) {
        TeamMember member = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario no pertenece al equipo que intenta acceder"));

        if (!member.getIsAdmin()) {
            throw new ForbiddenAccessException("Solo los administradores pueden editar el equipo.");
        }

        Team team = member.getTeam();
        team.setName(request.getName());
        Team savedTeam = teamRepo.save(team);

        return mapToDTO(savedTeam, member);
    }

    // LEAVE A TEAM
    @Transactional
    public void leaveTeam(Integer myId, Integer teamId) {
        TeamMember member = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new BadRequestException("No perteneces a este equipo."));

        if (!member.getIsAdmin()) {
            teamMemberRepo.delete(member);
            return;
        }

        long totalMembers = teamMemberRepo.countByTeamId(teamId);
        long totalAdmins = teamMemberRepo.countByTeamIdAndIsAdminTrue(teamId);

        if (totalAdmins == 1 && totalMembers > 1) {
            throw new BadRequestException("Eres el último administrador. Debes promover a otro miembro antes de salir.");
        }

        if (totalAdmins == 1 && totalMembers == 1) {
            teamRepo.delete(member.getTeam());
        } else {
            teamMemberRepo.delete(member);
        }
    }

    // SEARCH THE TEAMS
    public List<TeamDTO> searchTeams(User user, Boolean isAdmin) {
        List<TeamMember> members = teamMemberRepo.findByUserId(user.getId());

        return members.stream()
                .filter(member -> {
                    // Only apply the admin filter if the parameter is EXPLICITLY true
                    if (Boolean.TRUE.equals(isAdmin)) {
                        return Boolean.TRUE.equals(member.getIsAdmin());
                    }
                    // If isAdmin is null OR false -> return ALL teams (no filter)
                    return true;
                })
                .map(member -> mapToDTO(member.getTeam(), member))
                .collect(Collectors.toList());
    }

    // CHANGE TEAM IMAGE
    @Transactional
    public TeamDTO updateTeamImage(Integer myId, Integer teamId, MultipartFile file) {
        TeamMember member = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new BadRequestException("No perteneces a este equipo."));

        if (!member.getIsAdmin()) {
            throw new ForbiddenAccessException("Solo los administradores pueden cambiar la imagen del equipo.");
        }

        Team team = member.getTeam();

        if (file != null && !file.isEmpty()) {
            String imageUrl = imageUploadService.uploadImage(file);
            team.setImageUrl(imageUrl);
        } else {
            team.setImageUrl(team.getDefaultImageUrl());
        }

        Team savedTeam = teamRepo.save(team);
        return mapToDTO(savedTeam, member);
    }

    // UPDATE THE ADMIN STATUS
    @Transactional
    public void updateAdminStatus(Integer myId, Integer teamId, Integer targetUserId, Boolean isAdmin) {
        // The admin can't demote themselves
        if (myId.equals(targetUserId) && !isAdmin) {
            throw new BadRequestException("No puedes revocar tus propios permisos de administrador.");
        }

        TeamMember executor = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new UnauthorizedException("No perteneces a este equipo."));

        if (!executor.getIsAdmin()) {
            throw new ForbiddenAccessException("Solo los administradores pueden cambiar los privilegios.");
        }

        TeamMember targetMember = teamMemberRepo.findByUserIdAndTeamId(targetUserId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario no pertenece al equipo."));

        targetMember.setIsAdmin(isAdmin);
        teamMemberRepo.save(targetMember);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberDTO> getTeamMembers(Integer myId, Integer teamId, String search) {
        if (!teamMemberRepo.existsByUserIdAndTeamId(myId, teamId)) {
            throw new UnauthorizedException("No tienes permiso para ver los miembros de este equipo.");
        }

        List<TeamMember> members = teamMemberRepo.findByTeamId(teamId);

        return members.stream()
                .filter(member -> search == null || search.trim().isEmpty() ||
                        member.getUser().getName().toLowerCase().contains(search.toLowerCase()))
                .map(member -> new TeamMemberDTO(
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getUser().getAvatarUrl(),
                        member.getIsAdmin(),
                        member.getTeamRole(),
                        member.getUser().getId() == myId
                ))
                .toList();
    }

    @Transactional
    public void kickMember(Integer myId, Integer teamId, Integer targetUserId) {
        if (myId.equals(targetUserId)) {
            throw new BadRequestException("No puedes expulsarte a ti mismo por esta vía. Utiliza la opción de abandonar equipo.");
        }

        TeamMember executor = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new UnauthorizedException("No perteneces a este equipo."));

        if (!executor.getIsAdmin()) {
            throw new ForbiddenAccessException("Solo los administradores pueden expulsar miembros.");
        }

        TeamMember targetMember = teamMemberRepo.findByUserIdAndTeamId(targetUserId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario a expulsar no pertenece al equipo."));

        teamMemberRepo.delete(targetMember);
    }

    @Transactional
    public void updateTeamRole(Integer myId, Integer teamId, Integer targetUserId, String newRole) {
        TeamMember executor = teamMemberRepo.findByUserIdAndTeamId(myId, teamId)
                .orElseThrow(() -> new UnauthorizedException("No perteneces a este equipo."));

        if (!myId.equals(targetUserId) && !executor.getIsAdmin()) {
            throw new ForbiddenAccessException("No tienes permisos para editar el rol de este miembro.");
        }

        TeamMember targetMember;
        if (myId.equals(targetUserId)) {
            targetMember = executor;
        } else {
            targetMember = teamMemberRepo.findByUserIdAndTeamId(targetUserId, teamId)
                    .orElseThrow(() -> new ResourceNotFoundException("El usuario objetivo no pertenece al equipo."));
        }

        targetMember.setTeamRole(newRole);
        teamMemberRepo.save(targetMember);
    }

    // --- SECURE CODE GENERATOR ---
    private String generateUniqueInvitationCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (teamRepo.existsByInvitationCode(code));
        return code;
    }

    // --- MAPPER ---
    private TeamDTO mapToDTO(Team team, TeamMember member) {
        return new TeamDTO(
                team.getId(),
                team.getName(),
                team.getInvitationCode(),
                team.getImageUrl(),
                member != null ? member.getIsAdmin() : false,
                member != null ? member.getTeamRole() : null,
                teamMemberRepo.countByTeamId(team.getId())
        );
    }
}
