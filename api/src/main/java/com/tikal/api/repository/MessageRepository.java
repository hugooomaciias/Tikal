package com.tikal.api.repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    /* --- Get the messages of a direct conversation (direct messages) --- */
    @Query("SELECT m FROM Message m WHERE " +
           "(m.emitter.id = :myId AND m.receiver.id = :otherUserId) OR " +
           "(m.emitter.id = :otherUserId AND m.receiver.id = :myId) " +
           "ORDER BY m.sendDate ASC")
    List<Message> findChatHistory1to1(@Param("myId") Integer myId, 
                                      @Param("otherUserId") Integer otherUserId);

    /* --- Get the number of unread messages from a specific user --- */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.receiver.id = :myId AND m.emitter.id = :senderId AND m.isRead = false")
    Long countUnreadMessagesFromUser(@Param("myId") Integer myId, 
                                     @Param("senderId") Integer senderId);
    
    /* --- Get the messages sent and received from a group (group messages) --- */
    List<Message> findByTargetTeamIdOrderBySendDateAsc(Integer teamId);

    /* --- Get the number of messages not read from a group --- */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.targetTeam.id = :teamId AND m.sendDate > :lastReadDate")
    Long countUnreadTeamMessages(@Param("teamId") Integer teamId, 
                                 @Param("lastReadDate") Instant lastReadDate);

    /* --- Get the last messages received from everyone ordered (dashboard chat) --- */
    @Query("SELECT m FROM Message m WHERE " +
           "m.id IN (SELECT MAX(m2.id) FROM Message m2 " +
           "         WHERE (m2.emitter.id = :myId OR m2.receiver.id = :myId) " +
           "         AND m2.targetTeam IS NULL " +
           "         GROUP BY CASE WHEN m2.emitter.id = :myId THEN m2.receiver.id ELSE m2.emitter.id END) " +
           "ORDER BY m.sendDate DESC")
    List<Message> findLatestDirectMessagesPerConversation(@Param("myId") Integer myId);

    /* --- Get the last messages received from all the teams ordered (dashboard chat) --- */
    @Query("SELECT m FROM Message m WHERE " +
           "m.id IN (SELECT MAX(m2.id) FROM Message m2 " +
           "         WHERE m2.targetTeam.id IN :myTeamIds " +
           "         GROUP BY m2.targetTeam.id) " +
           "ORDER BY m.sendDate DESC")
    List<Message> findLatestTeamMessages(@Param("myTeamIds") List<Integer> myTeamIds);

    @Query(value =
            "SELECT " +
                    "  CASE WHEN emitter_id = :myId THEN receiver_id ELSE emitter_id END AS partner_id " +
                    "FROM message " +
                    "WHERE emitter_id = :myId OR receiver_id = :myId " +
                    "GROUP BY partner_id " +
                    "ORDER BY " +
                    "  SUM(CASE WHEN receiver_id = :myId AND is_read = false THEN 1 ELSE 0 END) DESC, " +
                    "  MAX(send_date) DESC",
            nativeQuery = true)
    List<Integer> findAllConversationPartners(@Param("myId") Integer myId);

    /* --- Get the paginated messages from a team --- */
    Page<Message> findByTargetTeamIdOrderBySendDateDesc(Integer teamId, Pageable pageable);

    /* --- Get just the absolute last message from a team --- */
    Message findTopByTargetTeamIdOrderBySendDateDesc(Integer teamId);

    /* --- Get the paginated direct messages between two users --- */
    @Query("SELECT m FROM Message m WHERE " +
            "(m.emitter.id = :myId AND m.receiver.id = :otherUserId) OR " +
            "(m.emitter.id = :otherUserId AND m.receiver.id = :myId) " +
            "ORDER BY m.sendDate DESC")
    Page<Message> findChatHistory1to1Paginated(@Param("myId") Integer myId,
                                               @Param("otherUserId") Integer otherUserId,
                                               Pageable pageable);

    /* --- Get only the absolute last direct message between two users --- */
    @Query(value = "SELECT * FROM messages WHERE " +
            "(emitter_id = :myId AND receiver_id = :otherUserId) OR " +
            "(emitter_id = :otherUserId AND receiver_id = :myId) " +
            "ORDER BY send_date DESC LIMIT 1",
            nativeQuery = true)
    Message findTopDirectMessageBetween(@Param("myId") Integer myId,
                                        @Param("otherUserId") Integer otherUserId);

    /* --- Find out if there are any unread team messages --- */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.targetTeam.id = :teamId AND m.sendDate > :lastReadDate")
    Long countUnreadMessagesForTeam(
            @Param("teamId") Integer teamId,
            @Param("lastReadDate") Instant lastReadDate);
}
