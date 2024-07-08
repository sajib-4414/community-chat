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