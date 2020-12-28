package com.example.springchat.controller;

import com.example.springchat.model.ChatMessage;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import static java.lang.String.format;

@Controller
public class ChatController {
  @Autowired
  private SimpMessageSendingOperations messagingTemplate;

  /**
   * MessageMapping handles that every client that has destination /app will be routed to this annotation.
   * We send the message using destinationprefix (/channel/roomID) the message broker will broadcast to all client connected to it.
   * @param roomId
   * @param chatMessage
   */
  @MessageMapping("/chat/{roomId}/sendMessage")
  public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {


      JSONObject testing = new JSONObject(); //test
      testing.put("q1","q1a4");//test
      testing.put("q2","q2a1");//test
      testing.put("q3","q3a2");//test
      testing.put("q4","q4a4");//test
      testing.put("q5","q5a3");//test
      String testingString = testing.toString();//test

      if(chatMessage.getType().toString().equals("SHOWANSWERS")) {
       //   chatMessage.setContent(testingString); //set manually the userinput //test


          System.out.println("show answers worked!");

          try {
              chatMessage.setResult();
          }catch (Exception e){

          }
          System.out.println(chatMessage.getResult());
      }

      messagingTemplate.convertAndSend(format("/channel/%s", roomId), chatMessage);
  }

  /**
   * Handles to notify the chatroom when a new user has entered.
   * Adds roomid and user to the Web Socket Session (HeaderAccessor).
   * Sends message to all client, chatMesseage includes (username and type join).
   * @param roomId
   * @param chatMessage
   * @param headerAccessor
   */

  @MessageMapping("/chat/{roomId}/addUser")
  public void addUser(@DestinationVariable String roomId,SimpMessageHeaderAccessor headerAccessor, @Payload ChatMessage chatMessage) {
      headerAccessor.getSessionAttributes().put("room_id", roomId);
      headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
      messagingTemplate.convertAndSend(format("/channel/%s", roomId), chatMessage);
  }


}
