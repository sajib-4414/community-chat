import * as cron from 'node-cron'
import { loadOnlineStatusToCache, updateUserOnlineStatus } from './services/socket.services';
import { createServer } from "http";
import { initializeSocketIoServer } from './config/socketInstance';
import { app } from './app';
import { connectToMongoDB } from './config/db';
// //running cronjob
cron.schedule('*/10 * * * * *', async() => {
    //updates whether user is online or not in DB every 20s. it updates from cache,
    //its write back cache
    await updateUserOnlineStatus();
    //then we broadcast the online status to all users via socketio
    //later it wil have logic, to only push to friends
    // await broadcastOnlineStatus();
    
});


export const server = createServer(app)
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
