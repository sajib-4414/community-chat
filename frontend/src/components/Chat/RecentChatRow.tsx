import React, { memo, useEffect, useState } from "react";
import { RecentChatItem } from "../../models/message.models";
export interface RowProps{
    imessage: RecentChatItem
    isCurrentlyChosen:boolean
}
const RowComp:React.FC<RowProps> = ({imessage,isCurrentlyChosen})=>{
    useEffect(()=>{
        //  console.log('I am recent chat row, rendered,props=',imessage)
    },[imessage])
    const getDisplayName = ()=>{
        if(imessage.secondUser.name && imessage.secondUser.name!=="")
            return imessage.secondUser.name
        else
            return imessage.secondUser.username
    }

    const getUserIsOnline = ()=>{
        if(imessage.secondUser.isOnline===false 
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
								<img src="https://bootdey.com/img/Content/avatar/avatar2.png" className="rounded-circle mr-1" alt="William Harris" width="40" height="40"/>
								<div className="flex-grow-1 ml-3">
                                    <span 
                                    
                                    style={{fontWeight:(imessage.isUnread==true?'bold':'normal')}}
                                    >{getDisplayName()} </span>
                                
                                { !getUserIsOnline()? 
                                    <span className="circle-custom bg-warning">&#8203;</span>
                                    :
                                    <div className="circle-custom bg-success">&#8203;</div>
                                    }
                                
                                
									<div className="small">{imessage.latestMessage.message}</div>
								</div>
							</div>
	    </a>



      
    )
}
const areEqual = (prevProps:RowProps, nextProps:RowProps) => {
    // Only re-render online status changed or unread status changed
    const isOnlineStatusChanged = prevProps.imessage.secondUser.isOnline === nextProps.imessage.secondUser.isOnline
    const isUnreadStatusChanged = prevProps.imessage.isUnread === nextProps.imessage.isUnread
    return isOnlineStatusChanged || isUnreadStatusChanged;
};
export const ChatRecentRow = RowComp
// memo(RowComp,areEqual)