import mongoose from "mongoose";
import { IRoom } from "./room";
import { IUser } from "./user";

interface IRoomMember{
    room:string|IRoom,
    member:string|IUser
}

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
    }
})

export const RoomMember = mongoose.model<IRoomMember>('RoomMember', roomMemberSchema)