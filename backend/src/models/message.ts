import mongoose from "mongoose";
import { IUser } from "./user";
interface IMessage extends mongoose.Document{
    message:string,
    created_at:Date,
    updated_at:Date,
    sender:string|IUser,
    room:string,
    one_to_one:boolean
}

const messsageSchema = new mongoose.Schema<IMessage>({
    message:{
        type:String,
        required:true
    },
    created_at:Date,
    updated_at:Date,
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    room:{
        type:String,
        required:true
    },
    one_to_one:{
        type:Boolean,
        required:true
    }
})

interface IMessageMethods extends mongoose.Model<IMessage>{
    //add static methods later here
}

const Message = mongoose.model<IMessage, IMessageMethods>('Message', messsageSchema)
export {Message, IMessage}