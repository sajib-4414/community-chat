import { Server,Socket } from "socket.io";
import { MESSAGE, USER_JOINED_ROOM, USER_ROOM_JOIN_REQUEST } from "../types/event_types";
import { Message } from "../models/message";
import { MESSAGE_TYPES } from "../types/room_message_types";
import { Room } from "../models/room";
import { User } from "../models/user";

let io:any = null;

export const initializeSocketIoServer = (httpExpressServer:any)=>{
    io = new Server(httpExpressServer,{
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
        socket.on(USER_ROOM_JOIN_REQUEST,({roomName})=>{
            socket.join(roomName);
            console.log('CLient want to join a room')
        })
        socket.on(MESSAGE,async (payload)=>{
            socket.join(payload.room);
            
            console.log('Client sent a message', payload)
            
            console.log(payload)
            const dbMessage = await Message.create({
                message:payload.message,
                sender:  payload.sender._id  ,
                room:await Room.findOne({ name:payload.room}) ,
                oneToOne:true,
                messageType:MESSAGE_TYPES.USER_MSG
            })
            const storedMessage = await Message.findById(dbMessage._id).populate('sender')

            //this message will be sent back to all clients in the room
            io.to(payload.room).emit(MESSAGE,storedMessage)
        })
    });
}

export const getIoInstance = ()=>{
    return io;
}