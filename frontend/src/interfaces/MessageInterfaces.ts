
export interface IUser{
    username:string,
    _id?:string,
    id?:string,
    name:string,
    email:string,
}

export enum ROOM_TYPE {
    ONE_TO_ONE = "one_to_one",
    GROUP_CHAT = "group_chat",
    CHANNEL_CHAT = "channel_chat"
}

export enum MESSAGE_TYPES{
    SYSTEM_MSG = "system_message",
    USER_MSG = "user_message"
}

export interface MessagePayLoadToServer{
    messageRoomType: ROOM_TYPE,
    targetUser?: IUser|null,//it will be empty for groupchats
    senderUser?:IUser|null,
    message:string,
    room?:IRoom
}

export interface IMessage {
    message:string,
    createdAt:Date,
    updatedAt:Date,
    sender:string|IUser,
    room:string|IRoom,
    oneToOne:boolean,
    messageType:MESSAGE_TYPES
}

export interface IRoom {
    _id:string;
    name:string,
    code:string,
    roomType:ROOM_TYPE,
    createdAt:Date,
    updatedAt:Date,
    createdBy:string|IUser,
    privateRoomMembers:IUser[],
}

export interface MessageWithRoom{
    room:IRoom,
    message:IMessage,
}

//This is for the recent chats bar,will be used to show the other user
//like user1 was chatting with user2
//in the recent window it must show user2 when user1 sees the recent chats
//in the recent window it must show user1 when user2 sees the recent chats
export interface MessageWithAlternateUser{
    latest_message:IMessage,
    user_chatting_with:IUser;
    room:IRoom;
}