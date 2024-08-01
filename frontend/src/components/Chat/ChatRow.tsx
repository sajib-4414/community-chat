import { LoggedInUser, User } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import avatarImage from './../../assets/test_avatar_image.jpg';
import { Message } from "../../models/message.models";
import { useState } from "react";

interface ChatRowProps{
    message:Message
}

export const ChatRow:React.FC<ChatRowProps> = (props:ChatRowProps)=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const [sender] = useState(props.message.sender as User)
    const [bubbleClassName] = useState(()=>{
        const sender = props.message.sender as User
        return sender.username === loggedinUser?.user.username ?   "btm-right":"left-in"
    })
    const [rowClassName] = useState(()=>{
        const sender = props.message.sender as User
        return sender.username === loggedinUser?.user.username ? "arrived-message" : "own-message"
    })
    const [isSender] = useState(()=>{
        return sender.username === loggedinUser?.user.username
    })

    return(
        <li key={props.message._id} className={`${rowClassName}`}>
            { !isSender?<img 
            className="chat-avatar"
            src={avatarImage}/>:''}
        <div className={`talk-bubble tri-right ${bubbleClassName}`}>
            <div className="talktext">
            <p>{props.message.message}</p>
            <small>Sent by - {sender.username}</small>
            </div>
        { isSender && (!props.message.createdAt)?<small>Sending</small>:''}
        

        </div>
        
        { isSender?<img 
            className="chat-avatar"
            src={avatarImage}/>:''}
        
        
    </li>
    )
}