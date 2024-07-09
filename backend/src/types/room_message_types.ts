import { IMessage } from "../models/message";
import { IRoom } from "../models/room";
import { IUser } from "../models/user";

export enum ROOM_TYPE {
    ONE_TO_ONE = "one_to_one",
    GROUP_CHAT = "group_chat",
    CHANNEL_CHAT = "channel_chat"
}

export enum MESSAGE_TYPES{
    SYSTEM_MSG = "system_message",
    USER_MSG = "user_message"
}
export interface IRoomWithLatestMessage{
    _id:string,
    roomdetails:string|IRoom,
    latest_message:IMessage,
    receiver:IUser
}