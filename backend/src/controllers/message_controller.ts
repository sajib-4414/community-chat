import { Request, Response } from "express";
import { createMessage, getChatMessagesOfRoom } from "../services/message_service";

export const sendFirstMessage = async(req:Request, res:Response)=>{
    const messagePayload = req.body

    //todo sender should not be in payload, it should be detected via authentication
    await createMessage(messagePayload)
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