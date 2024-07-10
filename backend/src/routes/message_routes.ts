import express from 'express'
import { addUserSocket, deleteUserSocket, getChatMessagesInRoom, getPastChatsOfUser, joinAllRooms, sendFirstMessage } from '../controllers/message_controller'
import { authorizedRequest } from '../middlewares/auth_and_error'
const router = express.Router()

router.post('/all-messages', authorizedRequest, getChatMessagesInRoom) //it will be get later, as we just need authenticated user to get all messages
router.post('/message', authorizedRequest, sendFirstMessage)
router.get('/past-chats', authorizedRequest, getPastChatsOfUser)
router.post('/join-all', authorizedRequest, joinAllRooms)
router.post('/add-socket', authorizedRequest, addUserSocket)
router.post('/delete-socket', authorizedRequest, deleteUserSocket)
export {router as messageRouter}