import { MESSAGE_TYPES, ROOM_TYPE } from "../utility/constants";
import { User } from "./user.models";

export interface Message {
    _id?:string;
    message:string,
    createdAt?:Date,
    updatedAt?:Date,
    sender?:string|User,
    room?:string|Room,
    oneToOne:boolean,
    messageType:MESSAGE_TYPES
}

export interface MessagePayLoadToServer{
    messageRoomType: ROOM_TYPE,
    targetUser?: User|null,//it will be empty for groupchats
    senderUser?:User|null,
    message:string,
    room?:Room|null
}

export interface Room {
    _id:string;
    name:string,
    code:string,
    roomType:ROOM_TYPE,
    createdAt:Date,
    updatedAt:Date,
    createdBy:string|User,
    privateRoomMembers:User[],
}

export interface ServerMessagePayload{
    room:Room,
    message:Message,
}

export interface MessageUnreadItem{
    _id:string;
    user: User;
    lastSeenAt:Date;
    unread:boolean;
    room:Room;
}

export interface pastChatResponse{
    pastChats:ServerMessagePayload[],
    unreadItems:MessageUnreadItem[]
}

//This is for the recent chats bar,will be used to show the other user
//like user1 was chatting with user2
//in the recent window it must show user2 when user1 sees the recent chats
//in the recent window it must show user1 when user2 sees the recent chats
export interface RecentChatItem{
    latestMessage:Message,
    secondUser:User;
    room:Room;
    isUnread:boolean;
}