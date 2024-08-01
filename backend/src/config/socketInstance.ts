import { Server } from "socket.io";
import {  MESSAGE_TO_SERVER, SOCKET_CONNECTED, SOCKET_DISCONNECTED, USER_JOINED_ROOM, USER_ROOM_JOIN_REQUEST } from "../definitions/event_types";
import {  MessagePayLoadToServer } from "../definitions/room_message_types";
import {  UserSocket } from "../models/user";
import { CustomSocket, onMessageReceivedHandler, processUserConnected, processUserDisconnected, socketAuthenticationMiddleware } from "../services/socket.services";
import dotenv from 'dotenv'

dotenv.config()
let io:any = null;

export const initializeSocketIoServer = (httpExpressServer:any)=>{
    io = new Server(httpExpressServer,{
        cors: {
          origin: process.env.ALLOWED_FRONTEND
        },
        //this means socketio will do a ping to do a hearbeat request to the client
        pingInterval: 5000,
        pingTimeout:4000
    })
    // authentication related middlware
    io.use(socketAuthenticationMiddleware)


    //when a new socket joins to the server
    //or when a new client connects
    io.on(SOCKET_CONNECTED, (socket: CustomSocket) => {
        console.log('new socket client just joined, socket id=', socket.id,',user=', socket.user)
        //pushes the update to cache, that user came online, it will be broadcasted soon.
        processUserConnected(socket)
        socket.on(SOCKET_DISCONNECTED,(reason)=>{
            console.log("socket with id", socket.id,"disconnected,. reason=",reason)
            processUserDisconnected(socket)
        })
        socket.on(USER_ROOM_JOIN_REQUEST,({roomName})=>{
            socket.join(roomName);
            console.log('CLient want to join a room')
        })
        socket.on(MESSAGE_TO_SERVER,async (payload:MessagePayLoadToServer)=>{
            console.log('got message from socket=',socket.id, ", message=", payload)
            await onMessageReceivedHandler(socket, payload)
        })
    });
}

export const getIoInstance = ()=>{
    return io;
}