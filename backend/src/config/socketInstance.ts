import { Server,Socket } from "socket.io";
import { MESSAGE, USER_JOINED_ROOM, USER_ROOM_JOIN_REQUEST } from "../types/event_types";

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
        socket.on(MESSAGE,(payload)=>{
            socket.join(payload.roomName);
            
            console.log('CLient sent a message', payload)
            //this message will be sent back to all clients in the room
            io.to(payload.roomName).emit(MESSAGE,payload.message)

        })
    });
}

export const getIoInstance = ()=>{
    return io;
}