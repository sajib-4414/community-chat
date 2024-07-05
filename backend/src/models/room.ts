import mongoose from "mongoose";
import { ROOM_TYPE } from "../types/room_message_types";
import { IUser } from "./user";

export interface IRoom extends mongoose.Document{
    name:string,
    roomType:ROOM_TYPE,
    createdAt:Date,
    updatedAt:Date,
    createdBy:string|IUser
}

const roomSchema = new mongoose.Schema<IRoom>({
    name:{
        type:String,
        required:true
    },
    roomType:{
        type:String,
        enum:ROOM_TYPE,
        required:true
    },
    createdAt:Date,
    updatedAt:Date,
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})

export const Room = mongoose.model<IRoom>('Room', roomSchema)