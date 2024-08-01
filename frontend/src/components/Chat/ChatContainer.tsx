import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { LoggedInUser } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import avatarImage from './../../assets/test_avatar_image.jpg';
import { Message, Room, ServerMessagePayload } from "../../models/message.models";
import { axiosInstance } from "../../utility/axiosInstance";
import { ROOM_TYPE } from "../../utility/constants";
import { getAuthHeader } from "../../utility/authenticationHelper";
export interface ChatContainerRef {
    updateChatUponSocketMessage: (messagePayload:ServerMessagePayload) => void;
    fetchCurrentChatMessage: (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null) => void;
}

export const ChatContainer = React.forwardRef((props, ref)=>{
    useImperativeHandle(ref, () => ({
        updateChatUponSocketMessage(messagePayload:ServerMessagePayload){
            setCurrentChatMessages([...currentChatMessages, messagePayload.message])
        },
        fetchCurrentChatMessage(roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null){
            fetchChatMessagesForCurrentChat(roomOrMessageType, targetUser,room)
        }
        
    }));
    const fetchChatMessagesForCurrentChat = async (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null )=>{

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
    }

    const [currentChatMessages, setCurrentChatMessages] = useState<Message[]>([])
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )


    return(
        <div className="message-container-main">
                    
                    <ul 
                    className="chat-message-class-demo"
                    >
                        {currentChatMessages.map((message:any,index:number)=>{
                            if(message.sender.username === loggedinUser?.user.username){
                                return(<li key={index} className="own-message">
                                    <img 
                                        className="chat-avatar"
                                        src={avatarImage}/>
                                    <div className="talk-bubble tri-right left-in">
                                        <div className="talktext">
                                            <p>{message.message}</p>
                                            <small>Sent by - {message.sender.name}</small>
                                        </div>
                                    </div>
                                    
                                </li>)
                            }
                            else{
                                return(<li key={index} className="arrived-message">
                                    <div className="talk-bubble tri-right btm-right">
                                        <div className="talktext">
                                        <p>{message.message}</p>
                                        <small>Sent by - {message.sender.username}</small>
                                        </div>
                                    </div>
                                    <img 
                                        className="chat-avatar"
                                        src={avatarImage}/>
                                    
                                </li>)
                            }
                            
                        })}
                    <AlwaysScrollToBottom />
                    </ul>
                    
                    
                    
                </div>
    )
})

const AlwaysScrollToBottom = () => {
    const elementRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => elementRef.current!.scrollIntoView());
    return <div ref={elementRef} />;
};