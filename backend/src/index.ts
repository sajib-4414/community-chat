//this will catch any errors(that are explicityl thrown or not handled by try catch), and handle them apprpriately 
//like sending a response to the user without crashing the server, MUST be the first line in the code
require("express-async-errors");
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from "http";
import cookieParser from 'cookie-parser';
import { connectToMongoDB } from './config/db';
import { authRouter, userRouter } from './routes/auth.user.routes';
import { messageRouter } from './routes/message.routes';
import { initializeSocketIoServer } from './config/socketInstance';
import { globalErrorHandler } from './middlewares/auth.error';
import * as cron from 'node-cron'
import { broadcastOnlineStatus, loadOnlineStatusToCache, updateUserOnlineStatus } from './services/socket.services';



//for env file confiugration
dotenv.config();

//initializaing a socket and express server
const app = express()

//parse JSON request body, maximum payload limit is 16kb, otherwise will throw error
app.use(express.json({limit:"16kb"}))

//lets also support url encoded paramters, we can do that from postman
//This option allows for rich objects and arrays to be parsed. Without this, 
//nested objects and arrays might not be parsed correctly.
//16kb  is the payload limit
app.use(express.urlencoded({extended:true, limit:"16kb"}))

//to serve images, static files
app.use(express.static('public'))

//cookie parser
app.use(cookieParser())

//running cronjob
cron.schedule('*/10 * * * * *', async() => {
    //updates whether user is online or not in DB every 20s. it updates from cache,
    //its write back cache
    await updateUserOnlineStatus();
    //then we broadcast the online status to all users via socketio
    //later it wil have logic, to only push to friends
    // await broadcastOnlineStatus();
    
});

const cors = require('cors')
app.use(cors())//using default settings, CORS-> Allow all server

const router = express.Router(); // Create a new root router for mounting
// Mount auth and all routers onto the nested router
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/messages', messageRouter);

app.use('/api',router)

//global error handler, It must be placed after all routes, controllers are assigned to app instance,
//that intercept any error that happens in the request response cycle
app.use(globalErrorHandler)

const server = createServer(app)
initializeSocketIoServer(server)

const PORT = process.env.PORT || 3001;
//this returns a promise. unless we are waiting with await, execution will not wait here
//we are using .then and .error 
connectToMongoDB()
.then(() => {
    
    //load online status from db to cache
    //we will update this cache frequently on every user connect or disconnect
    //and update db from this caceh only every 20s
    loadOnlineStatusToCache()
    server.listen(PORT, () => {
        console.log('HTTP server is running at port 3001');
    });
})
.catch((error) => {
    console.error('Error connecting to mongodb, server exiting');
    console.error(error);
    process.exit(1);
});
