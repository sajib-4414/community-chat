import express from 'express'
import { createServer } from "http";
import { Server,Socket } from "socket.io";
import { USER_JOINED_ROOM } from './types/event_types';
import { connectToMongoDB } from './config/db';
import { authRouter } from './routes/auth_user_routes';

//initializaing a socket and express server
const expressServer = express()
expressServer.use(express.json())
connectToMongoDB()
const cors = require('cors')
expressServer.use(cors())//using default settings, CORS-> Allow all server

const router = express.Router(); // Create a new root router for mounting
// Mount auth and all routers onto the nested router
router.use('/auth', authRouter);


expressServer.use('/api',router)
const server = createServer(expressServer)
const io = new Server(server,{
    cors: {
      origin: "http://localhost:5173"
    }
  })

//when a new socket joins to the server
//or when a new client connects
io.on("connection", (socket: Socket) => {
    console.log('new socket client just joined, socket id=', socket.id)
    socket.on(USER_JOINED_ROOM,()=>{
        console.log('Client joined')
    })
});


server.listen(3001, ()=>{
    console.log('http server is running at 3001 port')
})