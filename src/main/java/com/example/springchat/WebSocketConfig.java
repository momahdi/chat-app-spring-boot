package com.example.springchat;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
/**
 * @EnableWebSocketMessageBroker is to enable WebSocket Server
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer { //implements WebSocketMessageBrokerConfigurer


  /**
   * In this method we create a endpoint which lets the client connect to websocket server.
   * WithSockJS() is backup option if the browser dont support websockets
   * STOMP = Simple Text Oriented Messaging Protocol that formats rules for data exchange
   * @param registry
   */
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws").withSockJS();
  }



  /**
   * The "messagebroker" lets us route message from client to other clients.
   * "Applicationdestinationprefixes" sets that messages where the destination starts with /app will be routed to -
   *  - message-handling methods (@messagemapping).
   * "enableSimpleBroker" sets that messages where the destination starts with /channel is routed to the message broker.
   * The message broker broadcast the message to all clients connected with the same destinationprefix.
   * @param registry
   */
  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.setApplicationDestinationPrefixes("/app");
    registry.enableSimpleBroker("/channel");
  }
}
