package com.tikal.api.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.dto.TeamDTO;
import com.tikal.api.model.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    /* --- Obtain the team with a determined invitation code --- */
    Optional<Team> findByInvitationCode(String invitationCode);

    /* --- Obtain the teams with a determined parent --- */
    List<Team> findByParentTeam_Id(Integer parentId);

    /* --- Obtain the teams with a name similar to 'name' --- */
    List<Team> findByNameContainingIgnoreCase(String name);
}
