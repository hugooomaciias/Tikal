package com.tikal.api.service;

import com.tikal.api.exception.ForbiddenAccessException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.model.dto.ai.AiMessageDTO;
import com.tikal.api.model.dto.ai.AiNewChatResponse;
import com.tikal.api.model.dto.ai.AiSessionDTO;
import com.tikal.api.model.entity.ChatMessage;
import com.tikal.api.model.entity.ChatSession;
import com.tikal.api.model.entity.User;
import com.tikal.api.model.entity.enumerated.ChatRole;
import com.tikal.api.repository.ChatMessageRepository;
import com.tikal.api.repository.ChatSessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class AiAdvisorService {

    private final UserService userService;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatClient chatClient;

    public AiAdvisorService(ChatSessionRepository sessionRepository,
                            ChatMessageRepository messageRepository,
                            UserService userService,
                            ChatClient.Builder chatClientBuilder) {

        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;

        // Construimos el ChatClient aquí mismo usando el Builder inyectado
        this.chatClient = chatClientBuilder
                .defaultToolNames(
                        "getUserStatistics",
                        "getPendingTasksOverview",
                        "getGamificationStatus",
                        "getRecentTimeLogsOverview"
                )
                .build();
    }

    private static final String SYSTEM_PROMPT = """
        Eres el asistente virtual de Tikal, un gestor de tiempo y productividad gamificado.
        Tu tono es profesional, directo, motivador y actúas como un Project Manager Senior y Coach.
        
        Reglas de negocio estrictas de Tikal:
        1. Jerarquía: Proyecto > Fase > Tarea > Subtarea. No sugieras otras estructuras. Evita abusar de las subtareas porque no soportan estadísticas (no tienen tiempo estimado, deadline ni ganancias).
        2. Atributos: Solo las Tareas tienen tiempo estimado, deadline, ganancias estimadas y tiempo dedicado. Los Proyectos y Fases tienen deadline, descripción y tiempo dedicado (calculado a partir de sus hijos).
        3. Efectividad Global: Mide el ratio entre el tiempo dedicado y el tiempo estimado. Si tardas menos o igual a lo estimado, es 100%. Si tardas más, el porcentaje baja gradualmente.
        4. Precisión de Planificación: Mide qué tan exactas son las estimaciones con un margen de tolerancia del 15% al subestimar (underrun).
        5. Prioriza siempre ayudar al usuario a maximizar su rentabilidad (profit) y cumplir sus deadlines.
        6. LÍMITE DE DOMINIO: Eres exclusivamente un asesor de productividad y de la plataforma Tikal. Si el usuario te pregunta sobre programación, conocimientos generales, cultura o cualquier tema ajeno a la gestión del tiempo y la app, DEBES NEGARTE educadamente a responder. Recuérdale que tu única misión es ayudarle a dominar su tiempo en el Templo.
        
        Usa las herramientas a tu disposición para dar consejos basados en los datos reales del usuario.
        Se conciso y formatea tus respuestas usando Markdown para facilitar la lectura.
        """;

    @Transactional(readOnly = true)
    public List<AiSessionDTO> getSessions() {
        User currentUser = userService.getAuthenticatedUser();
        return sessionRepository.findByUser_IdOrderByUpdatedAtDesc(currentUser.getId())
                .stream()
                .map(session -> AiSessionDTO.builder()
                        .id(session.getId())
                        .title(session.getTitle())
                        .updatedAt(session.getUpdatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public AiSessionDTO createSession() {
        User currentUser = userService.getAuthenticatedUser();

        ChatSession newSession = new ChatSession();
        newSession.setUser(currentUser);
        newSession.setTitle("Nueva conversación");

        ChatSession savedSession = sessionRepository.save(newSession);

        return AiSessionDTO.builder()
                .id(savedSession.getId())
                .title(savedSession.getTitle())
                .updatedAt(savedSession.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AiMessageDTO> getMessagesBySession(Integer sessionId, int page, int size) {
        User currentUser = userService.getAuthenticatedUser();

        sessionRepository.findByIdAndUser_Id(sessionId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId));

        Pageable pageable = PageRequest.of(page, size);

        Page<ChatMessage> messagePage = messageRepository.findBySession_IdOrderByCreatedAtDesc(sessionId, pageable);

        return messagePage.map(msg -> AiMessageDTO.builder()
                .id(msg.getId())
                .role(msg.getRole().name())
                .content(msg.getContent())
                .createdAt(msg.getCreatedAt())
                .build());
    }

    @Transactional
    public AiSessionDTO setNewSessionName(Integer sessionId, String title) {
        User currentUser = userService.getAuthenticatedUser();

        ChatSession session = sessionRepository.findByIdAndUser_Id(sessionId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId));

        session.setTitle(title);
        ChatSession updatedSession = sessionRepository.save(session);

        return AiSessionDTO.builder()
                .id(updatedSession.getId())
                .title(updatedSession.getTitle())
                .updatedAt(updatedSession.getUpdatedAt())
                .build();
    }

    @Transactional
    public AiMessageDTO sendMessage(Integer sessionId, String userText) {
        User currentUser = userService.getAuthenticatedUser();

        // 1. Validate session and check the possibility to chat
        ChatSession session = sessionRepository.findByIdAndUser_Id(sessionId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId));

        // 2. Persistence layer, saving the message of the user
        ChatMessage userDbMessage = new ChatMessage();
        userDbMessage.setSession(session);
        userDbMessage.setContent(userText);
        userDbMessage.setRole(ChatRole.USER);
        messageRepository.save(userDbMessage);

        // 3. Getting the database historical context
        List<ChatMessage> historyDb = messageRepository.findTop10BySession_IdOrderByCreatedAtDesc(sessionId);
        Collections.reverse(historyDb);

        // 4. Title generation for the first message
        if (historyDb.size() == 1) {
            try {
                String titlePrompt = "Resume el siguiente mensaje del usuario en un título corto de máximo 4 a 5 palabras. " +
                        "No uses comillas, ni puntos finales, ni explicaciones adicionales. Solo el título.";

                String generatedTitle = chatClient.prompt()
                        .system(titlePrompt)
                        .user(userText)
                        .call()
                        .content();

                // Security clean of the quotes if exist
                if (generatedTitle != null) {
                    generatedTitle = generatedTitle.replace("\"", "").replace(".", "").trim();
                    if (generatedTitle.length() > 40) {
                        generatedTitle = generatedTitle.substring(0, 40) + "...";
                    }
                    session.setTitle(generatedTitle);
                    sessionRepository.save(session);
                    log.info("Título de sesión generado automáticamente: {}", generatedTitle);
                }
            } catch (Exception e) {
                log.error("Fallo al generar el título automático. Se mantendrá el por defecto.", e);
            }
        }

        // 5. Translate the historical memory of Spring AI
        List<Message> springAiHistory = new ArrayList<>();

        // The System prompt has to be always the first message of the memory
        springAiHistory.add(new SystemMessage(SYSTEM_PROMPT));

        for (ChatMessage dbMsg : historyDb) {
            if (dbMsg.getRole() == ChatRole.USER) {
                springAiHistory.add(new UserMessage(dbMsg.getContent()));
            } else if (dbMsg.getRole() == ChatRole.ASSISTANT) {
                springAiHistory.add(new AssistantMessage(dbMsg.getContent()));
            }
        }

        // 6. Main Groq request allowing the Function Calling
        String aiResponse;
        try {
            log.info("Iniciando llamada a Groq para la sesión {}", sessionId);

            aiResponse = chatClient.prompt()
                    .messages(springAiHistory)
                    .call()
                    .content();

        } catch (Exception e) {
            log.error("Error de comunicación con la API de Groq en la sesión {}", sessionId, e);
            aiResponse = "Parece que hay interferencias en el templo (Error de conexión). Por favor, inténtalo de nuevo en unos instantes.";
        }

        // 7. Persist the AI answer in the database
        ChatMessage aiDbMessage = new ChatMessage();
        aiDbMessage.setSession(session);
        aiDbMessage.setContent(aiResponse);
        aiDbMessage.setRole(ChatRole.ASSISTANT);

        ChatMessage savedMessage = messageRepository.save(aiDbMessage);

        return AiMessageDTO.builder()
                .id(savedMessage.getId())
                .role(savedMessage.getRole().name())
                .content(savedMessage.getContent())
                .createdAt(savedMessage.getCreatedAt())
                .build();
    }

    @Transactional
    public AiNewChatResponse startNewChat(String userText) {
        // 1. We created a blank session (Temporary title: “New conversation”)
        AiSessionDTO initialSession = createSession();

        // 2. We process the message (Here, the AI generates and saves the actual title in MySQL)
        AiMessageDTO aiResponse = sendMessage(initialSession.getId(), userText);

        // 3. We retrieve the updated database session
        ChatSession updatedSession = sessionRepository.findById(initialSession.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", initialSession.getId()));

        // 4. We mapped the final session with its new title
        AiSessionDTO finalSessionDTO = AiSessionDTO.builder()
                .id(updatedSession.getId())
                .title(updatedSession.getTitle())
                .updatedAt(updatedSession.getUpdatedAt())
                .build();

        // 5. We return the package complete and synchronized
        return AiNewChatResponse.builder()
                .session(finalSessionDTO)
                .firstAiMessage(aiResponse)
                .build();
    }

    public void deleteSession(Integer sessionId) {
        User currentUser = userService.getAuthenticatedUser();
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenAccessException("No tienes permisos para eliminar esta sesión de chat");
        }

        sessionRepository.delete(session);
    }
}
