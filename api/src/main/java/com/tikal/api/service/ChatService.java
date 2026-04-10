package com.tikal.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tikal.api.model.entity.Message;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.repository.MessageRepository;
import com.tikal.api.repository.TeamMemberRepository;
import com.tikal.api.repository.UserRepository;
import com.tikal.api.repository.TeamRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing chat and messaging functionality
 * Handles direct messaging between users and team/group chat communications
 */
@Service
public class ChatService {
    @Autowired
    private MessageRepository messageRepo;

    @Autowired
    private TeamMemberRepository teamMemberRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private TeamRepository teamRepo;

    /* --- Send Messages --- */

    /**
     * Sends a direct message from one user to another
     *
     * @param emitterId the ID of the user sending the message
     * @param receiverId the ID of the user receiving the message
     * @param content the content of the message
     * @return the saved Message object
     */
    public Message sendDirectMessage(Integer emitterId, Integer receiverId, String content) {
        Message message = new Message();
        message.setEmitter(userRepo.findById(emitterId).orElseThrow());
        message.setReceiver(userRepo.findById(receiverId).orElseThrow());
        message.setContent(content);
        message.setIsRead(false);
        return messageRepo.save(message);
    }

    /**
     * Sends a message to a team/group chat
     *
     * @param emitterId the ID of the user sending the message
     * @param teamId the ID of the team/group to receive the message
     * @param content the content of the message
     * @return the saved Message object
     */
    public Message sendTeamMessage(Integer emitterId, Integer teamId, String content) {
        Message message = new Message();
        message.setEmitter(userRepo.findById(emitterId).orElseThrow());
        message.setTargetTeam(teamRepo.findById(teamId).orElseThrow());
        message.setContent(content);
        message.setIsRead(false);
        return messageRepo.save(message);
    }

    /**
     * Retrieves the complete chat history between two users (1-to-1 conversation)
     *
     * @param myId the ID of the current user
     * @param otherUserId the ID of the other user
     * @return a list of messages ordered by send date
     */
    public List<Message> getDirectChatHistory(Integer myId, Integer otherUserId) {
        return messageRepo.findChatHistory1to1(myId, otherUserId);
    }

    /**
     * Retrieves all messages from a team/group chat
     *
     * @param teamId the ID of the team
     * @return a list of messages ordered by send date
     */
    public List<Message> getTeamChatHistory(Integer teamId) {
        return messageRepo.findByTargetTeamIdOrderBySendDateAsc(teamId);
    }

    /**
     * Marks a single message as read
     *
     * @param messageId the ID of the message to mark as read
     * @return the updated Message object, or null if message not found
     */
    public Message markMessageAsRead(Integer messageId) {
        Optional<Message> messageOpt = messageRepo.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setIsRead(true);
            return messageRepo.save(message);
        }
        return null;
    }

    /**
     * Marks all messages in a 1-to-1 conversation as read
     *
     * @param myId the ID of the current user
     * @param otherUserId the ID of the other user
     */
    public void markConversationAsRead(Integer myId, Integer otherUserId) {
        List<Message> messages = messageRepo.findChatHistory1to1(myId, otherUserId);
        for (Message message : messages) {
            if (!message.getIsRead() && message.getReceiver().getId().equals(myId)) {
                message.setIsRead(true);
                messageRepo.save(message);
            }
        }
    }

    /* --- Unread Message Counts --- */

    /**
     * Gets the total count of unread messages from all direct conversations and team chats
     *
     * @param myId the ID of the current user
     * @return the total count of unread messages
     */
    public Long getTotalUnreadMessagesCount(Integer myId) {
        Long totalUnread = 0L;

        List<Integer> conversationPartners = messageRepo.findAllConversationPartners(myId);
        for (Integer partnerId : conversationPartners) {
            totalUnread += getUnreadMessageCountFromUser(myId, partnerId);
        }

        List<TeamMember> myTeams = teamMemberRepo.findByUserId(myId);
        for (TeamMember t : myTeams) {
            totalUnread += getUnreadTeamMessageCount(t.getId(), t.getLastReadDate());
        }

        return totalUnread;
    }

    /**
     * Gets the count of unread messages from a specific user
     *
     * @param myId the ID of the current user
     * @param senderId the ID of the user who sent the messages
     * @return the count of unread messages
     */
    public Long getUnreadMessageCountFromUser(Integer myId, Integer senderId) {
        return messageRepo.countUnreadMessagesFromUser(myId, senderId);
    }

    /**
     * Gets the count of unread messages from a team chat
     *
     * @param teamId the ID of the team
     * @param lastReadDate the date after which to count unread messages
     * @return the count of unread messages
     */
    public Long getUnreadTeamMessageCount(Integer teamId, LocalDateTime lastReadDate) {
        return messageRepo.countUnreadTeamMessages(teamId, lastReadDate);
    }

    /**
     * Retrieves the latest messages from all 1-to-1 conversations for dashboard display
     *
     * @param myId the ID of the current user
     * @return a list of the most recent direct messages per conversation
     */
    public List<Message> getLatestDirectMessages(Integer myId) {
        return messageRepo.findLatestDirectMessagesPerConversation(myId);
    }

    /**
     * Retrieves the latest messages from all team chats for dashboard display
     *
     * @param myTeamIds the list of team IDs the user belongs to
     * @return a list of the most recent messages per team
     */
    public List<Message> getLatestTeamMessages(List<Integer> myTeamIds) {
        return messageRepo.findLatestTeamMessages(myTeamIds);
    }

    /**
     * Deletes a message by its ID
     *
     * @param messageId the ID of the message to delete
     * @return true if the message was deleted, false if it doesn't exist
     */
    public boolean deleteMessage(Integer messageId) {
        if (messageRepo.existsById(messageId)) {
            messageRepo.deleteById(messageId);
            return true;
        }
        return false;
    }
}
