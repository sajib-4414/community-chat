import { useEffect, useRef, useState } from "react";
import './chathome.css'
import { socket } from "../socket";
import avatarImage from './../assets/test_avatar_image.jpg';
import { useAppSelector } from "../store/store";
import { MESSAGE } from "../constants";
import { LoggedInUser } from "../models/usermodels";
import { axiosInstance } from "../axiosInstance";
import { IRoomWithLatestMessage } from "../interfaces/MessageInterfaces";
export  const ChatHome = ()=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const authHeader = {
        headers: { Authorization: `Bearer ${loggedinUser?.token}` }
    };
    const [contacts, setContacts] = useState<any>([])
    const [currentlyChattingWith, setCurrentlyChattingWith] = useState<any>(null)
    const [currentChatMessages, setCurrentChatMessages] = useState<any>([])
    const [currentMessage, setCurrentMessage] = useState("")
    const [pastChats, setPastChats] = useState<IRoomWithLatestMessage[]>([])
    function onConnect() {
        console.log('socket connected')
    }
    const fetchContacts = async()=>{
        const response = await axiosInstance.get('/auth/users/all')
        const allUsers = response.data
        const usersExceptLoggedInUser = allUsers.filter((user:any)=> user.username!=loggedinUser?.user?.username)
        setContacts(usersExceptLoggedInUser)
    }
    const fetchPastMessages = async()=>{
        console.log('auth header now is',authHeader)
        const response = await axiosInstance.get('/messages/past-chats', authHeader)
        setPastChats(response.data)
    }

    const sendCurrentMessage = async()=>{
        
        //send the first message with api
        if(currentChatMessages.length==0){
            console.log("sent by API.............")
            const users = [loggedinUser?.user.username, currentlyChattingWith.username]
            users.sort()
            const roomName = "pvt-"+users.join("-")

            
            await axiosInstance.post('/messages/message',{
                receiver:currentlyChattingWith, 
                messageRoomName:roomName,
                message:currentMessage,
                socketId:socket.id
            }, authHeader)
            setCurrentMessage("")
        }
        else{
            console.log("sent by socket./...........")
            //if there is message already then send via socket

            //request to server via socket event to join the room
            const users = [loggedinUser?.user.username, currentlyChattingWith.username]
            users.sort()
            const roomName = "pvt-"+users.join("-")

            //does not working joining and sending the message at the same time, 
            // we are doing this inthe server, joining the socket in the room then emitting a message
            // socket.emit(USER_ROOM_JOIN_REQUEST,{
            //     roomName
            // } )

            //then emit the mesasge
            socket.emit(MESSAGE, {
                sender:loggedinUser?.user,//todo this will come from authentiation
                room:roomName,
                message: currentMessage
            } )
            setCurrentMessage("")
        }
    }
    //todo current chatter wont be needed with authentication
    const fetchChatMessages = async (targetUser:any)=>{
        const users = [loggedinUser?.user.username, targetUser.username]
        users.sort()
        const roomName = "pvt-"+users.join("-")
        const response = await axiosInstance.post('/messages/all-messages',{
            roomName,
            currentChatter:loggedinUser?.user.username
        },authHeader)
        setCurrentChatMessages(response.data)

    }
    const handleContactClick = (contact:any)=>{
        setCurrentlyChattingWith(contact)
        fetchChatMessages(contact)
    }
    socket.on(MESSAGE, (dbMessage) => {
        //also now check if the message should go to current chat message or past chat message.
        console.log("new message received",dbMessage)

        setCurrentChatMessages([...currentChatMessages, dbMessage])
        
    });
    useEffect(()=>{
        fetchContacts();
        fetchPastMessages();
        socket.on('connect',onConnect)

        socket.on('foo', (value) => {
            console.log('on foo event value',value)
        });
        


        //this return function works as a cleanup method
        return()=>{
            socket.off('foo');
            socket.off(MESSAGE);
        }

    },[currentChatMessages])

    const handleRecentChatItemClick = (imessage:IRoomWithLatestMessage)=>{
        console.log('clicked')
        handleContactClick(imessage.receiver)
    }

    return <div className="full container">
             {/* left side container  */}
            <div className="contacts-container">
                <div className="chat-contact-search-div">
                    <h3>Chats</h3>
                    <input 
                    className="chat-contact-search"
                    placeholder="Search messages or users"/>
                </div>
                <div className="chat-contacts">
                    <h4> Contacts</h4>
                    <ul>

                    
                    {contacts.map((contact:any,index:number)=>{
                        return (
                            <li 
                            onClick={handleContactClick.bind(this,contact)}
                            key={index}>{contact.username}
                            </li>
                        )
                    })}
                    </ul>
                </div>
                
                <div className="recent-messages">
                    <h4>Recent</h4>
                    <ul>
                        {
                            pastChats.map((imessage:IRoomWithLatestMessage,index)=><li 
                            key={index}
                            onClick={()=>handleRecentChatItemClick(imessage)}
                            >
                                <div className="chat-row">
                                    <img 
                                    className="chat-avatar-small"
                                    src={avatarImage}/>
                                    <div>
                                        <strong><span>{imessage.receiver.name && imessage.receiver.name!==""?imessage.receiver.name:imessage.receiver.username}</span></strong>
                                        <p>{imessage.latest_message.message}</p>
                                    </div>
                                </div>
                            </li>)
                            
                        }
                        

                    </ul>
                </div>
                
            </div>
             {/* right side message container  */}
            <div className="message-container">
                {currentlyChattingWith?
                <>
                    <div className="message-container-header">
                    <div className="message-image-container">
                        <img 
                        className="chat-avatar"
                        src={avatarImage}/>
                        <strong><span>{currentlyChattingWith?currentlyChattingWith.username:''}</span></strong>
                        <span className="chat-active">&#8203;</span>
                        
                    </div>
                    <div className="message-search-more-container">
                        <i className="fa fa-search"></i>
                        <i className="fa fa-ellipsis-h" style={{fontSize:"15px"}}></i>
                    </div>
                </div>
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
                
                <div className="message-container-footer">
                    {currentlyChattingWith?
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
                </>
                :
                    <h3 style={{textAlign:"center"}}>Select a contact to start chatting</h3>}
                
            </div>
        </div>
    
}

const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current!.scrollIntoView());
    return <div ref={elementRef} />;
};