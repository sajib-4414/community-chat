import express from 'express'
import { getChatMessagesInRoom, getPastChatsOfUser, joinAllRooms, sendFirstMessage } from '../controllers/message_controller'
import { authorizedRequest } from '../middlewares/auth'
const router = express.Router()

router.post('/all-messages', authorizedRequest, getChatMessagesInRoom) //it will be get later, as we just need authenticated user to get all messages
router.post('/message', authorizedRequest, sendFirstMessage)
router.get('/past-chats', authorizedRequest, getPastChatsOfUser)
router.post('/join-all', authorizedRequest, joinAllRooms)
export {router as messageRouter}