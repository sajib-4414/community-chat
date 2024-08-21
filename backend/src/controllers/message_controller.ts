import {  Request, Response } from "express";
import { addNewSocketIdToUser, deleteSocketIdFromUser, getChatMessagesOfRoom, getPastOneToOneChats, getUnreadMessageInfo, joinAllChatRooms } from "../services/message_service";

import { HTTP_200_OK, HTTP_204_NO_CONTENT } from "../definitions/http_constants";
import { IMessage, Message } from "../models/message";

import {  MESSAGE_TYPES, MessageUnreadItem, MessageWithRoom, ROOM_TYPE } from "../definitions/room_message_types";
import { Room } from "../models/room";
import { RoomMember } from "../models/room-member";


//get all messages of a channel, espeicaily user opened the chat window with a person
//right now of a one to one channel
export const getChatMessagesInRoom = async (req:Request, res:Response)=>{
    const chatRequest = req.body
    const loggedInUser = req.user
    const conversationMessages:IMessage[] = await getChatMessagesOfRoom(loggedInUser, chatRequest)

    res.json(conversationMessages)
}

//to show the recent messages in the frotnennd
export const getPastChatsOfUser = async (req:Request, res:Response)=>{
    const pastChats:MessageWithRoom[] = await getPastOneToOneChats(req.user)
    const unreadRoomData:MessageUnreadItem[] = await getUnreadMessageInfo(req.user)
    const response = {
        pastChats:pastChats,
        unreadItems:unreadRoomData
    }
    res.status(HTTP_200_OK).json(response)
}

//make the socket join all the rooms that user is part of,
//frotnend will call this api upon entering the chat page
//so user is subscribed to get messages of the channels he was part of
export const joinAllRooms = async(req:Request, res:Response)=>{
    const {socketId} = req.body
    await joinAllChatRooms(req.user, socketId)
    console.log('user has been joined to all rooms')
    res.status(HTTP_204_NO_CONTENT).json({})
}

//fritnend calls this api to add the user's socket id to here.
export const addUserSocket = async(req:Request, res:Response)=>{
    const {socketId} = req.body
    addNewSocketIdToUser(req.user, socketId)

    
    res.status(HTTP_204_NO_CONTENT).json({})
}

//fritnend calls this api to delete the user's socket id to here.
export const deleteUserSocket = async(req:Request, res:Response)=>{
    const {socketId} = req.body
    deleteSocketIdFromUser(req.user, socketId)
    res.status(HTTP_204_NO_CONTENT).json({})
}

export const createChatGroup = async(req:Request, res:Response)=>{
    const {userIds} = req.body
    //first create a room
    const room = await Room.create({
        name: 'Room by '+req.user.name,
        code: 'group-chat-room-created-by-'+req.user.username+"-"+ Number((new Date)),
        roomType:ROOM_TYPE.GROUP_CHAT,
        createdAt:req.user._id
    })

    //then enroll everybody in the room
    //create a bulk insert object
    const dateNow = new Date()
    const bulkInsert = userIds.map((userId:string) => {
        return {
            room,
            member:userId,
            joinedAt: dateNow
        }
    });
    //create all room members at once
    await RoomMember.insertMany(bulkInsert)
    //create a first system message in the room
    const message = await Message.create({
        message: `${req.user.name} Created the group`,
        room:room._id,
        messageType:MESSAGE_TYPES.SYSTEM_MSG,
        messageRoomType:ROOM_TYPE.GROUP_CHAT,
    })
    const messagePayLoadResponse:MessageWithRoom = {
        room,
        message
    }
    res.status(HTTP_204_NO_CONTENT).json(messagePayLoadResponse)
}
