import express from 'express'
import { getChatMessagesInRoom, sendFirstMessage } from '../controllers/message_controller'
import { authorizedRequest } from '../middlewares/auth'
const router = express.Router()

router.post('/all-messages', authorizedRequest, getChatMessagesInRoom) //it will be get later, as we just need authenticated user to get all messages
router.post('/message', authorizedRequest, sendFirstMessage)
export {router as messageRouter}