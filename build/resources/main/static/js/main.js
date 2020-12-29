'use strict';


//initiate global variables with values retrieved from index.html page
let nameInput = $('#name'); //username
let roomInput = $('#room-id'); //room id



let loginpage = document.querySelector('#username-page'); //loginpage
let usernameForm = document.querySelector('#usernameForm');//??

let chatPage = document.querySelector('#chat-page');  //chatroom page
let connectingElement = document.querySelector('.connecting');

let messageForm = document.querySelector('#messageForm');//
let messageInput = document.querySelector('#message'); //
let messageArea = document.querySelector('#messageArea');

let roomIdDisplay = document.querySelector('#room-id-display');
let answerPage = document.querySelector('#ans'); //answerPage
let quizPage = document.querySelector('#quiz'); //quizpage


let finalawnser={q1:null,q2:null};
let stompClient = null;
let currentSubscription;
let username = null;
let topic = null;
let hasOngoingQuiz = false; //test unsubscribe from closed room
let messageElement;
let fakeLeave = false;





//change colors
let colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {

  username = nameInput.val().trim();//recieve name and remove empty spaces
  Cookies.set('name', username); //set cookie to save username and last room used

  if (username) { //if username has a value, hide the login page and show the chatroom page
    loginpage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    let socket = new SockJS('ws'); //crate websocket using sockjs for old browsers
                                   //use wss for tls encrypted socket
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError); //connect to server with call back methods handling connection or error
  }
  event.preventDefault(); //prevent page to rerender the default html start page
}


function enterRoom(newRoomId) {

  Cookies.set('roomId', newRoomId); //update cookie to latest room entered
  roomIdDisplay.textContent = newRoomId; //change the room id shown in the chatroom
  topic = `/app/chat/${newRoomId}`;//set the path to message within the system

  if (currentSubscription) {
    currentSubscription.unsubscribe(); //if client already has a subscription, unsubscribe from it first
  }
  currentSubscription = stompClient.subscribe(`/channel/${newRoomId}`, onMessageReceived);   //subscribe user to the new room with call back method onMessageRecieved
  stompClient.send(`${topic}/addUser`, {}, JSON.stringify({sender: username, type: 'JOIN'}) //add this user to new room with destination, empty header and payload
  );
}


function onConnected() {

  enterRoom(roomInput.val());//when successfully connected to socket join room and hide the "connecting" message
  connectingElement.classList.add('hidden');
}
function onError(error) { //error handling when socket cant connect
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

function sendMessage(event) {

  let messageContent = messageInput.value.trim();   //remove blank spaces in message content
  if(event.target.id.toString().startsWith('q')){
    let chatMessage = {
      sender: username,
      content: event.target.id,
      type: 'UPDATEQUIZ'
    };
    stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
  }else if(event.target.id.toString().startsWith('button')){
    let chatMessage = {
      sender: username,
      content: JSON.stringify(finalawnser), //merge
      type: 'SHOWANSWERS'
    };
    hasOngoingQuiz = false;
    stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));

  }
  else if(messageContent.startsWith('/join ')) { //check if messages start with /join

    let newRoomId = messageContent.substring('/join '.length); //retrieve the string after the /join string
    enterRoom(newRoomId); //change room

    while (messageArea.firstChild) { //remove all elements from the chat incl users, messages, join/leave etc
      messageArea.removeChild(messageArea.firstChild);
    }

  }else if (messageContent.includes('/quiz')) {

     hasOngoingQuiz == true;  //close room while quiz
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
  console.log(payload)
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
    let input = document.getElementsByTagName("input");
    for(let i=0;i<input.length;i++)
      input[i].checked = false;
    quizPage.classList.remove('hidden');
    answerPage.classList.add('hidden');

  }else if(message.type == 'UPDATEQUIZ'){

    let radiobtn = document.querySelector('#' + message.content);
    radiobtn.checked = true;
  //merge
    if (message.content.startsWith('q1')){
      finalawnser.q1=message.content;
      console.log(finalawnser)
    }
    if (message.content.startsWith('q2')){
      finalawnser.q2=message.content;
      console.log(finalawnser)
    }

  }else if(message.type == 'SHOWANSWERS'){
    answerPage.classList.remove('hidden');
    quizPage.classList.add('hidden');
    hasOngoingQuiz = false;
    answerPage.querySelector("#result").innerHTML = message.result;
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
      alert("The room is currently running a quiz and is therefore closed at the moment")
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
  loginpage.classList.remove('hidden');
  usernameForm.addEventListener('submit', connect, true);
  messageForm.addEventListener('submit', sendMessage, true);
  quizPage.addEventListener('change', (event) => {
    sendMessage(event);
  });

  quizPage.addEventListener('click', (event) => {
    sendMessage(event);
  });
});
