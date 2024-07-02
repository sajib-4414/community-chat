import express from 'express'
import { createServer } from "http";
import { Server,Socket } from "socket.io";

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