package com.tikal.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.TeamMember;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {
    /* --- Obtain all members of a team with their name, avatar and admin status --- */
    @Query("SELECT m " +
           "FROM TeamMember m " +
           "JOIN m.user u " +
           "WHERE m.team.id = :teamId")
    List<TeamMember> findTeamMembers(@Param("teamId") Integer teamId);

    /* --- Obtain the administrators of a team --- */
    @Query("SELECT m " +
           "FROM TeamMember m " +
           "JOIN m.user u " +
           "WHERE m.team.id = :teamId AND m.isAdmin = true")
    List<TeamMember> findTeamAdmins(@Param("teamId") Integer teamId);

    /* --- Obtain the team memberships of a user --- */
    List<TeamMember> findByUserId(Integer myId);

    /* --- Obtain a team membership of a specific user in a specific team --- */
    Optional<TeamMember> findByUserIdAndTeamId(Integer userId, Integer teamId);

    /* --- Check if a user already belongs to a team --- */
    boolean existsByUserIdAndTeamId(Integer userId, Integer teamId);

    /* --- Count how many members a team has --- */
    long countByTeamId(Integer teamId);

    /* --- Count how many administrators a team has --- */
    long countByTeamIdAndIsAdminTrue(Integer teamId);

    /* --- Find the team members that are in the team that has the teamId --- */
    List<TeamMember> findByTeamId(Integer teamId);

    /* --- Get the Team Member Ranking by Total Minutes --- */
    @Query("SELECT tm.user.id, tm.user.name, tm.teamRole, tm.user.avatarUrl, " +
            "(SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, tl.initDateTime, tl.endDateTime)), 0) " +
            " FROM TimeLog tl " +
            " WHERE tl.user.id = tm.user.id " +
            " AND tl.endDateTime IS NOT NULL " +
            " AND (tl.task.stage.project.team.id = :teamId " +
            "      OR tl.stage.project.team.id = :teamId " +
            "      OR tl.project.team.id = :teamId)) as score " +
            "FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId " +
            "ORDER BY score DESC")
    List<Object[]> getTeamRankingByTempleMinutes(@Param("teamId") Integer teamId);
}
