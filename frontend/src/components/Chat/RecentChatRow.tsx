import React, {  useEffect } from "react";
import { RecentChatItem } from "../../models/message.models";
import { ROOM_TYPE } from "../../utility/constants";
import { getInitialsFromRoom, getInitialsFromUser } from "../../utility/stringherlper";
const env = await import.meta.env;
const SERVER_URL = env.MODE === 'production'?`${window.location.origin}`: "http://localhost:3001"
export interface RowProps{
    imessage: RecentChatItem
    isCurrentlyChosen:boolean
}
const RowComp:React.FC<RowProps> = ({imessage,isCurrentlyChosen})=>{
    useEffect(()=>{
        //  console.log('I am recent chat row, rendered,props=',imessage)
    },[imessage])
    const getDisplayName = ()=>{
        if(imessage.secondUser && imessage.secondUser.name && imessage.secondUser.name!=="")
            return imessage.secondUser.name
        else if(imessage.secondUser && imessage.secondUser.username)
            return imessage.secondUser.username
        else if(imessage.room.roomType===ROOM_TYPE.GROUP_CHAT){
            return imessage.room.name
        }
    }

    const getUserIsOnline = ()=>{
        if(!imessage.secondUser || imessage.secondUser.isOnline===false 
            || imessage.secondUser.isOnline ===undefined)
            return false
        else
            return true
    }
    const getBackGroundColor = ()=>{
        if (isCurrentlyChosen)
            return ' bground-selected'
        if(imessage.isUnread==true)
            return ' bground-dark-blue'
        else
            return ''
    }

    return(

        <a href="#" className="list-group-item list-group-item-action border-0 ">
            {/* <pre>{JSON.stringify(imessage, null, 2)}</pre> */}
							
			<div className={`d-flex align-items-start`+getBackGroundColor()}>
                {imessage.secondUser && imessage.secondUser.profileImage && imessage.room.roomType===ROOM_TYPE.ONE_TO_ONE && 
                <img 
                    src={`${SERVER_URL}${imessage.secondUser.profileImage}`}
                    className="rounded-circle mr-1" 
                    alt="photo"
                    width="40" 
                    height="40"/>
                }
                {imessage.secondUser && !imessage.secondUser.profileImage && imessage.room.roomType === ROOM_TYPE.ONE_TO_ONE &&
                                <div data-initials={getInitialsFromUser(imessage.secondUser!)}></div>}
                {imessage.room.roomType === ROOM_TYPE.GROUP_CHAT &&
                                <div data-initials={getInitialsFromRoom(imessage.room)}></div>}
                                
								
								<div className="flex-grow-1 ml-3">
                                    <span 
                                    
                                    style={{fontWeight:(imessage.isUnread==true?'bold':'normal')}}
                                    >{getDisplayName()} </span>
                                {
                                    imessage.secondUser ? !getUserIsOnline() ? 
                                        <span className="circle-custom bg-warning">&#8203;</span>
                                        :
                                        <div className="circle-custom bg-success">&#8203;</div>
                                    :''
                                }
                                
                                
                                
                                
									<div className="small">{imessage.latestMessage.message}</div>
								</div>
							</div>
	    </a>



      
    )
}
// const areEqual = (prevProps:RowProps, nextProps:RowProps) => {
//     // Only re-render online status changed or unread status changed
//     const isOnlineStatusChanged = prevProps.imessage?.secondUser?.isOnline === nextProps.imessage?.secondUser?.isOnline
//     const isUnreadStatusChanged = prevProps.imessage.isUnread === nextProps.imessage.isUnread
//     return isOnlineStatusChanged || isUnreadStatusChanged;
// };
export const ChatRecentRow = RowComp
// memo(RowComp,areEqual)