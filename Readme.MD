#### configuration of express server and socketio server
```
//initializaing a socket and express server
const expressServer = express()
const server = createServer(expressServer)
const io = new Server(server,{})

//when a new socket joins to the server
//or when a new client connects
io.on("connection", (socket: Socket) => {
    console.log('new socket client just joined')
});

expressServer.get('/',(req,res)=>{
    res.send('Hello world')
})

server.listen(3001, ()=>{
    console.log('http server is running at 3001 port')
})
```
**
Vite has by default support for .env files.
How to use: https://stackoverflow.com/a/77102955


Library to add
* express validator
* mongoose aggregate pagination
* mongo migrate
* express async error
* bcrypt
* something for jwt
* route creating library

CORS:
const cors = require('cors')
expressServer.use(cors())//using default settings, CORS-> Allow all server
//best approach is to configure which server to allow

Problem solving:
1. Was not able to join room through backend api when socket connection is already established. 
 // //this code not working, does not fire anymore when client is already joined
        // io.on("connection", (socket:any) => {
        //     console.log("inside the on connection")
        //     socket.join(room.name);
        // });

        const socket = io.sockets.sockets.get(socketId);
so i did not have the socket instance to join it in the room. solve was, sending currently connected socket id from 
frotnend to server. then in the api call
const socket = io.sockets.sockets.get(socketId);
socket.join(room.name);

2. How to handle one to one chat?
one to one message was done by private channel.
we could do just connecting one socket to another, but that way we will loose reference once socket disconnected
and could not store and retrieve messages. so i decided i could do a channel pvt-username1-username2
and communicating through this room will be their one to one chat.

3. how did i handle first time chat of one to one?
one approach was as soon as someone clicks somebody's name, create a pvt channel(either by requeting throuh api or via socket event). but if person is not doing chat, it would be redudnant chatroom creation in the database.
another approach was, as soon as someone clcks someone's name, it will create a socket event, server will create a charoom in DB, join both of them, this will be option too. but that means so many uncessary channels, if the user does not chat eventually.

4. how to get scoket instance throughout the app?
If I want to access the io instance from a controller to emit something, and create a new io with new Server() everytime in every controller, in that case client could be [test kor nai] connected to another controllers another socket. also we will be creating so many socket instances.
better way, use a singleton instead of creating every time new Server(). 

5. Problem:
until both user started to chat with each other, then they are not part of a room actively(private chat mainly), and both are not connected via socket with room, so the message sent via socket to a room does not reach from one to another. 
Mainly because i make a user socket join a room upon message, not before that.
if both user message each other then they join a room and start to see messages instantly.
solution is to make both users part of the room before he gets a message.

Related scenario:
1. user has not clicked, but chatted before/Joined that room before, so he is a part of the room.
upon chatUI launch, join him to all those rooms. so he can get all messages of all the rooms he is part of with socket upon entering the chatpage
=> it worked. created an API to join user's socket to all rooms. in client with socket on connect i called an api with the socketId to make user join all rooms.
2. user has not clicked or chatted before, but someone new messaged him.
for this case, he has just become part of a new room.
i think we can do it,
so user1 has messaged user2, they have not chatted before, no private room exists between them.
so the user1's first message sent via API, in that API I am making the user1's socket to join the room,
and send the message back to user1 from server via socket.
and in the API i am also making user2 a part of the same room.
I just need to make user2 actively join that room, for that i need user2's socket.
Solution: will add a socket Id array for each user. so another model, UserSocket.
it will have a new Model, UserSOcket: user, socketId[]
there will be an API, addUserSocket [not deleting old sockets for the moment, will see if there is redudant sockets, i will store all sockets if user logs into multiple devices], deleteUserSocket[].
whenver backend sees a message for a channel user that is new, so user is Maybe not connected, we will connect user's socket
to the channel.