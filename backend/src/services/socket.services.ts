import { Socket } from "socket.io";
import { NotAuthenticatedError } from "../definitions/error_definitions";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, User, UserSocket } from "../models/user";
import { MESSAGE_TYPES, MessagePayLoadToServer, MessageWithRoom, ROOM_TYPE } from "../definitions/room_message_types";
import { IRoom, Room } from "../models/room";
import { IMessage, Message } from "../models/message";
import { getIoInstance } from "../config/socketInstance";
import { MESSAGE_FROM_SERVER, ONLINE_STATUS_BROADCAST_FROM_SERVER, USER_CAME_ONLINE } from "../definitions/event_types";
import { redisClient } from "../config/redisClient";
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

export const processUserConnected = async (socket:CustomSocket)=>{
    //first attempt notify everyone that I came online.
    //to revise I will try to notify everyone with who I am friend with.
    //then revising, this broadcasting will be done in every one minute, not just when i connect
    // const io = getIoInstance();
    // io.emit(USER_CAME_ONLINE, {
    //     user: socket.user
    // })

    //implementing approach with cache and periodic broadcast
    //so when someone came online we just put in cache true
    const EXPIRES_IN_SEC = 20;
    console.log('putting user', socket?.user?.name, ' in cache','putting connected....')
    await redisClient.setEx(socket.user?.id,EXPIRES_IN_SEC,String(true))
}

//uodates data into cachhe when user is disconnected
export const processUserDisconnected = async (socket:CustomSocket)=>{
    const EXPIRES_IN_SEC = 20;
    await redisClient.setEx(socket.user?.id,EXPIRES_IN_SEC,String(false))
}

//runs periodically with node cron
//updates user online status from cache to db 
export const updateUserOnlineStatus = async()=>{
    console.log("updating users online status from cache...")
    //finds all users, only select their onlinestatus
    //for each of them checks the status in Redis, and update them on the db, the online status
    const allUsers:IUser[] = await User.find({}).select("isOnline name")
    for(const user of allUsers){
        const status =  await redisClient.get(user.id);
        console.log('statuss from cache, for ',user.name,'=',status)
            //skip if for a user we dont have any status in redis, its ok, in next refresh redis will have it
            //we only update if something found.
        if(!(status === null || status === undefined)){
            user.isOnline = status==='true'?true:false //status is either 'true' or 'false'
            console.log('saving data for..',user.name, 'status=',user.isOnline)
            await user.save()
        }
    }
    
}

export const loadOnlineStatusToCache  = async ()=>{
    console.log("loading alll users to online..")
    const allUsers:IUser[] = await User.find({}).select("isOnline")
    Promise.allSettled(allUsers.map(async (user)=> await redisClient.setEx(user.id,60,String(user.isOnline))))
    .then((result)=>{
        console.log("all loading uesrs finishes, result=",result)
    })
    .catch((err)=>{
        console.log("all loading users could not finished, error=",err)
    })
}


//this will be run periodically with node cron
//it will broadcast to all users the statuses of users whether they are online.
//later we will broadcast to each peoeple only the updates thye need, i.e if their friends came online
export const broadcastOnlineStatus = async ()=>{
    console.log("broadcasting users status to frotneend......")
    const allUsers:IUser[] = await User.find({}).select("isOnline name")
    const io = getIoInstance();
    io.emit(ONLINE_STATUS_BROADCAST_FROM_SERVER, {
        users: allUsers
    })
}