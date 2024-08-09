import { getIoInstance } from "../config/socketInstance"
import { IMessage, Message } from "../models/message"
import { IRoom, Room } from "../models/room"
import { RoomMember } from "../models/room-member"
import { IUser, IUserSocket, UserRoomLastSeen, UserSocket } from "../models/user"
import { roomsListItemMongoResponse, MessageWithRoom, PastChatAggegationResponseItem, MessageUnreadItem } from "../definitions/room_message_types"


export const getChatMessagesOfRoom = async (loggedInUser:IUser, requestPayload:any)=>{
    //todo in future check current user authorized to get chat data of this room

    const {targetUser, messageRoomType, room:payloadRoom} = requestPayload


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
        

      })

      if(!room){
        console.log('room does not exist')
        return []
      }
    }

    //case2 targetUser is also not Null[as UI can see private room members and fuind out the target User], but room is Not null, means user clicked a recent one to one chat, and requesting history
    //coming here means room is there, either we find it from db or from API request

    if(room  && targetUser._id !=""){
      messages = await Message.find({
        room:room
      }).populate('sender')

    }

    //we also mark this user's last activity in the room, as user tried to see the past messages.
    await UserRoomLastSeen.updateOne(
      //matching conditions
      {
          user: loggedInUser,
          room
      },
      //what to update
      {
          lastSeenAt:new Date()
      },
      {
          upsert:true //create if does not exist
      }
  )
    
    return messages;
}

export const getPastOneToOneChats = async (user:IUser)=>{

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

      room.privateRoomMembers = [psitem.user_detail, user]
      const message = psitem.message
      return {
        room,
        message
      }
    })
    return modified_past_one_to_one_chats;
}

export const getUnreadMessageInfo = async(user:IUser)=>{
  const unreadItems:MessageUnreadItem[]  = await UserRoomLastSeen.aggregate(
    [
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "rooms",
            localField: "room",
            foreignField: "_id",
            as: "roomdetails",
          },
      },
      {
        $unwind:
          /**
           * path: Path to the array field.
           * includeArrayIndex: Optional name for index.
           * preserveNullAndEmptyArrays: Optional
           *   toggle to unwind null and empty values.
           */
          {
            path: "$roomdetails",
            preserveNullAndEmptyArrays: false,
          },
      },
      {
        $addFields: 
          {
            unread: {
              $cond:{
                if:{ $lt:["$lastSeenAt", "$roomdetails.lastMessageAt"]},
                then: true,
                else: false
              }
            }
          }
        
      },
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          room: "$roomdetails",
          unread:1,
          user:1,
          lastSeenAt:1
        }
      }
      
    ]
  )
  return unreadItems
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

  const updatedUserSocket: IUserSocket | null = await UserSocket.findOneAndUpdate(
    { user },
    { $set: { socketIds: [socketId] } },
    { new: true, upsert: true } // Options: new returns updated document, upsert creates new if not found
  );
  
}

export const deleteSocketIdFromUser = async (user:IUser, socketId:string)=>{
  //htis also updates user's online status to false
  const userSocket:IUserSocket|null = await UserSocket.findOne({
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
    user.isOnline = false
    await user.save()

    //also make the socket leave all rooms user is in.
}