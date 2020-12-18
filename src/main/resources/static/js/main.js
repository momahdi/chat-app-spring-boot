'use strict';

//initiate global variables with values retrieved from index.html page
let nameInput = $('#name'); //username
let roomInput = $('#room-id'); //room id
let answerPage = document.querySelector('#ans'); //quizpage
let quizPage = document.querySelector('#quiz'); //quizpage
let usernamePage = document.querySelector('#username-page'); //loginpage
let chatPage = document.querySelector('#chat-page');  //chatroom page
let usernameForm = document.querySelector('#usernameForm');
let messageForm = document.querySelector('#messageForm');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#messageArea');
let connectingElement = document.querySelector('.connecting');
let roomIdDisplay = document.querySelector('#room-id-display');

let stompClient = null;
let currentSubscription;
let username = null;
let topic = null;
//test unsubscribe from closed room
let hasOngoingQuiz = false;
let messageElement;
let fakeLeave = false;

const selectElement = document.querySelector('#quiz');
selectElement.addEventListener('change', (event) => {

 // console.log(event.toString());
//console.log(event.target);
sendMessage(event);
});

//const quizButton = document.querySelector('#buttonQuiz');
selectElement.addEventListener('click', (event) => {

  // console.log(event.toString());
console.log(event.target);

  sendMessage(event);
});



//change colors
let colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {

  //recieve name and remove empty spaces
  username = nameInput.val().trim();

  //set cookie to save username and last room used
  Cookies.set('name', username);

//if username has a value, hide the login page
// and show the chatroom page
  if (username) {
    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');


    //crate websocket using sockjs for old browsers
    //use wss for tls encrypted socket
    let socket = new SockJS('ws');
    stompClient = Stomp.over(socket);
    //connect to server
    //with call back methods handling connection or error
    stompClient.connect({}, onConnected, onError);
  }

  //prevent page to rerender the default html start page
  event.preventDefault();
}

// join a room
function enterRoom(newRoomId) {
  //update cookie to latest room entered
  Cookies.set('roomId', newRoomId);
  //change the room id shown in the chatroom
  roomIdDisplay.textContent = newRoomId;
  //set the path to message within the system
  topic = `/app/chat/${newRoomId}`;
//if client already has a subscription, unsubscribe from it first
  if (currentSubscription) {
    currentSubscription.unsubscribe();
  }
  //subscribe user to the new room with call back method onMessageRecieved
  //bind the callback method to this channel
  currentSubscription = stompClient.subscribe(`/channel/${newRoomId}`, onMessageReceived);

//add this user to new room
//with destination, empty header and payload
  stompClient.send(`${topic}/addUser`, {}, JSON.stringify({sender: username, type: 'JOIN'})
  );
}

//when successfully connected to socket join room and hide the "connecting" message
function onConnected() {
  enterRoom(roomInput.val());
  connectingElement.classList.add('hidden');
}
//error handling when socket cant connect
function onError(error) {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

function sendMessage(event) {
  //remove blank spaces in message content
  let messageContent = messageInput.value.trim();
  if(event.target.id.toString().startsWith('q')){
    console.log("quiz change");
    let chatMessage = {
      sender: username,
      content: event.target.id,
      type: 'UPDATEQUIZ'
    };
    stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
  }else if(event.target.id.toString().startsWith('button')){
    let chatMessage = {
      sender: username,
      content: event.target.id,
      type: 'SHOWANSWERS'
    };
    hasOngoingQuiz = false;
    stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));

  }//check if messages start with /join
  else if(messageContent.startsWith('/join ')) {
    //retrieve the string after the /join string
    let newRoomId = messageContent.substring('/join '.length);
    //change room
    enterRoom(newRoomId);

    //remove all elements from the chat incl users, messages, join/leave etc
    while (messageArea.firstChild) {
      messageArea.removeChild(messageArea.firstChild);
    }
  }else if (messageContent.includes('/quiz')) {
      //close room while quiz
     hasOngoingQuiz == true;
      let chatMessage = {
        sender: username,
        content: '/quiz',
        type: 'INITIATEQUIZ'
      };
      stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));

  }else if (messageContent && stompClient) { //stay in the same room but send message
    //create the payload with username, input and type
    let chatMessage = {
      sender: username,
      content: messageInput.value,
      type: 'CHAT'
    };
    //call the sendmessage with destination, empty header and payload as string
    stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
  }
  //clear the input field
  messageInput.value = '';
  //prevent page to rerender the default html start page
  event.preventDefault();
}

function onMessageReceived(payload) {
  let message = JSON.parse(payload.body);
  if(!(message.type == 'JOIN' && hasOngoingQuiz == true) || message.type != 'DISCONNECT' || message.type != 'LEAVE'  || message.type != 'FAKELEAVE'){

    messageElement = document.createElement('li');
  }

  //if someone joined
  if (message.type == 'JOIN') {
    if(hasOngoingQuiz == true){
      let chatMessage = {
        sender: username,
        content: messageInput.value,
        type: 'DISCONNECT'
      };
      //call the sendmessage with destination, empty header and payload as string
      stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
    }else {//
      messageElement.classList.add('event-message');
      message.content = message.sender + ' joined!';

      let textElement = document.createElement('p');
      //get the message content and append it to paragraph and the message element
      let messageText = document.createTextNode(message.content);
      textElement.appendChild(messageText);
      messageElement.appendChild(textElement);

      //add the message content to the chat
      messageArea.appendChild(messageElement);
      //make sure page scrolls down to show latest message
      messageArea.scrollTop = messageArea.scrollHeight;
    }
  }else if(message.type == 'FAKELEAVE'){
    console.log("fakeleave");
    fakeLeave = true;
  }else if (message.type == 'LEAVE') {//if someone left
      if(fakeLeave == false){
        messageElement = document.createElement('li');
        console.log("left");
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
      }
  }else if(message.type == 'INITIATEQUIZ'){
    //close room if quiz started
    hasOngoingQuiz = true;

    console.log("quiz");
    quizPage.classList.remove('hidden');
    answerPage.classList.add('hidden');

  }else if(message.type == 'UPDATEQUIZ'){

    let radiobtn = document.querySelector('#' + message.content);
    radiobtn.checked = true;

  }else if(message.type == 'SHOWANSWERS'){
    answerPage.classList.remove('hidden');
    quizPage.classList.add('hidden');
    hasOngoingQuiz = false;
  } else if(message.type == 'DISCONNECT'){
    if(hasOngoingQuiz == false){
      currentSubscription.unsubscribe();
      //send fakeLeave

      let chatMessage = {
        sender: username,
        content: 'fakeleave',
        type: 'FAKELEAVE'
      };
      //call the sendmessage with destination, empty header and payload as string
      stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
      //
      location = location
    }
  }
  else {

    //else if sending message
    //add chat element
    messageElement.classList.add('chat-message');
    //create image
    let avatarElement = document.createElement('i');
    //choose 2 first letters as name on avatar
    let avatarText = document.createTextNode(message.sender[0] + message.sender[1]);
    //create avatar with background randomized from a set of colors
    avatarElement.appendChild(avatarText);
    avatarElement.style['background-color'] = getAvatarColor(message.sender);

    //add user info to chat
    messageElement.appendChild(avatarElement);
    //add placeholder for username
    let usernameElement = document.createElement('span');
    //add placeholder for text
    let usernameText = document.createTextNode(message.sender);
    //append the username to span placeholder
    usernameElement.appendChild(usernameText);
    //append this username to the message element
    messageElement.appendChild(usernameElement);
  }
  if(message.type != "INITIATEQUIZ" && message.type != "UPDATEQUIZ" && message.type != "SHOWANSWERS" && message.type != "JOIN" &&  message.type != "DISCONNECT" && message.type != "FAKELEAVE"){
    //create paragraph
    if(fakeLeave == true){
      fakeLeave = false;
    }else {

      let textElement = document.createElement('p');
      //get the message content and append it to paragraph and the message element
      let messageText = document.createTextNode(message.content);
      textElement.appendChild(messageText);
      messageElement.appendChild(textElement);

      //add the message content to the chat
      messageArea.appendChild(messageElement);
      //make sure page scrolls down to show latest message
      messageArea.scrollTop = messageArea.scrollHeight;
    }
  }

}

//get random color for user image
function getAvatarColor(messageSender) {

  let hash = 0;
  for (let i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
  }
  let index = Math.abs(hash % colors.length);
  return colors[index];
}



//check if cookies, if so set name and roomid as default input
//add eventlisteners
$(document).ready(function() {
  let savedName = Cookies.get('name');
  if (savedName) {
    nameInput.val(savedName);
  }

  let savedRoom = Cookies.get('roomId');
  if (savedRoom) {

    roomInput.val(savedRoom);
  }
//initiate eventlisteners
  usernamePage.classList.remove('hidden');
  usernameForm.addEventListener('submit', connect, true);
  messageForm.addEventListener('submit', sendMessage, true);
});
