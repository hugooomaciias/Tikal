package com.tikal.api.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    /* --- Obtain the messages of a direct conversation (direct messages) --- */
    @Query("SELECT m FROM Message m WHERE " +
           "(m.emitter.id = :myId AND m.receiver.id = :otherUserId) OR " +
           "(m.emitter.id = :otherUserId AND m.receiver.id = :myId) " +
           "ORDER BY m.sendDate ASC")
    List<Message> findChatHistory1to1(@Param("myId") Integer myId, 
                                      @Param("otherUserId") Integer otherUserId);

    /* --- Obtain the number of unread messages recived from a specific user --- */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.receiver.id = :myId AND m.emitter.id = :senderId AND m.isRead = false")
    Long countUnreadMessagesFromUser(@Param("myId") Integer myId, 
                                     @Param("senderId") Integer senderId);
    
    /* --- Obtain the messages sended to a group (group messages) --- */
    List<Message> findByTargetTeamIdOrderBySendDateAsc(Integer teamId);

    /* --- Obtain the number of messages not read from a group --- */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.targetTeam.id = :teamId AND m.sendDate > :lastReadDate")
    Long countUnreadTeamMessages(@Param("teamId") Integer teamId, 
                                 @Param("lastReadDate") LocalDateTime lastReadDate);

    /* --- Obtain the last messages recived from everyone ordered (dashboard chat) --- */
    @Query("SELECT m FROM Message m WHERE " +
           "m.id IN (SELECT MAX(m2.id) FROM Message m2 " +
           "         WHERE (m2.emitter.id = :myId OR m2.receiver.id = :myId) " +
           "         AND m2.targetTeam IS NULL " +
           "         GROUP BY CASE WHEN m2.emitter.id = :myId THEN m2.receiver.id ELSE m2.emitter.id END) " +
           "ORDER BY m.sendDate DESC")
    List<Message> findLatestDirectMessagesPerConversation(@Param("myId") Integer myId);

    /* --- Obtain the last messages recived from all the teams ordered (dashboard chat) --- */
    @Query("SELECT m FROM Message m WHERE " +
           "m.id IN (SELECT MAX(m2.id) FROM Message m2 " +
           "         WHERE m2.targetTeam.id IN :myTeamIds " +
           "         GROUP BY m2.targetTeam.id) " +
           "ORDER BY m.sendDate DESC")
    List<Message> findLatestTeamMessages(@Param("myTeamIds") List<Integer> myTeamIds);
}
