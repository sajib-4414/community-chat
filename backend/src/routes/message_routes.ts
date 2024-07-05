import express from 'express'
import { getChatMessagesInRoom, sendFirstMessage } from '../controllers/message_controller'
const router = express.Router()

router.post('/all-messages', getChatMessagesInRoom) //it will be get later, as we just need authenticated user to get all messages
router.post('/message', sendFirstMessage)
export {router as messageRouter}