package com.tikal.api.repository;

import com.tikal.api.model.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    /* --- Obtain all the messages chronologically order by season--- */
    List<ChatMessage> findBySession_IdOrderByCreatedAtAsc(Integer sessionId);

    /* --- Obtain the last 10 messages chronologically order by season--- */
    List<ChatMessage> findTop10BySession_IdOrderByCreatedAtDesc(Integer sessionId);

    Page<ChatMessage> findBySession_IdOrderByCreatedAtDesc(Integer sessionId, Pageable pageable);
}
