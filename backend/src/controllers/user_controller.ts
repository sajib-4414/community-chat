import { Request, Response } from "express";
import { discoverUsersInRadius, getAllDBUsers, getAllGroupChatRoomOfUser, getAllUserConnections, getUserAutoCompleteSearchResult } from "../services/user_services";
import { IUser } from "../models/user";
import { BadRequestError, InternalServerError } from "../definitions/error_definitions";
import axios from "axios";
import dotenv from 'dotenv';
import { Friend, FriendRequest, IFriend, IFriendRequest } from "../models/groups.friends.models";
import { IRoomMember, RoomMember } from "../models/room-member";
import { IRoom } from "../models/room";
dotenv.config()

//to show in the UI all users
export const getAllUsers = async (req:Request, res:Response)=>{
    const all_users:IUser[] = await getAllDBUsers()
    res.json(all_users)
}

//search users
export const searchUsers = async (req:Request, res:Response)=>{
    const {keyword} = req.query;
    if(typeof keyword !== 'string'){
        throw new BadRequestError("Invalid keyword format")
    }
    const users:IUser[] = await getUserAutoCompleteSearchResult(keyword)
    res.json(users)
}

//validate a zip code with opencage
export const validateZipcode = async (req:Request, res:Response)=>{
    const {zip} = req.body
    try{
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${process.env.OPEN_CAGE_API_KEY}&language=en&pretty=1`)
        const actualData = response.data
        const {lat, lng} = actualData.results[0].geometry
        res.status(200).json({
            geolocation:{
                lat,
                lng
            },
            status:'success'
        })
    }catch(err){
        console.log('Geolocation fetch failed, error=',err)
        throw new InternalServerError('Validation check failed, try again with correct data')
    } 
}

//discover people in radius, searches by radius
export const discoverUser = async (req:Request, res:Response)=>{
    const {radius} = req.query;
    const users = await discoverUsersInRadius(req.user, radius!.toString())
    res.status(200).json(users)
}

export const addFriend = async(req:Request, res:Response)=>{
    const {reciverId} = req.body
    const friendRequest = await FriendRequest.create({
        sender:req.user._id,
        reciever:reciverId
    })
    res.status(200).json(friendRequest)
}

//when user has not accepted that friend request
export const RemoveFriendRequest = async(req:Request, res:Response)=>{
    const {reciverId} = req.body
    await FriendRequest.findOneAndDelete({
        sender:req.user,
        reciever:reciverId
    })
    res.status(200).json({
        message:'Request removed'
    })
}

//when user is friends
export const RemoveFriend = async(req:Request, res:Response)=>{
    const {reciverId} = req.body
    let friend = await Friend.findOne({
        user1:req.user,
        user2:reciverId
    })
    if(!friend){
        friend = await Friend.findOne({
            user2:req.user,
            user1:reciverId
        })
    }
    if(!friend)
        throw new BadRequestError("Friend deletion failed")
    await Friend.findByIdAndDelete(friend._id)
    res.status(200).json({
        status:'success'
    })
}

//responding with either accept, deny
export const RespondFriendRequest = async(req:Request, res:Response)=>{
    const {response,reciverId} = req.body
    const updatedFriendRequest:IFriendRequest|null = await FriendRequest.findOneAndUpdate({
      reciever:req.user,
      sender:reciverId
    }, {
      isAccepted:response==="accept"?true:false,
      respondTime:Date.now()
    },
    {returnDocument: 'after'})
    let friend=null;
    if(response === "accept"){
      //if user has accepted, make them friends now
      friend = await Friend.create({
        user1:req.user._id,
        user2:reciverId,
        sender:reciverId
      })
      
    }
    //actually lets delete friend request regardless of whether accepted or not.
    //for both cases we will create a notification
    //also delete the friend request, friend and friend request only one of them can exist
    await updatedFriendRequest?.deleteOne()
    
    res.status(200).json({
      status:response,
      friend_info:friend,
      friend_request_info:updatedFriendRequest
    })
}

export const getConnectionRequests = async(req:Request, res:Response)=>{
  const {type} = req.query
  let friendRequests:IFriendRequest[];
  if (type === "received")
    friendRequests = await FriendRequest.where('reciever').equals(req.user._id).populate('sender');
   else //means sent
    friendRequests = await FriendRequest.where('sender').equals(req.user._id).populate('reciever');
  res.status(200).json(friendRequests)
}
export type UserWithFriend = IUser & { friend_info:IFriend, isFriend:boolean;}
export const getAllConnections = async(req:Request, res:Response)=>{
  const users:UserWithFriend[] = await getAllUserConnections(req)
  res.status(200).json(users)
}

export type RoomMemberAndRoom = IRoomMember & { room: IRoom }
export const getAllGroups = async(req:Request, res:Response)=>{
    const roomMemberWithRoom:RoomMemberAndRoom[] = await getAllGroupChatRoomOfUser(req.user);
    res.status(200).json(roomMemberWithRoom)
}

export const leaveGroup = async(req:Request, res:Response)=>{
    const {groupId} = req.body
    //first check if user is in that group/room
    const roomMember = await RoomMember.findOne({
        member:req.user._id,
        room:groupId
    })
    if(!roomMember)
        throw new BadRequestError('Cannot leave room, user is not in the room')
    await roomMember.deleteOne();
    res.status(200).json({
        message: 'Group successfully left'
    })
}