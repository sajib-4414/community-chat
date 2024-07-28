import React, { memo, useEffect } from "react";
import avatarImage from './../../assets/test_avatar_image.jpg';
import { MessageWithAlternateUser } from "../../interfaces/MessageInterfaces";
export interface RowProps{
    imessage: MessageWithAlternateUser
}
const RowComp:React.FC<RowProps> = ({imessage})=>{
    useEffect(()=>{
        console.log('props=',imessage)
    },[])
    return(
        <div className="chat-row">
            <img 
            className="chat-avatar-small"
            src={avatarImage}/>
            <div>
                <p className="flex-recent-contact-name">
                <strong>
                <span>{imessage.user_chatting_with.name && imessage.user_chatting_with.name!==""?imessage.user_chatting_with.name:imessage.user_chatting_with.username}</span>
            </strong>

                {imessage.user_chatting_with.isOnline===false 
                || imessage.user_chatting_with.isOnline ===undefined ?
                <span className="chat-status-recent chat-inactive">&#8203;</span>:
                <span className="chat-status-recent chat-active">&#8203;</span>
                } 
                
                </p>
            
            <p>{imessage.latest_message.message}</p>
                                    </div>
        </div>
    )
}
export const ChatRecentRow = memo(RowComp)