import { Request } from "express";
import { IUser, User } from "../models/user"
import { Friend } from "../models/groups.friends.models";
import { kilometersToRadian } from "../helpers/utility";

export const getAllDBUsers = async ()=>{
    const users = await User.find({});
    return users;
}

//return upto 4 results only for autocomplete search
export const getUserAutoCompleteSearchResult = async (keyword:string)=>{
    const users = await User.find(
        {
            name: {'$regex' : keyword, '$options' : 'i'} //means search with contains or like *keyword*
        }
    ).limit(4)
    return users;
}

export const getAllUserConnections = async(req:Request)=>{
    let aggregateQuery = [
        {
          $match: {
            $expr: {
              $or: [
                {
                  $eq: [
                    "$user1",
                    req.user._id,
                  ],
                },
                {
                  $eq: [
                    "$user2",
                    req.user._id,
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            friend: {
              $cond: {
                if: {
                  $eq: [
                    req.user._id,
                    "$user1",
                  ],
                },
                then: "$user2",
                else: "$user1",
              },
            },
          },
        },
        {
          $addFields: {
            isFriend: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "friend",
            foreignField: "_id",
            as: "friend_info"
          }
        },
        {
          $unwind: {
            path: "$friend_info",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            "_id":0,
            "friend_info.createdAt":0,
            "friend_info.updatedAt":0
          }
        },
        {
              $replaceRoot: {
                  newRoot: {
                      $mergeObjects: ["$friend_info", "$$ROOT"]
                  }
              }
          },
        {
          $project: {
            "friend_info":0
          }
        },
        {
          $addFields: {
            friend_info:{
              "user1":"$user1",
              "user2":"$user2",
              "sender":"$sender",
              "createdAt":"$createdAt",
              "updatedAt":"$updatedAt"
            }
          }
        },
        {
          $project: {
            "createdAt":0,
            "updatedAt":0
          }
        }
      ]
      return await Friend.aggregate(aggregateQuery)
}

export const discoverUsersInRadius = async (user:IUser, radius:string)=>{
    const radiusInKM = Number(radius)
    let aggregateQuery = [
        {
          $match: {
            "location" : {
                  $geoWithin : {
                      $centerSphere : [user.location.coordinates, kilometersToRadian(radiusInKM) ]
                  }
              }
          }
        },
      {
          $lookup: {
            from: "friends",  // Name of the friends collection
            let: { userId: user._id },  // Define variable for current user's _id
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
    return await User.aggregate(aggregateQuery)
}