import mongoose from "mongoose";
import { IRoom } from "./room";
import { IUser } from "./user";

export type RoomType = IRoom|string;
export type UserType = IUser|string;


export interface IFriend extends mongoose.Document{
    _id:string,
    user1:UserType,
    user2:UserType,
    sender:UserType,
    createdAt:Date,
    updatedAt:Date,
}

const friendSchema = new mongoose.Schema<IFriend>({
    user1:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    user2:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
},{timestamps: true})

export const Friend = mongoose.model<IFriend>('Friend', friendSchema)

export interface IFriendRequest extends mongoose.Document{
    _id:string,
    sender:UserType,
    reciever:UserType,
    isAccepted:false,
    respondTime:Date,
    createdAt:Date,
    updatedAt:Date,
}

const friendRequestSchema = new mongoose.Schema<IFriendRequest>({
    isAccepted:{
        type:Boolean,
        default:false,
    },
    respondTime:{
        type:Date,
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reciever:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
},{timestamps: true})

export const FriendRequest = mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema)