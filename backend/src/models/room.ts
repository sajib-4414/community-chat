import mongoose from "mongoose";
import { ROOM_TYPE } from "../definitions/room_message_types";
import { IUser } from "./user";

export interface IRoom extends mongoose.Document{
    _id:string;
    name:string,
    code:string,
    roomType:ROOM_TYPE,
    createdAt:Date,
    updatedAt:Date,
    createdBy:string|IUser,
    privateRoomMembers:IUser[],
    lastMessageAt:Date;
}

const roomSchema = new mongoose.Schema<IRoom>({
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true,
        unique:true,
    },
    roomType:{
        type:String,
        enum:ROOM_TYPE,
        required:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    privateRoomMembers:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:"User",
        required:false
    },
    lastMessageAt:Date
},{timestamps: true})

export const Room = mongoose.model<IRoom>('Room', roomSchema)