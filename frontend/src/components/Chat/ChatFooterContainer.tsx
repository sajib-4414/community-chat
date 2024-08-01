import { useState } from "react";
import { MessagePayLoadToServer, Room } from "../../models/message.models";
import { LoggedInUser, User } from "../../models/user.models";
import { ROOM_TYPE } from "../../utility/constants";
import { useAppSelector } from "../../store/store";
import { socket } from "../../socket";
import { MESSAGE_TO_SERVER } from "../../constants";

interface ChatFooterContainerProps{
    currentlyChattingWith:User,
    currentRoom:Room|null,
}
export const ChatFooterContainer:React.FC<ChatFooterContainerProps> = (props)=>{
    const [currentMessage, setCurrentMessage] = useState("")
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )

    const sendCurrentMessage = async()=>{

        //then emit the mesasge
        const messagePayload:MessagePayLoadToServer = {
            messageRoomType: ROOM_TYPE.ONE_TO_ONE,
            targetUser: props.currentlyChattingWith,//it will be empty for groupchats
            senderUser:loggedinUser?.user,
            message:currentMessage,
            room:props.currentRoom //backend will handle if its null
        }
        socket.emit(MESSAGE_TO_SERVER, messagePayload )
        setCurrentMessage("")
    }

    return(
        <div className="message-container-footer">
                    {props.currentlyChattingWith?
                    <>
                     <input 
                        value={currentMessage}
                        onChange={(e)=> setCurrentMessage(e.target.value)}
                        className="message-input" 
                        placeholder="Enter Message"
                        onKeyDown={(e)=> e.key === 'Enter' ? sendCurrentMessage(): ''}
                    />
                    <div className="message-button-container">
                        <i className="fa fa-image"></i>
                        
                        <i 
                        className="fa fa-paper-plane" aria-hidden="true"
                        onClick={sendCurrentMessage}></i>
                    </div>
                    </>
                    : ''}
                   
                </div>
    )
}