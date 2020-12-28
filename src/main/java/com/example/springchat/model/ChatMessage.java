package com.example.springchat.model;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class ChatMessage {
  private MessageType messageType;
  private String content;
  private String sender;
  private int res = 0;
  private String[] quizAnswers = new String[]{"q1a3","q2a1","q3a2","q4a3","q5a2"}; //ansers to quiz


  public enum MessageType {
    CHAT, JOIN, LEAVE, INITIATEQUIZ, UPDATEQUIZ,SHOWANSWERS, DISCONNECT, FAKELEAVE
  }




  public int getResult(){

    return this.res;
  }



  public void setResult() throws ParseException {
    this.res = 0;
    //parse the content from string to json
    JSONParser parser = new JSONParser();
    JSONObject json = (JSONObject) parser.parse(this.content);

    if(json.get("q1").toString().equals(this.quizAnswers[0]))
      this.res++;
    if(json.get("q2").toString().equals(this.quizAnswers[1]))
      this.res++;
    if(json.get("q3").toString().equals(this.quizAnswers[2]))
      this.res++;
    if(json.get("q4").toString().equals(this.quizAnswers[3]))
      this.res++;
    if(json.get("q5").toString().equals(this.quizAnswers[4]))
      this.res++;
  }

  public MessageType getType() {
    return messageType;
  }

  public void setType(MessageType messageType) {
    this.messageType = messageType;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public String getSender() {
    return sender;
  }

  public void setSender(String sender) {
    this.sender = sender;
  }
}
