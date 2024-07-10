import mongoose from "mongoose";
import { IUser } from "./user";
import { IRoom } from "./room";
import { MESSAGE_TYPES } from "../definitions/room_message_types";
interface IMessage extends mongoose.Document{
    message:string,
    createdAt:Date,
    updatedAt:Date,
    sender:string|IUser,
    room:string|IRoom,
    oneToOne:boolean,
    messageType:MESSAGE_TYPES
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
    }
}, {timestamps: true})

interface IMessageMethods extends mongoose.Model<IMessage>{
    //add static methods later here
}

const Message = mongoose.model<IMessage, IMessageMethods>('Message', messsageSchema)
export {Message, IMessage}