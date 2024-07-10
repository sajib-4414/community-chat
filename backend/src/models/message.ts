import mongoose from "mongoose";
import { IUser } from "./user";
import { IRoom } from "./room";
import { MESSAGE_TYPES } from "../definitions/room_message_types";
interface IMessage extends mongoose.Document{
    message:string,
    createdAt:Date,
    updatedAt:Date,
    sender:string|IUser,
    reciever:string|IUser,
    room:string|IRoom,
    oneToOne:boolean,
    messageType:MESSAGE_TYPES,
    isUnread:boolean
}

const messsageSchema = new mongoose.Schema<IMessage>({
    message:{
        type:String,
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:false //because for group channel we dont have a set reciver, receiver is everybody, so it be null that time
    },
    room:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required:true
    },
    oneToOne:{
        type:Boolean,
        default:false
    },
    messageType:{
        type:String,
        enum:MESSAGE_TYPES
    },
    isUnread:{
        type:Boolean,
        default:false
    }
}, {timestamps: true})

interface IMessageMethods extends mongoose.Model<IMessage>{
    //add static methods later here
}

const Message = mongoose.model<IMessage, IMessageMethods>('Message', messsageSchema)
export {Message, IMessage}