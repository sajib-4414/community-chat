import { getIoInstance } from "../config/socketInstance"
import { Message } from "../models/message"
import { Room } from "../models/room"
import { RoomMember } from "../models/room-member"
import { IUser, User } from "../models/user"
import { MESSAGE } from "../types/event_types"
import { MESSAGE_TYPES, ROOM_TYPE } from "../types/room_message_types"

export const createFirstMessage = async(senderUser:IUser, messagePayload:any)=>{
    //right now sender, receiver is just the username of the users, but it will be updated
    //sender wont be needed, reciever will be needed
    //also for group chat, receiver wont be needed at all, in future
    const {receiver, messageRoomName, message, socketId} = messagePayload

    //right now only doing one to one message
    //check if room exists
    let room = await Room.findOne({
        name:messageRoomName
    })
    console.log("room found.....................")

    //if room does not exist create it
    if(!room){
        //first create the room
        const one_one_one_usernames = [senderUser.username,receiver.username]
        one_one_one_usernames.sort()
        const roomName = "pvt-"+one_one_one_usernames.join("-")
        room  = await Room.create({
            roomType:ROOM_TYPE.ONE_TO_ONE,
            name:roomName,
            createdBy:senderUser
        })
        console.log("room created.....................")

        //then create the room members in room members model
        await RoomMember.create({
            room,
            member:senderUser
        })
        await RoomMember.create({
            room,
            member:receiver
        })
        console.log("room member creaed.....................")
    }

    
    const dbMessage = await Message.create({
        message,
        sender:senderUser,
        room,
        oneToOne:true,
        messageType:MESSAGE_TYPES.USER_MSG
    })
    console.log("message created.....................")
    
    const io:any = getIoInstance()
    
    if(io !==null){
        console.log("io is not null and emitting message")
        // //this code not working, does not fire anymore when client is already joined
        // io.on("connection", (socket:any) => {
        //     console.log("inside the on connection")
        //     socket.join(room.name);
        // });

        const socket = io.sockets.sockets.get(socketId);
        socket.join(room.name);

        //now we emit the mssage to the room
        io.to(room.name).emit(MESSAGE,dbMessage)
    }
    else{
        console.log("io is null")
    }
    



}

export const getChatMessagesOfRoom = async (requestPayload:any)=>{
    //todo in future check current user authorized to get chat data of this room
    
    const {roomName} = requestPayload
    console.log("room name requested is ",roomName)

    const room = await Room.findOne({
        name: roomName
    })
    if (!room)
        return []

    const messages = await Message.find({
        room
    }).populate('sender')
    return messages;

}