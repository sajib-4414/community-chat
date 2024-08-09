import { LoggedInUser, User } from "../../models/user.models";
import { useAppSelector } from "../../store/store";
import Moment from "moment";
import { Message } from "../../models/message.models";
import { useState } from "react";
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
    return sender.username === loggedinUser?.user.username
      ? "chat-message-right mb-4" 
      : "chat-message-left pb-4";
  });
  const [isSender] = useState(() => {
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

  return (
    // <>
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

      {/* <div className="chat-message-left pb-4">
        <div>
          <img
            src="https://bootdey.com/img/Content/avatar/avatar3.png"
            className="rounded-circle mr-1"
            alt="Sharon Lessman"
            width="40"
            height="40"
          />
          <div className="text-muted small text-nowrap mt-2">2:44 am</div>
        </div>
        <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
          <div className="font-weight-bold mb-1">Sharon Lessman</div>
          Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal
          commodo.
        </div>
      </div> */}
    {/* </> */}

    //     <li key={props.message._id} className={`${rowClassName}`}>
    //         { !isSender?<img
    //         className="chat-avatar"
    //         src={avatarImage}/>:''}
    //     <div className={`talk-bubble tri-right ${bubbleClassName}`}>
    //         <div className="talktext">
    //         <p>{props.message.message}</p>
    //         <small>Sent by - {sender.username}</small>
    //         </div>
    //     { isSender && (!props.message.createdAt)?<small>Sending</small>:''}

    //     </div>

    //     { isSender?<img
    //         className="chat-avatar"
    //         src={avatarImage}/>:''}

    // </li>
//   );
};
