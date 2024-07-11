
export interface IUser{
    username:string,
    _id?:string,
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
    name:string,
    code:string,
    roomType:ROOM_TYPE,
    createdAt:Date,
    updatedAt:Date,
    createdBy:string|IUser,
    privateRoomMembers:IUser[],
}

export interface MessageWithRoom{
    room:null|string|IRoom,
    message:IMessage|string,
}