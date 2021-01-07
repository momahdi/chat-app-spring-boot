# Spring Boot Chatroom with quizzes

Spring Boot websocket chatroom with arbitrary number of rooms where users can take quizzes together.

Run the server with gradle and visit `localhost:8080`:

## Project Description

This project is a chat application created with Spring boot, javascript, html and bootstrap with css. It allows the user to start a chat room and let anyone join it. Once in the room someone can initiate a quiz that everyone in the room can participate in together. Everyone can sumbit.

Available commands: /join [room id] /quiz ,

## Project architecture 

The project follows the MVP architecture and each layer is described here:

### Model folder:

This folder consists of the standard springboot setup that handles the websockets. Also handles setting up the routing between client with a messagebroker.

### Controler folder:

This layer consist of the mapping that spring provides between the client to all other. Also has the eventlistner.

### View folder/resources:

Here you can find the html file and the css file that goes along with it. There are also the javasciptfile and JSON that handles the html file.

### Styles folder:

The styles folder contains the css for the components in the presentation folder.

