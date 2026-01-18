package com.tikal.api.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tikal.api.model.dto.TeamMemberDTO;

@Repository
public interface TeamMemberRepository extends JpaRepository<Team_Member, Integer> {
    @Query("SELECT new com.tikal.api.model.dto.TeamMemberDTO(u.name, u.avatarUrl, m.admin) " +
           "FROM TeamMember m " +
           "JOIN m.user u " +
           "WHERE m.team.id = :teamId")
    List<TeamMemberDTO> findMiembrosDeEquipo(@Param("teamId") Integer teamId);
}
