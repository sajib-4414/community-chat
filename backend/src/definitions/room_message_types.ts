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

export interface MessageWithRoom{
    room:null|string|IRoom,
    message:IMessage|string,
}


// export interface IRoomWithLatestMessage{
//     _id?:string,
//     roomdetails:string|IRoom,
//     latest_message:IMessage,
//     receiver:IUser;//means other party, lke if use1 is talking to user2, then its user2.
// }

// export class RoomWithLatestMessage implements IRoomWithLatestMessage{
//     roomdetails:string|IRoom;
//     latest_message:IMessage;
//     receiver:IUser;
//     constructor(roomdetails:string|IRoom, latest_message:IMessage, receiver:IUser ){
//         this.roomdetails = roomdetails;
//         this.latest_message = latest_message;
//         this.receiver = receiver;
//     }
// }

//used when we query to find all user's rooms
export interface roomsListItemMongoResponse{
    _id:string,
    roomdetails:IRoom
}