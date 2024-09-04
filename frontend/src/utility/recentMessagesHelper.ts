import {   RecentChatItem, ServerMessagePayload } from "../models/message.models";
import { User } from "../models/user.models";
import { ROOM_TYPE } from "./constants";

//updates the recent chats when a new message is received from scoekt
export const getUpdatedChatsOnSocketMessage = (currentChatingWith:User|null, messagePayload:ServerMessagePayload, currentUser:User, recentChats:RecentChatItem[])=>{

    console.log('printing message payl;oad',messagePayload)
    //Creating a new recent Chat item to push to the Recent Chat List
    //second User is the user with who current user is chatting with
    if(messagePayload.room.privateRoomMembers && messagePayload.room.roomType === ROOM_TYPE.ONE_TO_ONE){
        //its for one to one chat
        const secondUser:User|undefined = messagePayload.room.privateRoomMembers.find(user=>user._id !== currentUser._id)
        console.log('second user is identified as',secondUser)
        const latestChatItem:RecentChatItem = {
            latestMessage:messagePayload.message,
            secondUser,
            room:messagePayload.room,
            isUnread:secondUser!._id === currentChatingWith?._id? false:true
        }
            //Checking if there is a Recent message Itgem already from the secondUser
        const existingchatIndex = recentChats.findIndex((ps:RecentChatItem)=> ps.secondUser&& ps.secondUser._id === secondUser!._id)
        if(existingchatIndex !=-1){
            //there is already chat of the new message sender at this moment, so we need to pop it first, 
            //we dont want to show more messages  just from one sender
            const currentPastMessages = structuredClone(recentChats)
            currentPastMessages.splice(existingchatIndex,1)
            currentPastMessages.push(latestChatItem)
            currentPastMessages.sort((a,b)=>{
                const dateA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
                const dateB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            console.log('upon socket new pasmessage is', currentPastMessages)
            return currentPastMessages
        }
            
    
        else{
            //there is no existing chat in the recent chat items from this user(who messaged current user)
            const currentPastMessages = structuredClone(recentChats)
            currentPastMessages.push(latestChatItem)
            currentPastMessages.sort((a,b)=>{
                const dateA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
                const dateB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            console.log('upon socket new pasmessage is v2', currentPastMessages)
            return currentPastMessages
        }
    }
    else if((!messagePayload.room.privateRoomMembers ||messagePayload.room.privateRoomMembers.length===0)  && messagePayload.room.roomType === ROOM_TYPE.GROUP_CHAT){
        // const secondUser:User|undefined = messagePayload.room.privateRoomMembers.find(user=>user._id !== currentUser._id)
        // console.log('second user is identified as',secondUser)
        let unread = true
        if(messagePayload.message.sender){
            if(messagePayload.message.sender._id === currentUser._id)
                unread = false
        }
        const latestChatItem:RecentChatItem = {
            latestMessage:messagePayload.message,
            room:messagePayload.room,
            isUnread:unread
        }
            //Checking if there is a Recent message Itgem already from the same group chat
        const existingchatIndex = recentChats.findIndex((ps:RecentChatItem)=> ps.room._id === messagePayload.room._id)
        if(existingchatIndex !=-1){
            //there is already chat of the new message sender at this moment, so we need to pop it first, 
            //we dont want to show more messages  just from one sender
            const currentPastMessages = structuredClone(recentChats)
            currentPastMessages.splice(existingchatIndex,1)
            currentPastMessages.push(latestChatItem)
            currentPastMessages.sort((a,b)=>{
                const dateA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
                const dateB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            console.log('upon socket new pasmessage is', currentPastMessages)
            return currentPastMessages
        }
            
    
        else{
            //there is no existing chat in the recent chat items from this user(who messaged current user)
            const currentPastMessages = structuredClone(recentChats)
            currentPastMessages.push(latestChatItem)
            currentPastMessages.sort((a,b)=>{
                const dateA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
                const dateB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            console.log('upon socket new pasmessage is v2', currentPastMessages)
            return currentPastMessages
        }
    }
    


}