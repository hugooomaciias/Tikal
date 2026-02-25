package com.tikal.api.repository;

import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.dto.TeamMemberDTO;
import com.tikal.api.model.entity.TeamMember;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {
    @Query("SELECT new com.tikal.api.model.dto.TeamMemberDTO(u.name, u.avatarUrl, m.isAdmin) " +
           "FROM TeamMember m " +
           "JOIN m.user u " +
           "WHERE m.team.id = :teamId")
    List<TeamMemberDTO> findTeamMembers(@Param("teamId") Integer teamId);

    @Query("SELECT new com.tikal.api.model.dto.TeamMemberDTO(u.name, u.avatarUrl, m.isAdmin) " +
           "FROM TeamMember m " +
           "JOIN m.user u " +
           "WHERE m.team.id = :teamId AND m.isAdmin = true")
    List<TeamMemberDTO> findTeamAdmins(@Param("teamId") Integer teamId);

    List<TeamMember> findTeamMembersByUserId(Integer myId);
}
