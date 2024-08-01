import {  Request, Response } from "express";
import { addNewSocketIdToUser, deleteSocketIdFromUser, getChatMessagesOfRoom, getPastOneToOneChats, joinAllChatRooms } from "../services/message_service";

import { HTTP_200_OK, HTTP_204_NO_CONTENT } from "../definitions/http_constants";
import { IMessage } from "../models/message";

import {  MessageWithRoom } from "../definitions/room_message_types";


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
    
    res.status(HTTP_200_OK).json(pastChats)
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