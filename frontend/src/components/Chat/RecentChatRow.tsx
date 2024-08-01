import React, { memo, useEffect } from "react";
import avatarImage from './../../assets/test_avatar_image.jpg';
import { RecentChatItem } from "../../models/message.models";
export interface RowProps{
    imessage: RecentChatItem
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
                <span>{imessage.secondUser.name && imessage.secondUser.name!==""?imessage.secondUser.name:imessage.secondUser.username}</span>
                
            </strong>
                
                {imessage.secondUser.isOnline===false 
                || imessage.secondUser.isOnline ===undefined ?
                <span className="chat-status-recent chat-inactive">&#8203;</span>:
                <span className="chat-status-recent chat-active">&#8203;</span>
                } 
                </p>
            
            <p>{imessage.latestMessage.message}</p>
                                    </div>
        </div>
    )
}
const areEqual = (prevProps:RowProps, nextProps:RowProps) => {
    // Only re-render if count has changed
    return prevProps.imessage.secondUser.isOnline === nextProps.imessage.secondUser.isOnline;
};
export const ChatRecentRow = memo(RowComp,areEqual)