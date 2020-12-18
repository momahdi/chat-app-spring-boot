package com.example.springchat.controller;

import static java.lang.String.format;

import com.example.springchat.model.ChatMessage;
import com.example.springchat.model.ChatMessage.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

  private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;

  @EventListener
  public void handleWebSocketConnectListener(SessionConnectedEvent event) {

    System.out.println(event.getMessage());
   // System.out.println("new user");

    logger.info("Received a new web socket connection.");
   /* StompHeaderAccessor headerAccessor = StompHeaderAccessor();
    String username = (String) headerAccessor.getSessionAttributes().get("username");
    String roomId = (String) headerAccessor.getSessionAttributes().get("room_id");
    ChatMessage chatMessage = new ChatMessage();
    chatMessage.setType(MessageType.JOIN);
    chatMessage.setSender(username);
    messagingTemplate.convertAndSend(format("/channel/%s", roomId),chatMessage );*/
  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    System.out.println(event.getMessage());
    System.out.println(event);
    System.out.println("******************************************");
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String username = (String) headerAccessor.getSessionAttributes().get("username");
    String roomId = (String) headerAccessor.getSessionAttributes().get("room_id");
    if (username != null) {
      logger.info("User Disconnected: " + username);
      ChatMessage chatMessage = new ChatMessage();
      chatMessage.setType(MessageType.LEAVE);
      chatMessage.setSender(username);
      messagingTemplate.convertAndSend(format("/channel/%s", roomId), chatMessage);
    }
  }

}
