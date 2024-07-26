import { getIoInstance } from "../config/socketInstance"
import { IMessage, Message } from "../models/message"
import { IRoom, Room } from "../models/room"
import { RoomMember } from "../models/room-member"
import { IUser, IUserSocket, User, UserSocket } from "../models/user"
import { MESSAGE_FROM_SERVER } from "../definitions/event_types"
import { MESSAGE_TYPES, ROOM_TYPE, roomsListItemMongoResponse, MessageWithRoom, PastChatAggegationResponseItem } from "../definitions/room_message_types"
import mongoose from "mongoose"

export const createFirstMessage = async(senderUser:IUser, messagePayload:any)=>{
    //right now sender, receiver is user
    //also for group chat, receiver wont be needed at all, in future
    const {receiver, messageRoomCode, message, socketId} = messagePayload

    //right now only doing one to one message
    //check if room exists
    let room = await Room.findOne({
        code:messageRoomCode
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
        reciever:receiver,
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
        socket.join(room.name);//joining the sender

        //now joining the receiver as well
        const receiverSocket:IUserSocket|null = await UserSocket.findOne({
          user:receiver
        })
        const receiverSocketIds = receiverSocket?.socketIds;
        receiverSocketIds?.forEach((socketId:string,index:number)=>{
          console.log("joinining a room for each socket")
          const socket = io.sockets.sockets.get(socketId);
          if(socket){
            socket.join(room.name);//joining the reciver ids to this room
          }
          else{
            console.log("tried to join reciver to the same room, but socket was null,index=",index)
          }
          
        })

        // //now we emit the mssage to the room
        // const messageWithRoom = new RoomWithLatestMessage(
        //   room,dbMessage,
        // )
        io.to(room.name).emit(MESSAGE_FROM_SERVER,dbMessage)
    }
    else{
        console.log("io is null")
    }
    



}

export const getChatMessagesOfRoom = async (loggedInUser:IUser, requestPayload:any)=>{
    //todo in future check current user authorized to get chat data of this room
    // console.log('requet to get message of current room',requestPayload)
    let {targetUser, messageRoomType, room:payloadRoom} = requestPayload
    // console.log("room name requested is ",roomName)

    // const room = await Room.findOne({
    //     name: roomName
    // })
    // if (!room)
    //     return []

    // const messages = await Message.find({
    //     room
    // }).populate('sender')
    // return messages;


    //we find a room where messagetype is one to one, and authenticated user, and targetUser is the privateRoomList
    //if we find a room, that means its their(use1,user2)'s private room

    let messages:IMessage[] = []
    let room;
    //case 1, targetUser is Not null, and room is Null, as user clicked a user contact from the contact list in the 
    //frontend
    if(!payloadRoom && targetUser){
      room = await Room.findOne({
        roomType:messageRoomType,
        $and:[
          {
            privateRoomMembers:{
              $in:[
                loggedInUser._id
              ]
            }
          },
          {
            privateRoomMembers:{
              $in:[
                targetUser._id
              ]
            }
          }
        ],
        
        // [
        //   loggedInUser._id,
        //   targetUser._id
        // ]
      })
      // console.log('room finding done')
      if(!room){
        console.log('room does not exist')
        //room was never created, means they never chatted before
        //return empty array
        return []
      }
    }

    //case2 targetUser is also not Null[as UI can see private room members and fuind out the target User], but room is Not null, means user clicked a recent one to one chat, and requesting history
    //coming here means room is there, either we find it from db or from API request
    // console.log('here target user is',targetUser)
    if(room  && targetUser._id !=""
    ){
      messages = await Message.find({
        room:room
      }).populate('sender')
      // console.log('messages are',messages)
    }
    
    return messages;
}

export const getPastOneToOneChats = async (user:IUser)=>{
  console.log("user is..........xxxx",user._id)
  //todo simplify query, we dont need much query here, we also dont need receiver
    const pastChatsOfUser:PastChatAggegationResponseItem[] = await Room.aggregate(
      [
        {
          $match: {
            privateRoomMembers: {
              $in: [
                user._id,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "room",
            pipeline: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "message",
          },
        },
        {
          $unwind: {
            path: "$message",
          },
        },
        {
          $unwind: {
            path: "$privateRoomMembers",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "privateRoomMembers",
            foreignField: "_id",
            as: "user_detail"
          }
        },
        {
          $unwind: {
            path: "$user_detail",
            preserveNullAndEmptyArrays: false
          }
        }
        ,
        {
          $match: {
            "user_detail._id":{
              $ne:user._id
            }
          }
        }
        ,
        {
          $project: {
            room: {
              name: "$name",
              _id: "$_id",
              code: "$code",
              roomType: "$roomType",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              createdBy: "$createdBy",
              privateRoomMembers: "$privateRoomMembers",
            },
            message: 1,
            user_detail:1
          },
        }
      ]
    )
    const modified_past_one_to_one_chats:MessageWithRoom[] = pastChatsOfUser.map((psitem)=>{
      const room:IRoom = psitem.room;
      // console.log("inside room is, ",room)
      room.privateRoomMembers = [psitem.user_detail, user]
      const message = psitem.message
      return {
        room,
        message
      }
    })
    // console.log("past chats are....",modified_past_one_to_one_chats)
    return modified_past_one_to_one_chats;
}

export const joinAllChatRooms = async (currentUser:IUser, socketId:string)=>{
  const myRooms:roomsListItemMongoResponse[] = await RoomMember.aggregate([
    {
      $match: {
        member:currentUser._id
      }
    },
    {
      $group: {
        _id: "$member",
        rooms:{
          $push: "$room"
        }
      }
    },
    {
      $unwind: {
        path: "$rooms"
      }
    },
    {
      $lookup: {
        from: "rooms",
        localField: "rooms",
        foreignField: "_id",
        as: "roomdetails"
      }
    },
    {
      $unwind: {
        path: "$roomdetails"
      }
    },
    {
      $project: {
        rooms:0
      }
    }
  ])
  const userRooms = myRooms.map((roomItem:roomsListItemMongoResponse)=> roomItem.roomdetails)
  const io:any = getIoInstance()
  const socket = io.sockets.sockets.get(socketId);
  userRooms.forEach((room:IRoom)=>socket.join(room.name))
}

export const addNewSocketIdToUser = async (user:IUser, socketId:string)=>{

  let updatedUserSocket: IUserSocket | null = await UserSocket.findOneAndUpdate(
    { user },
    { $set: { socketIds: [socketId] } },
    { new: true, upsert: true } // Options: new returns updated document, upsert creates new if not found
  );
}

export const deleteSocketIdFromUser = async (user:IUser, socketId:string)=>{
  let userSocket:IUserSocket|null = await UserSocket.findOne({
        user
    })
    if(!userSocket){
        return;//dont do anything
    }
    else{
      const index = userSocket.socketIds.indexOf(socketId)
      if(index !==-1){
        userSocket.socketIds.splice(index,1)
      }
    }
    //also make the socket leave all rooms user is in.
}