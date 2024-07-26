import { Socket } from "socket.io";
import { NotAuthenticatedError } from "../definitions/error_definitions";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, User, UserSocket } from "../models/user";
import { MESSAGE_TYPES, MessagePayLoadToServer, MessageWithRoom, ROOM_TYPE } from "../definitions/room_message_types";
import { IRoom, Room } from "../models/room";
import { IMessage, Message } from "../models/message";
import { getIoInstance } from "../config/socketInstance";
import { MESSAGE_FROM_SERVER, USER_CAME_ONLINE } from "../definitions/event_types";
export interface CustomSocket extends Socket {
    user: IUser|null; // Replace User with your actual user interface
}
export const socketAuthenticationMiddleware = async(socket:CustomSocket, next:any)=>{


    try{
        //check if the authentication token valid.
        const token = socket.handshake.auth.token;
        if(!token)
            next(new NotAuthenticatedError('Socket Authentication error'))
        const decoded:JwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        const user:IUser|null = await User.findById(decoded.id)
        if(!user)
             return next(new NotAuthenticatedError('Socket authentication error'))

        //If user is an authenticated user. as socket will connect soon, mark the user online
        user.isOnline = true;
        user.save() //we dont need await, as we dont want to wait, it can happen asyncrhonously
        socket.user = user;
        next()
        }catch(err){
            console.log("error authenticating socket", err)
            next(new NotAuthenticatedError('Socket authentication error'))
        }
    
}

export const onMessageReceivedHandler = async (socket: CustomSocket, payload:MessagePayLoadToServer)=>{
    const io = getIoInstance();
    console.log('some message received.........')
    console.log("socket user is, ",socket.user)
    //Handle both case, if this is the first chat , or it is a already started chat

            
            let room;
            //case1: Its a first time sent message
            if(!payload.room && payload.targetUser && payload.senderUser && payload.messageRoomType === ROOM_TYPE.ONE_TO_ONE){
                console.log("here333..........")
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
            else{
                console.log("here4..........")
                //room is there just need to pick it up
                room = await Room.findById(payload.room?._id)
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
            

            //we will join both sender and receiver socke to the room
            //this is the sender socket
            socket.join(payload.room?.code!);
            //this is the receiver socket
            //reciver may not be in online, so we attempt to join the receiver to the room
            try{
                const targetSocket = io.sockets.sockets.get(receiverUserSocket?.socketIds[0]);
                if (targetSocket)
                    targetSocket.join(payload.room?.code!)
                else
                    console.log("reciver is not online, just db message this time....")
            }catch(err){
                console.log("reciver is Maybe not online or registered, just db message this time....")
                console.log()
                console.log(err)
            }
            

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

}

export const broadCastOnlineStatus = (socket:CustomSocket)=>{
    //first attempt notify everyone that I came online.
    //to revise I will try to notify everyone with who I am friend with.
    //then revising, this broadcasting will be done in every one minute, not just when i connect
    const io = getIoInstance();
    io.emit(USER_CAME_ONLINE, {
        user: socket.user
    })
}