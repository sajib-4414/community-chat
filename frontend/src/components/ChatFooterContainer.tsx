import { IUser } from "../interfaces/MessageInterfaces"

interface ChatFooterContainerProps{
    currentlyChattingWith:IUser,
    currentMessage:string,
    setCurrentMessage:(elem:string)=>void;
    sendCurrentMessage:()=>void;
}
export const ChatFooterContainer:React.FC<ChatFooterContainerProps> = (props)=>{
    return(
        <div className="message-container-footer">
                    {props.currentlyChattingWith?
                    <>
                     <input 
                        value={props.currentMessage}
                        onChange={(e)=> props.setCurrentMessage(e.target.value)}
                        className="message-input" 
                        placeholder="Enter Message"
                        onKeyDown={(e)=> e.key === 'Enter' ? props.sendCurrentMessage(): ''}
                    />
                    <div className="message-button-container">
                        <i className="fa fa-image"></i>
                        
                        <i 
                        className="fa fa-paper-plane" aria-hidden="true"
                        onClick={props.sendCurrentMessage}></i>
                    </div>
                    </>
                    : ''}
                   
                </div>
    )
}