import { Server,Socket } from "socket.io";
import { MESSAGE_FROM_SERVER, MESSAGE_TO_SERVER, USER_JOINED_ROOM, USER_ROOM_JOIN_REQUEST } from "../definitions/event_types";
import { IMessage, Message } from "../models/message";
import { MESSAGE_TYPES, MessagePayLoadToServer, MessageWithRoom, ROOM_TYPE } from "../definitions/room_message_types";
import { IRoom, Room } from "../models/room";
import { User, UserSocket } from "../models/user";

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
        socket.on(MESSAGE_TO_SERVER,async (payload:MessagePayLoadToServer)=>{
            console.log('got message from socket=',socket.id)
            console.log('got a message from client via socket',payload)

            //Handle both case, if this is the first chat , or it is a already started chat

            //first verify if the current socket belongs to sender user,
            //because we are not checking authentication token
            const senderUserSocket = await UserSocket.findOne({
                user:payload.senderUser,
                socketIds:[socket.id]
            })
            if (!senderUserSocket){
                console.log('this socket does not belong to this user')
                return;
            }
            let room;
            //case1: Its a first time sent message
            if(!payload.room && payload.targetUser && payload.senderUser && payload.messageRoomType === ROOM_TYPE.ONE_TO_ONE){
                room = await Room.findOne({
                    roomType:payload.messageRoomType,
                    privateRoomMembers:[
                        payload.targetUser,
                        payload.senderUser
                    ]
                })
                console.log('room exists......')
                //if we find any room then its good. if not we create it now.
                if(!room){
                    room = await Room.create({
                        roomType:payload.messageRoomType,
                        privateRoomMembers:[
                            payload.targetUser,
                            payload.senderUser
                        ],
                        createdBy:payload.senderUser,
                        name:`Private chat between ${payload.senderUser.username} and ${payload.targetUser.username}`,
                        code:`pvt-${payload.senderUser.username}-${payload.targetUser.username}`

                    })
                    console.log('room does not exist')
                }
            }

            //now we create the dbMessage
            const dbMessage = await Message.create({
                message:payload.message,
                sender:  payload.senderUser  ,
                room,
                oneToOne:true,
                messageRoomType:payload.messageRoomType,
                messageType:MESSAGE_TYPES.USER_MSG
            })
            console.log('db message created')
            const receiverUserSocket = await UserSocket.findOne({
                user:payload.targetUser
            })
            const targetSocket = io.sockets.sockets.get(receiverUserSocket?.socketIds[0]);

            //we will join both sender and receiver socke to the room
            //this is the sender socket
            socket.join(payload.room?.code!);
            //this is the receiver socket
            targetSocket.join(payload.room?.code!)

            console.log('both sockets have joined the room')

            //retireve the updated message from DB
            const storedMessage:IMessage|null = await Message.findById(dbMessage._id).populate('sender')
            const storedRoom:IRoom|null = await Room.findById(room?.id).populate('privateRoomMembers')
            const messagePayloadToFrotnend:MessageWithRoom = {
                message:storedMessage!,
                room:storedRoom!
            } 

            console.log('now emitting to the room')
            io.to(payload.room?.code).emit(MESSAGE_FROM_SERVER,messagePayloadToFrotnend)

            // socket.join(payload.room);
            // console.log("my rooms are", socket.rooms)
            
            // console.log('Client sent a message', payload)
            
            // console.log(payload)
            // const dbMessage = await Message.create({
            //     message:payload.message,
            //     sender:  payload.sender._id  ,
            //     room:await Room.findOne({ code:payload.roomcode}) ,
            //     oneToOne:true,
            //     messageType:MESSAGE_TYPES.USER_MSG
            // })
            // const storedMessage = await Message.findById(dbMessage._id).populate('sender')

            // //this message will be sent back to all clients in the room
            // io.to(payload.room).emit(MESSAGE_FROM_SERVER,storedMessage)
        })
    });
}

export const getIoInstance = ()=>{
    return io;
}