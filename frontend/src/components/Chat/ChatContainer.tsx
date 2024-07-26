import React, { useEffect, useRef } from "react";
import { LoggedInUser } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import avatarImage from './../../assets/test_avatar_image.jpg';
import { IMessage } from "../../interfaces/MessageInterfaces";
interface ChatContainerProps{
    currentChatMessages: IMessage[];
}
export const ChatContainer:React.FC<ChatContainerProps> = ({currentChatMessages})=>{
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
}

const AlwaysScrollToBottom = () => {
    const elementRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => elementRef.current!.scrollIntoView());
    return <div ref={elementRef} />;
};