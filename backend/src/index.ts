import express, { Application } from 'express'
import { createServer } from "http";
import { Server,Socket } from "socket.io";
import { USER_JOINED_ROOM } from './types/event_types';
import { connectToMongoDB } from './config/db';
import { authRouter } from './routes/auth_user_routes';
import { messageRouter } from './routes/message_routes';
import { initializeSocketIoServer } from './config/socketInstance';

//initializaing a socket and express server
const app = express()
app.use(express.json())
connectToMongoDB()
const cors = require('cors')
app.use(cors())//using default settings, CORS-> Allow all server

const router = express.Router(); // Create a new root router for mounting
// Mount auth and all routers onto the nested router
router.use('/auth', authRouter);
router.use('/messages', messageRouter);

app.use('/api',router)
const server = createServer(app)
initializeSocketIoServer(server)



server.listen(3001, ()=>{
    console.log('http server is running at 3001 port')
})