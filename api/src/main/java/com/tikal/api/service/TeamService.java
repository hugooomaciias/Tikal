package com.tikal.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tikal.api.model.dto.TeamDTO;
import com.tikal.api.model.dto.TeamMemberDTO;
import com.tikal.api.model.entity.Team;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.TeamMemberRepository;
import com.tikal.api.repository.TeamRepository;
import com.tikal.api.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service responsible for managing team-related operations in the application:
 * - Creating teams with hierarchical structure (max 3 levels: department > team > subteam)
 * - Managing team members and invitations
 * - Adding users to teams using invitation codes
 * - Managing team administrators
 * - Validating team hierarchy levels
 */
@Service
public class TeamService {
    @Autowired
    private TeamRepository teamRepo;
    
    @Autowired
    private TeamMemberRepository teamMemberRepo;
    
    @Autowired
    private UserRepository userRepo;
    
    /* ===== TEAM CREATION AND MANAGEMENT ===== */
    
    /**
     * Creates a new team with an auto-generated invitation code
     * @param team The team entity to create
     * @return The saved team with generated invitation code
     */
    public Team createTeam(Team team) {
        // Generate a unique invitation code if not provided
        if (team.getInvitationCode() == null || team.getInvitationCode().isEmpty()) {
            team.setInvitationCode(generateInvitationCode());
        }
        return teamRepo.save(team);
    }
    
    /**
     * Creates a subteam under an existing parent team
     * Validates that we don't exceed the 3-level hierarchy (department > team > subteam)
     * @param subteam The subteam to create
     * @param parentTeamId The ID of the parent team
     * @return The saved subteam, or null if hierarchy validation fails
     */
    public Team createSubteam(Team subteam, Integer parentTeamId) {
        Optional<Team> parentTeam = teamRepo.findById(parentTeamId);
        
        if (parentTeam.isEmpty()) {
            return null; // Parent team not found
        }
        
        Team parent = parentTeam.get();
        
        // Validate hierarchy level (max 3 levels)
        if (!isValidHierarchyLevel(parent)) {
            return null; // Cannot create more levels
        }
        
        subteam.setParentTeam(parent);
        
        if (subteam.getInvitationCode() == null || subteam.getInvitationCode().isEmpty()) {
            subteam.setInvitationCode(generateInvitationCode());
        }
        
        return teamRepo.save(subteam);
    }
    
    /**
     * Validates if a team can have a subteam (max 3 levels hierarchy)
     * @param parentTeam The parent team to validate
     * @return true if a subteam can be created, false otherwise
     */
    private boolean isValidHierarchyLevel(Team parentTeam) {
        int level = 1;
        Team current = parentTeam;
        
        // Count the level by traversing up the hierarchy
        while (current.getParentTeam() != null) {
            level++;
            current = current.getParentTeam();
        }
        
        // Return true if we haven't reached 3 levels yet
        return level < 3;
    }
    
    /**
     * Generates a unique 8-character invitation code
     * @return A unique invitation code
     */
    private String generateInvitationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Gets a team by ID
     * @param teamId The ID of the team
     * @return The team if found, empty Optional otherwise
     */
    public Optional<Team> getTeamById(Integer teamId) {
        return teamRepo.findById(teamId);
    }
    
    /**
     * Gets a team by invitation code
     * @param invitationCode The invitation code
     * @return The team if found, empty Optional otherwise
     */
    public Optional<Team> getTeamByInvitationCode(String invitationCode) {
        return teamRepo.findByInvitationCode(invitationCode);
    }
    
    /**
     * Gets all subteams of a parent team
     * @param parentTeamId The ID of the parent team
     * @return List of subteams
     */
    public List<Team> getSubteams(Integer parentTeamId) {
        return teamRepo.findByParentTeam_Id(parentTeamId);
    }
    
    /**
     * Searches teams by name
     * @param name The name to search for
     * @return List of teams matching the search
     */
    public List<Team> searchTeamsByName(String name) {
        return teamRepo.findByNameContainingIgnoreCase(name);
    }
    
    /**
     * Updates an existing team
     * @param teamId The ID of the team to update
     * @param team The updated team data
     * @return The updated team
     */
    public Team updateTeam(Integer teamId, Team team) {
        team.setId(teamId);
        return teamRepo.save(team);
    }
    
    /**
     * Regenerates the invitation code for a team
     * @param teamId The ID of the team
     * @return The team with the new invitation code, or null if team not found
     */
    public Team regenerateInvitationCode(Integer teamId) {
        Optional<Team> team = teamRepo.findById(teamId);
        
        if (team.isPresent()) {
            Team t = team.get();
            t.setInvitationCode(generateInvitationCode());
            return teamRepo.save(t);
        }
        
        return null;
    }
    
    /**
     * Deletes a team
     * @param teamId The ID of the team to delete
     */
    public void deleteTeam(Integer teamId) {
        teamRepo.deleteById(teamId);
    }

    /* ===== TEAM MEMBER MANAGEMENT ===== */
    
    /**
     * Adds a user to a team using an invitation code
     * @param userId The ID of the user to add
     * @param invitationCode The team's invitation code
     * @param isAdmin Whether the user should be added as admin
     * @return The created Team_Member, or null if team or user not found
     */
    public TeamMember addUserToTeamByCode(Integer userId, String invitationCode, Boolean isAdmin) {
        Optional<Team> team = teamRepo.findByInvitationCode(invitationCode);
        Optional<User> user = userRepo.findById(userId);
        
        if (team.isEmpty() || user.isEmpty()) {
            return null; // Team or user not found
        }
        
        // We need to get the actual Team entity, not just the DTO
        // Since the repository returns DTO, we need to find the team another way
        // Let's search all teams and find the one with this code
        List<Team> allTeams = teamRepo.findAll();
        Team targetTeam = null;
        
        for (Team t : allTeams) {
            if (t.getInvitationCode().equals(invitationCode)) {
                targetTeam = t;
                break;
            }
        }
        
        if (targetTeam == null) {
            return null;
        }
        
        return addUserToTeam(userId, targetTeam.getId(), isAdmin);
    }
    
    /**
     * Adds a user to a team directly
     * @param userId The ID of the user to add
     * @param teamId The ID of the team
     * @param isAdmin Whether the user should be added as admin
     * @return The created Team_Member, or null if team or user not found
     */
    public TeamMember addUserToTeam(Integer userId, Integer teamId, Boolean isAdmin) {
        Optional<User> user = userRepo.findById(userId);
        Optional<Team> team = teamRepo.findById(teamId);
        
        if (user.isEmpty() || team.isEmpty()) {
            return null; // User or team not found
        }
        
        TeamMember member = new TeamMember();
        member.setUser(user.get());
        member.setTeam(team.get());
        member.setIsAdmin(isAdmin != null ? isAdmin : false);
        
        return teamMemberRepo.save(member);
    }
    
    /**
     * Removes a user from a team
     * @param userId The ID of the user
     * @param teamId The ID of the team
     */
    public void removeUserFromTeam(Integer userId, Integer teamId) {
        List<TeamMember> members = teamMemberRepo.findAll();
        
        for (TeamMember member : members) {
            if (member.getUser().getId().equals(userId) && member.getTeam().getId().equals(teamId)) {
                teamMemberRepo.deleteById(member.getId());
                break;
            }
        }
    }
    
    /**
     * Gets all members of a team
     * @param teamId The ID of the team
     * @return List of team members with their information
     */
    public List<TeamMember> getTeamMembers(Integer teamId) {
        return teamMemberRepo.findTeamMembers(teamId);
    }
    
    /**
     * Gets all administrators of a team
     * @param teamId The ID of the team
     * @return List of team administrators
     */
    public List<TeamMember> getTeamAdmins(Integer teamId) {
        return teamMemberRepo.findTeamAdmins(teamId);
    }
    
    /**
     * Promotes a team member to administrator
     * @param userId The ID of the user
     * @param teamId The ID of the team
     * @return The updated Team_Member, or null if not found
     */
    public TeamMember promoteToAdmin(Integer userId, Integer teamId) {
        List<TeamMember> members = teamMemberRepo.findAll();
        
        for (TeamMember member : members) {
            if (member.getUser().getId().equals(userId) && member.getTeam().getId().equals(teamId)) {
                member.setIsAdmin(true);
                return teamMemberRepo.save(member);
            }
        }
        
        return null;
    }
    
    /**
     * Demotes a team administrator to regular member
     * @param userId The ID of the user
     * @param teamId The ID of the team
     * @return The updated Team_Member, or null if not found
     */
    public TeamMember demoteFromAdmin(Integer userId, Integer teamId) {
        List<TeamMember> members = teamMemberRepo.findAll();
        
        for (TeamMember member : members) {
            if (member.getUser().getId().equals(userId) && member.getTeam().getId().equals(teamId)) {
                member.setIsAdmin(false);
                return teamMemberRepo.save(member);
            }
        }
        
        return null;
    }
    
    /**
     * Checks if a user is a member of a team
     * @param userId The ID of the user
     * @param teamId The ID of the team
     * @return true if user is a team member, false otherwise
     */
    public boolean isTeamMember(Integer userId, Integer teamId) {
        List<TeamMember> members = teamMemberRepo.findAll();
        
        for (TeamMember member : members) {
            if (member.getUser().getId().equals(userId) && member.getTeam().getId().equals(teamId)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Checks if a user is an administrator of a team
     * @param userId The ID of the user
     * @param teamId The ID of the team
     * @return true if user is a team admin, false otherwise
     */
    public boolean isTeamAdmin(Integer userId, Integer teamId) {
        List<TeamMember> members = teamMemberRepo.findAll();
        
        for (TeamMember member : members) {
            if (member.getUser().getId().equals(userId) && member.getTeam().getId().equals(teamId) && member.getIsAdmin()) {
                return true;
            }
        }
        
        return false;
    }
}
