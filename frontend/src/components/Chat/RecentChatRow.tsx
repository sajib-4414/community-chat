import React, { memo } from "react";
import avatarImage from './../../assets/test_avatar_image.jpg';
import { MessageWithAlternateUser } from "../../interfaces/MessageInterfaces";
export interface RowProps{
    imessage: MessageWithAlternateUser
}
const RowComp:React.FC<RowProps> = ({imessage})=>{
    return(
        <div className="chat-row">
            <img 
            className="chat-avatar-small"
            src={avatarImage}/>
            <div>
            <strong><span>{imessage.user_chatting_with.name && imessage.user_chatting_with.name!==""?imessage.user_chatting_with.name:imessage.user_chatting_with.username}</span></strong> <span className="chat-active">&#8203;</span>
            <p>{imessage.latest_message.message}</p>
                                    </div>
        </div>
    )
}
export const ChatRecentRow = memo(RowComp)