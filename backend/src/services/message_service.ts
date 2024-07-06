import { getIoInstance } from "../config/socketInstance"
import { Message } from "../models/message"
import { Room } from "../models/room"
import { RoomMember } from "../models/room-member"
import { User } from "../models/user"
import { MESSAGE } from "../types/event_types"
import { MESSAGE_TYPES, ROOM_TYPE } from "../types/room_message_types"

export const createMessage = async(messagePayload:any)=>{
    //right now sender, receiver is just the username of the users, but it will be updated
    //sender wont be needed, reciever will be needed
    //also for group chat, receiver wont be needed at all, in future
    const {sender, receiver, messageRoomName, message, socketId} = messagePayload

    //right now only doing one to one message
    //check if room exists
    let room = await Room.findOne({
        name:messageRoomName
    })

    const senderUser = await User.findOne({
        username:sender
    })

    //if room does not exist create it
    if(!room){
        //first create the room
        const one_one_one_usernames = [sender,receiver]
        one_one_one_usernames.sort()
        const roomName = "pvt-"+one_one_one_usernames.join("-")
        const roomCreatedBy = await User.findOne({
            username:sender
        })
        room  = await Room.create({
            roomType:ROOM_TYPE.ONE_TO_ONE,
            name:roomName,
            createdBy:roomCreatedBy
        })

        //then create the room members in room members model
        await RoomMember.create({
            room,
            member:senderUser
        })
        const receiverUser =  await User.findOne({
            username:receiver
        })
        await RoomMember.create({
            room,
            member:receiverUser
        })
    }

    

    const dbMessage = await Message.create({
        message,
        sender:senderUser,
        room,
        oneToOne:true,
        messageType:MESSAGE_TYPES.USER_MSG
    })
    console.log("db message creation finished")
    
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
        io.to(room.name).emit(MESSAGE,message)
    }
    else{
        console.log("io is null")
    }
    



}

export const getChatMessagesOfRoom = async (requestPayload:any)=>{
    //todo in future currentchatter will be from authentication
    const {roomName, currentChatter} = requestPayload

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