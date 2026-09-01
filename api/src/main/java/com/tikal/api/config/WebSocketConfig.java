package com.tikal.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable an in-memory broker to push messages to clients.
        // /topic -> For group message
        // /queue -> Direct message (1 to 1)
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages that the client sends TO the server (e.g., /app/chat.send)
        config.setApplicationDestinationPrefixes("/app");

        // Special prefix for routing messages to a specific user
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The initial URL that React will use to make the request to open the socket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
