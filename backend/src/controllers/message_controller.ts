import { Request, Response } from "express";
import { createFirstMessage, getChatMessagesOfRoom } from "../services/message_service";
import { IUser } from "../models/user";
import { HTTP_200_OK } from "../types/http_constants";

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
// const getRecentChatMessages = 