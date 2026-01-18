package com.tikal.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    /* --- Obtain the team with a determinated invitation code --- */
    Optional<TeamDTO> findByInvitationCode(String invitationCode);
}
