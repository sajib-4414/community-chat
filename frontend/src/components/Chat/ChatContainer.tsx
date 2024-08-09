import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { LoggedInUser, User } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import { Message, Room, ServerMessagePayload } from "../../models/message.models";
import { axiosInstance } from "../../utility/axiosInstance";
import { ROOM_TYPE } from "../../utility/constants";
import { getAuthHeader } from "../../utility/authenticationHelper";
import { ChatRow } from "./ChatRow";
export interface ChatContainerRef {
    updateChatUponSocketMessage: (messagePayload:ServerMessagePayload) => void;
    fetchCurrentChatMessage: (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null) => void;
    pushDummyMessage:(unpublishedMessage:Message)=>void;
}
export interface ChatContainerProps{
    handleClearUnread: (chattingUser:User)=>void;
}

export const ChatContainer = React.forwardRef((props:ChatContainerProps, ref)=>{
    useImperativeHandle(ref, () => ({
        updateChatUponSocketMessage(messagePayload:ServerMessagePayload){
            //checks if the message list has a dummy message, a message shown by UI
            //if yes, and the socket message is sme, we pop the dummy message and push the server message
            if(currentChatMessages.at(-1)?.message === messagePayload.message.message){
                const serverMessages = currentChatMessages.filter((msg)=> msg.message !== messagePayload.message.message)
                serverMessages.push(messagePayload.message)
                setCurrentChatMessages(serverMessages)
            }
            else{
                setCurrentChatMessages([...currentChatMessages, messagePayload.message])
            }
            
        },
        fetchCurrentChatMessage(roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null){
            fetchChatMessagesForCurrentChat(roomOrMessageType, targetUser,room)
        },
        pushDummyMessage(unpublishedMessage:Message){
            setCurrentChatMessages([...currentChatMessages, unpublishedMessage])
        }
        
    }));
	
    const fetchChatMessagesForCurrentChat = async (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null )=>{
		console.log('inside fetching..............')
        const payload:any = {}
        //send whatever info we have to the server
       
         //case 1: one to one chat, user clicked a contact, we dont know the room
        //ensures its the case 1
        if(!room && targetUser){
            payload.targetUser = targetUser //we just know target user, we want to fetch chat info with that user one to one
            payload.messageRoomType = roomOrMessageType//we know for sure what kind of message we want to fetch
            // payload.room=room//for one to one chat when someone clicked contact, room will be None/undefined
        }

        //case 2 user clicked a recent one to one chat, we know the room
        //we also know the target user, that is another user from the room
        if(room && targetUser){
            payload.targetUser = targetUser //target user will be xtracted from the room
            payload.messageRoomType = roomOrMessageType
            payload.room=room//for one to one chat when someone reent chat, we know the room
        }

        //fetch all the past messages for this chat with this person/group
        const response = await axiosInstance.post('/messages/all-messages',payload,getAuthHeader(loggedinUser))
        setCurrentChatMessages(response.data)

		//when you are done, notify the parent component such that this recent item's unread item
		//marker should be gone from the ui
		props.handleClearUnread(targetUser)
    }

    const [currentChatMessages, setCurrentChatMessages] = useState<Message[]>([])
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )


    return(
        <div className="position-relative">
						<div className="chat-messages p-4">
                        {currentChatMessages.map((message:Message, index:number)=>{
                             return <ChatRow key={index} message={message}/>
                            
                         })}
                         <AlwaysScrollToBottom />

							

						</div>
					</div>
      
    )
})

const AlwaysScrollToBottom = () => {
    const elementRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => elementRef.current!.scrollIntoView());
    return <div ref={elementRef} />;
};