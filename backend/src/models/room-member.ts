import mongoose from "mongoose";
import { RoomType, UserType } from "./groups.friends.models";

interface IRoomMember{
    room:RoomType,
    member:UserType,
    joinedAt:Date,
}

//will be used for group chat only
const roomMemberSchema = new mongoose.Schema<IRoomMember>({
    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required:true
    },
    member:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    joinedAt:{
        type:Date,
    }
})

export const RoomMember = mongoose.model<IRoomMember>('RoomMember', roomMemberSchema)