import express from 'express'
import { addUserSocket, deleteUserSocket, getChatMessagesInRoom, getPastChatsOfUser, joinAllRooms, sendFirstMessage } from '../controllers/message_controller'
import { authorizedRequest } from '../middlewares/auth.error'
const router = express.Router()

//fetch all messges of a current chat user is doing, either within a group or with a contact
router.post('/all-messages', authorizedRequest, getChatMessagesInRoom)

//for sending message via API, will be out of work soon
router.post('/message', authorizedRequest, sendFirstMessage)

//for the recent chat section on UI, retrieve all the room's[including private/group chat] last message and room info
router.get('/past-chats', authorizedRequest, getPastChatsOfUser)

//make the user's socket join all the room user is a part of
router.post('/join-all', authorizedRequest, joinAllRooms)

//send user's socketId once user connected, adds it to the DB, will be used later to throw messages
router.post('/add-socket', authorizedRequest, addUserSocket)

//delete the socket from the user who logged out/disconnected, so user wont get instannt messages, also for cleanup
router.post('/delete-socket', authorizedRequest, deleteUserSocket)
export {router as messageRouter}