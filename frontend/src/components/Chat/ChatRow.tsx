import { LoggedInUser, User } from "../../models/user.models";
import { useAppSelector } from "../../store/store";
import Moment from "moment";
import { Message } from "../../models/message.models";
import { useState } from "react";
import { MESSAGE_TYPES } from "../../utility/constants";
const env = await import.meta.env;
const SERVER_URL = env.VITE_APP_ROOT_URL || 'http://localhost:3001'; 

interface ChatRowProps {
  message: Message;
}

export const ChatRow: React.FC<ChatRowProps> = (props: ChatRowProps) => {
  const loggedinUser: LoggedInUser | null = useAppSelector(
    (state) => state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
  );
  const [sender] = useState(props.message.sender as User);
  const [rowClassName] = useState(() => {
    const sender = props.message.sender as User;
    if(sender){
      return sender.username === loggedinUser?.user.username
      ? "chat-message-right mb-4" 
      : "chat-message-left pb-4";
    }
    return ""
    
  });
  const [isSender] = useState(() => {
    if (props.message.messageType===MESSAGE_TYPES.SYSTEM_MSG)
      return false
    return sender.username === loggedinUser?.user.username;
  });
  const getProfileImageUrl = ()=>{
    if (isSender)
      return `${SERVER_URL}${loggedinUser?.user.profileImage}`
    else{
      const senderUser = props.message.sender as User
      return `${SERVER_URL}${senderUser.profileImage}`
    }
  }

  if(props.message.messageType === MESSAGE_TYPES.SYSTEM_MSG){
    return (<>
      <div className="bg-info text-white text-center">{props.message.message}</div>
    </>)
  }
  else{
    return (
      <div className={`${rowClassName}`}>
        <div>
          <img
            src={getProfileImageUrl()}
            className="rounded-circle mr-1"
            alt="profile picture"
            width="40"
            height="40"
          />
          <div className="text-muted small text-nowrap mt-2">
            {props.message.createdAt? Moment( props.message.createdAt ).format( "h:mma" ):'' }
          </div>
        </div>
        <div className={`flex-shrink-1 bg-light rounded py-2 px-3 `+isSender?"mr-3":"ml-3"}>
          <div className="font-weight-bold mb-1">{isSender?"You":sender.username}</div>
          {props.message.message}
          { isSender && (!props.message.createdAt)?<p className="text-muted small">Sending</p>:''}
        </div>
        
      </div>)

  }
  
};
