import { getIoInstance } from "../config/socketInstance"
import { Message } from "../models/message"
import { IRoom, Room } from "../models/room"
import { RoomMember } from "../models/room-member"
import { IUser, IUserSocket, UserSocket } from "../models/user"
import { MESSAGE_FROM_SERVER } from "../definitions/event_types"
import { MESSAGE_TYPES, ROOM_TYPE, IRoomWithLatestMessage, roomsListItemMongoResponse } from "../definitions/room_message_types"

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

        //now we emit the mssage to the room
        io.to(room.name).emit(MESSAGE_FROM_SERVER,dbMessage)
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

export const getPastOneToOneChats = async (user:IUser)=>{
    const pastChatsOfUser:IRoomWithLatestMessage[] = await RoomMember.aggregate(
        [
            {
              $match: {
                member: user._id
              }
            },
            {
              $project: {
                room:1
              }
            },
            {
              '$lookup': {
                'from': "messages",
                'localField':'room',
                'foreignField':'room',
                'pipeline':[
                  {
                    $sort:{
                      "createdAt":-1
                    },
                  },
                  {
                    $limit:1
                  }
                ],
                'as':'latest_message'
              }
            },
            {
              $lookup: {
                from: "rooms",
                localField: "room",
                foreignField: "_id",
                as: "roomdetails"
              }
            },
            {
              $unwind: {
                path: "$roomdetails",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $unwind: {
                path: "$latest_message",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $lookup: {
                from: "roommembers",
                let: {
                    room_id: "$room" //localField
                },
                pipeline:[
                  {
                    $match:{
                      $expr:{
                        $and:[
                          {
                            $eq:["$room","$$room_id"]
                          },
                          {
                            $ne:["$member", user._id]
                          }
                        ]
                      }
                    }
                  }
                ],
                as: "other_party"
              }
            },
            {
              $unwind: {
                path: "$other_party",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "other_party.member",
                foreignField: "_id",
                as: "receiver"
              }
            },
            {
              $project: {
                other_party:0
              }
            },
            {
              $unwind: {
                path: "$receiver",
                preserveNullAndEmptyArrays: false
              }
            }
            
          ]
    )
      return pastChatsOfUser;
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
  console.log("user is.............",user)
  // let userSocket:IUserSocket|null = await UserSocket.findOne({
  //       user
  //   })
  //   if(!userSocket){
  //       userSocket = await UserSocket.create({
  //           user,
  //           socketIds:[socketId]
  //       })
  //   }
  //   else{
  //       userSocket.socketIds = [socketId]
  //       await userSocket.save()
  //   }
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
}