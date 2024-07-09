import { Request, Response } from "express";
import { addNewSocketIdToUser, createFirstMessage, deleteSocketIdFromUser, getChatMessagesOfRoom, getPastOneToOneChats, joinAllChatRooms } from "../services/message_service";
import { IUser, IUserSocket, User, UserSocket } from "../models/user";
import { HTTP_200_OK, HTTP_204_NO_CONTENT } from "../types/http_constants";

export const sendFirstMessage = async(req:any, res:Response)=>{
    const messagePayload = req.body

    const sender:IUser = req.user
    await createFirstMessage(sender, messagePayload)
    res.status(HTTP_200_OK).json({})
}

//get all messages of a channel, right now of a one to one channel
export const getChatMessagesInRoom = async (req:Request, res:Response)=>{
    const chatRequest = req.body

    const conversationMessages = await getChatMessagesOfRoom(chatRequest)

    console.log("conversationMessages is", conversationMessages)
    res.json(conversationMessages)
}

//to show the recent messages in the frotnennd
export const getPastChatsOfUser = async (req:any, res:Response)=>{
    
    const pastChats = await getPastOneToOneChats(req.user)
    res.status(HTTP_200_OK).json(pastChats)
}

//make the socket join all the rooms that user is part of,
//frotnend will call this api upon entering the chat page
//so user is subscribed to get messages of the channels he was part of
export const joinAllRooms = async(req:any, res:Response)=>{
    const {socketId} = req.body
    await joinAllChatRooms(req.user, socketId)
    console.log('user has been joined to all rooms')
    res.status(HTTP_204_NO_CONTENT).json({})
}

//fritnend calls this api to add the user's socket id to here.
export const addUserSocket = async(req:any, res:Response)=>{
    const {socketId} = req.body
    addNewSocketIdToUser(req.user, socketId)
    console.log('user socket connected............')
    
    res.status(HTTP_204_NO_CONTENT).json({})
}

//fritnend calls this api to delete the user's socket id to here.
export const deleteUserSocket = async(req:any, res:Response)=>{
    const {socketId} = req.body
    deleteSocketIdFromUser(req.user, socketId)
    console.log('user socket disconnected............')
    
    res.status(HTTP_204_NO_CONTENT).json({})
}