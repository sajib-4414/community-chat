import { Request, Response } from "express";
import { getAllDBUsers, getUserAutoCompleteSearchResult } from "../services/user_services";
import { IUser, User } from "../models/user";
import { BadRequestError, InternalServerError } from "../definitions/error_definitions";
import axios from "axios";
import dotenv from 'dotenv';
import { kilometersToRadian } from "../helpers/utility";
import { Friend, FriendRequest } from "../models/groups.friends.models";
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
    const radiusInKM = Number(radius)
    let aggregateQuery = [
        {
          $match: {
            "location" : {
                  $geoWithin : {
                      $centerSphere : [req.user.location.coordinates, kilometersToRadian(radiusInKM) ]
                  }
              }
          }
        },
      {
          $lookup: {
            from: "friends",  // Name of the friends collection
            let: { userId: "$_id" },  // Define variable for current user's _id
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$user1", "$$userId"] },
                      { $eq: ["$user2", "$$userId"] }
                    ]
                  }
                }
              }
            ],
            as: "friend_info"
          }
        },
        {
          $addFields: {
            isFriend: {
              $cond: { if: { $gt: [{ $size: "$friend_info" }, 0] }, then: true, else: false }
            }
          }
        },
        {
            $lookup: {
              from: "friendrequests",
              // Name of the friends collection
              let: {
                userId: "$_id",
              },
              // Define variable for current user's _id
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$reciever", "$$userId"],
                    },
                  },
                },
              ],
              as: "friend_request_info",
            },
          },
          {
            $unwind: {
              path: "$friend_request_info",
              preserveNullAndEmptyArrays: true
              
            }
          },
          {
            $unwind: {
              path: "$friend_info",
              preserveNullAndEmptyArrays: true
            }
          }
      ]
    const users = await User.aggregate(aggregateQuery)
    res.status(200).json(users)
}

export const addFriend = async(req:Request, res:Response)=>{
    const {reciverId} = req.body
    const friendRequest = await FriendRequest.create({
        sender:req.user,
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

//responding with either yes or No
export const RespondFriendRequest = async(req:Request, res:Response)=>{
    const {reciverId} = req.body
    const friendRequest = await FriendRequest.create({
        sender:req.user,
        reciever:reciverId
    })
    res.status(200).json(friendRequest)
}