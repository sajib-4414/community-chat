//this will catch any errors(that are explicityl thrown or not handled by try catch), and handle them apprpriately 
//like sending a response to the user without crashing the server, MUST be the first line in the code
require("express-async-errors");

import express from 'express'
import { createServer } from "http";
import cookieParser from 'cookie-parser';
import { connectToMongoDB } from './config/db';
import { authRouter } from './routes/auth_user_routes';
import { messageRouter } from './routes/message_routes';
import { initializeSocketIoServer } from './config/socketInstance';
//initializaing a socket and express server
const app = express()

//parse JSON request body
app.use(express.json())




//cookie parser
app.use(cookieParser())

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