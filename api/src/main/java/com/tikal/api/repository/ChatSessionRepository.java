package com.tikal.api.repository;

import com.tikal.api.model.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
    /* --- Obtain all the season of the user, chronologically order --- */
    List<ChatSession> findByUser_IdOrderByUpdatedAtDesc(Integer userId);

    /* --- Search a specific session ensuring that it belongs to the user  --- */
    Optional<ChatSession> findByIdAndUser_Id(Integer sessionId, Integer userId);
}
