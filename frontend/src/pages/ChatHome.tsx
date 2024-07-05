import { FC, useEffect, useState } from "react";
import './chathome.css'
import { socket } from "../socket";
import avatarImage from './../assets/test_avatar_image.jpg';
import { useSelector } from "react-redux";
import { IRootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MESSAGE, USER_ROOM_JOIN_REQUEST } from "../constants";
export const ChatHome:FC = ()=>{
    const navigate = useNavigate();
    const [contacts, setContacts] = useState<any>([])
    const [currentlyChattingWith, setCurrentlyChattingWith] = useState<any>(null)
    const [currentChatMessages, setCurrentChatMessages] = useState<any>([])
    const [currentMessage, setCurrentMessage] = useState("")
    function onConnect() {
        console.log('socket connected')
    }
    const fetchContacts = async()=>{
        const response = await axios.get('http://localhost:3001/api/auth/users/all')
        const allUsers = response.data
        const storedUserJson = localStorage.getItem("user")
        const storedUser = JSON.parse(storedUserJson!)
        const usersExceptLoggedInUser = allUsers.filter((user:any)=> user.username!=storedUser.username)
        setContacts(usersExceptLoggedInUser)
        console.log('contacts are',usersExceptLoggedInUser)
    }

    const sendCurrentMessage = async()=>{
        
        //send the first message with api
        if(currentChatMessages.length==0){
            console.log("here")
            const storedUserJson = localStorage.getItem("user")
            const storedUser = JSON.parse(storedUserJson!)
            const users = [storedUser.username, currentlyChattingWith.username]
            users.sort()
            const roomName = "pvt-"+users.join("-")

            
            const response = await axios.post('http://localhost:3001/api/messages/message',{
                sender:storedUser.username,
                receiver:currentlyChattingWith.username, 
                messageRoomName:roomName,
                message:currentMessage,
                socketId:socket.id
            })
            console.log("first message sent, reponse=",response)
            setCurrentMessage("")
        }
        else{
            //if there is message already then send via socket

            //request to server via socket event to join the room
            const storedUserJson = localStorage.getItem("user")
            const storedUser = JSON.parse(storedUserJson!)
            const users = [storedUser.username, currentlyChattingWith.username]
            users.sort()
            const roomName = "pvt-"+users.join("-")

            //does not working joining and sending the message at the same time, 
            // we are doing this inthe server, joining the socket in the room then emitting a message
            // socket.emit(USER_ROOM_JOIN_REQUEST,{
            //     roomName
            // } )

            //then emit the mesasge
            socket.emit(MESSAGE, {
                room:roomName,
                message: currentMessage
            } )
            
            console.log("here2")
            console.log(currentChatMessages)
            setCurrentMessage("")
        }
    }
    //todo current chatter wont be needed with authentication
    const fetchChatMessages = async (targetUser:any)=>{
        console.log("getting previous messages in this room")
        const storedUserJson = localStorage.getItem("user")
        const storedUser = JSON.parse(storedUserJson!)
        const users = [storedUser.username, targetUser.username]
        users.sort()
        const roomName = "pvt-"+users.join("-")
        const response = await axios.post('http://localhost:3001/api/messages/all-messages',{
            roomName,
            currentChatter:storedUser.username
        })
        setCurrentChatMessages(response.data)
        console.log(response.data)
    }
    const handleContactClick = (contact:any)=>{
        console.log("start chatting with",contact)
        setCurrentlyChattingWith(contact)
        fetchChatMessages(contact)
    }
    useEffect(()=>{
        const storedUserJson = localStorage.getItem("user")
        if(storedUserJson){
            const storedUser = JSON.parse(storedUserJson)
            if(storedUser.username === ""){
                navigate('/login');
            }
        }
        else{
            navigate('/login');
        }
        fetchContacts();
        socket.on('connect',onConnect)

        socket.on('foo', (value) => {
            console.log('on foo event value',value)
        });
        socket.on(MESSAGE, (value) => {
            console.log('on message event value',value)
        });
        
        //this return function works as a cleanup method
        return()=>{
            socket.off('foo');
            socket.off(MESSAGE);
        }
    },[])

    const userStore = useSelector((state:IRootState)=>state.userSlice)
    const handleRecentChatItemClick = ()=>{
        console.log('clicked')
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
                <div className="recent-messages">
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
                        <li key="1" onClick={()=>handleRecentChatItemClick()}>
                            <div className="chat-row">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>{userStore.user.username}</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        
                        <li key="2">
                            <div className="chat-row">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        
                        <li key="3">
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li key="4">
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li key="5">
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        
                        
                        
                        
                        
                        
                    </ul>
                </div>
                
            </div>
             {/* right side message container  */}
            <div className="message-container">
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

                </div>
                
                <div className="message-container-footer">
                    <input 
                    value={currentMessage}
                    onChange={(e)=> setCurrentMessage(e.target.value)}
                    className="message-input" 
                    placeholder="Enter Message"/>
                    <div className="message-button-container">
                        <i className="fa fa-image"></i>
                        <i 
                        className="fa fa-paper-plane" aria-hidden="true"
                        onClick={sendCurrentMessage}
                        ></i>
                    </div>
                </div>
            </div>
        </div>
    
}
