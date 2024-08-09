import {   RecentChatItem, ServerMessagePayload } from "../models/message.models";
import { User } from "../models/user.models";

//updates the recent chats when a new message is received from scoekt
export const getUpdatedChatsOnSocketMessage = (currentChatingWith:User|null, messagePayload:ServerMessagePayload, currentUser:User, recentChats:RecentChatItem[])=>{

    console.log('printing message payl;oad',messagePayload)
    //Creating a new recent Chat item to push to the Recent Chat List
    //second User is the user with who current user is chatting with
    const secondUser:User|undefined = messagePayload.room.privateRoomMembers.find(user=>user._id !== currentUser._id)
    console.log('second user is identified as',secondUser)
    const latestChatItem:RecentChatItem = {
        latestMessage:messagePayload.message,
        secondUser:secondUser!,
        room:messagePayload.room,
        isUnread:secondUser!._id === currentChatingWith?._id? false:true
    }

    //Checking if there is a Recent message Itgem already from the secondUser
    const existingchatIndex = recentChats.findIndex((ps:RecentChatItem)=> ps.secondUser._id === secondUser!._id)
    if(existingchatIndex !=-1){
        //there is already chat of the new message sender at this moment, so we need to pop it first, 
        //we dont want to show more messages  just from one sender
        const currentPastMessages = structuredClone(recentChats)
        currentPastMessages.splice(existingchatIndex,1)
        currentPastMessages.push(latestChatItem)
        currentPastMessages.sort((a,b)=>{
            return(new Date(b.latestMessage.createdAt).getTime()-new Date(a.latestMessage.createdAt).getTime())
        })
        console.log('upon socket new pasmessage is', currentPastMessages)
        return currentPastMessages
    }
            
    
    else{
        //there is no existing chat in the recent chat items from this user(who messaged current user)
        const currentPastMessages = structuredClone(recentChats)
        currentPastMessages.push(latestChatItem)
        currentPastMessages.sort((a,b)=>{
                return(new Date(b.latestMessage.createdAt).getTime()-new Date(a.latestMessage.createdAt).getTime())
        })
        console.log('upon socket new pasmessage is v2', currentPastMessages)
        return currentPastMessages
    }
}