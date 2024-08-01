import { useEffect, useRef, useState } from "react";
import './chathome.css'
import { socket } from "../socket";
import avatarImage from './../assets/test_avatar_image.jpg';
import { useAppSelector } from "../store/store";
import { MESSAGE_FROM_SERVER, MESSAGE_TO_SERVER } from "../constants";
import { LoggedInUser, User } from "../models/user.models";
import { axiosInstance } from "../utility/axiosInstance";
import { ChatContainer, ChatContainerRef } from "../components/Chat/ChatContainer";
import { ChatFooterContainer } from "../components/Chat/ChatFooterContainer";
import { SearchBar } from "../components/Chat/SearchBar";
import { ONLINE_STATUS_BROADCAST_FROM_SERVER, ROOM_TYPE, SOCKET_CONNECTED, SOCKET_CONNECTION_ERROR, SOCKET_DISCONNECTED } from "../utility/constants";
import { RecentChats, RecentChatsRef } from "../components/Chat/RecentChatContainer";
import {  RecentChatItem, Room, ServerMessagePayload } from "../models/message.models";
import { getAuthHeader } from "../utility/authenticationHelper";
export  const ChatHome = ()=>{
    
    //All States
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const [contacts, setContacts] = useState<any>([])
    const [currentlyChatContact, setCurrentlyChatContact] = useState<User|null>(null)
    const [currentMessageRoomType, setCurrentMessageRoomType] = useState("")
    const [currentChatRoom, setCurrentChatRoom] = useState<Room|null>(null)
    
    const recentChatRef = useRef();
    const chatContainerRef = useRef()


    //Functions and listeners

    async function deleteSocketFromUser(socketId:string) {
        //we dont need to show any error for this, we can silenty call this api
        await axiosInstance.post('/messages/delete-socket', {
            socketId
        },getAuthHeader(loggedinUser))
    }
    async function onConnect() {
        if(socket.id){
            await joinAllRoomsOfUser(socket.id);
            await addSocketToUser(socket.id);
        }     
    }
    async function onDisconnect() {
        if(socket.id){
            await deleteSocketFromUser(socket.id);
        }  
    }

    const fetchContacts = async()=>{
        const response = await axiosInstance.get('/users/all')
        const allUsers = response.data
        const usersExceptLoggedInUser = allUsers.filter((user:any)=> user.username!=loggedinUser?.user?.username)
        setContacts(usersExceptLoggedInUser)
    }
    const joinAllRoomsOfUser = async (socketId:string)=>{
        const payload = {
            socketId
        }
        console.log(payload)
        await axiosInstance.post('/messages/join-all',payload, getAuthHeader(loggedinUser))
    }
    const addSocketToUser = async(socketId:string)=>{

        await axiosInstance.post('/messages/add-socket', {
            socketId
        },getAuthHeader(loggedinUser))
    }



    const handleContactClick = (contact?:User)=>{
        if(contact){
            //someone wants to do a private chat, and just clicked a contact of a private person
            //1. set currentChat to the contact
            setCurrentlyChatContact(contact)
            //2. set current message type
            setCurrentMessageRoomType(ROOM_TYPE.ONE_TO_ONE)
            //3. set the current room, we cannot get the room info from the contact only, so set it to null
            setCurrentChatRoom(null)

            //4. Now fecth the previous messages of this chat
            if(chatContainerRef.current){
                const chatCointainerReference = chatContainerRef.current as ChatContainerRef
                chatCointainerReference.fetchCurrentChatMessage(ROOM_TYPE.ONE_TO_ONE, contact)
            }
            // fetchChatMessagesForCurrentChat(ROOM_TYPE.ONE_TO_ONE, contact)
        }
        else{
            //someone clicked a group chat name, no contact to send the message to.
            //1. Fetch group messages
        }
        
    }
    socket.on(MESSAGE_FROM_SERVER, (messagePayload:ServerMessagePayload) => {
        //check if the message belong to curent opened(ifopened) chat window or the recent chats

/* this means we have to update the current chat window
user clicked a contact, we dont know the room, we just know contact and its a one to one chat
get the other contact from the room, check out of two parties who is the other one
if they are the one user clicked to chat, then we know we have to update the current chat window */

    if(currentChatRoom===null && currentMessageRoomType===ROOM_TYPE.ONE_TO_ONE && currentlyChatContact){
        const room:Room = messagePayload.room;
        const targetUserFromPayload = room.privateRoomMembers.find(user=>user._id!== loggedinUser?.user._id)
        if(targetUserFromPayload?._id === currentlyChatContact._id){
            if(chatContainerRef.current){
                const chatCointainerReference = chatContainerRef.current as ChatContainerRef
                chatCointainerReference.updateChatUponSocketMessage(messagePayload)
            }
        }
    }

/*user clicked a recent chat[which has room, message both], so we know the chatroom, chat contact[for one to one we can
 retreive from the room, chcking who is the other prtyy]. This case also means we have to update the current chat window*/
    else if(currentChatRoom!==null && currentMessageRoomType===ROOM_TYPE.ONE_TO_ONE && currentlyChatContact){
        // we check is it sure this is the room we got from server
        if(currentChatRoom._id === messagePayload.room._id){
            if(chatContainerRef.current){
                const chatCointainerReference = chatContainerRef.current as ChatContainerRef
                chatCointainerReference.updateChatUponSocketMessage(messagePayload)
            }
        }     
    }

    
/*user has not clicked any contact/recent chat, or the incoming message's room/contact does not 
match with the currently opened chat window's cotnact/room, so we update the recent chat Items.
But We also have to update the recent chat and current chat both if user is currently chatting with someone*/
        else{
            if(loggedinUser){
                if(recentChatRef.current){
                    const recentChatReference = recentChatRef.current as RecentChatsRef
                    recentChatReference.updateRecentChatContainer(messagePayload)
                }
            }
            
        }
        
        
    });
    useEffect(()=>{
        fetchContacts();
        
        if(socket){
            socket.connect()
            socket.on(SOCKET_CONNECTED, onConnect.bind(null));

            socket.on('foo', (value) => {
                console.log('on foo event value',value)
            });
            socket.on(SOCKET_DISCONNECTED,onDisconnect)
            socket.on(SOCKET_CONNECTION_ERROR, (err) => {
                console.log("Socket connection error", err.message); // prints the message associated with the error
            });
            //it will update users online status online, in the recent chat window and later on current chat window as well
            socket.on(ONLINE_STATUS_BROADCAST_FROM_SERVER, ({users}:{users:User[]})=>{
                if (recentChatRef.current) {
                    console.log('recent chat reff is not null sending online braodcast')
                    const recentChatReference = recentChatRef.current as RecentChatsRef
                    recentChatReference.setRecentChatData(users)
                }

            })
        }
        else{
            console.log('socket is undefined in Chat container, socket=',socket)
        }
        
    
        //this return function works as a cleanup method
        return()=>{
            socket.off('foo');
            socket.off(MESSAGE_FROM_SERVER);
            socket.off(MESSAGE_TO_SERVER);
            socket.off(SOCKET_CONNECTED)
            socket.off(SOCKET_DISCONNECTED)
            socket.off(ONLINE_STATUS_BROADCAST_FROM_SERVER)
        }

    },[])

    const handleRecentChatItemClick = (imessage:RecentChatItem)=>{
        const room:Room|null|string = imessage.room
        let targetUser;
        targetUser = imessage.secondUser;

        //someone wants to do a private chat, and just clicked a recent chats with another person
        //1. set currentChat to the contact
        if(targetUser)
            setCurrentlyChatContact(targetUser)
            //2. set current message type
            setCurrentMessageRoomType(ROOM_TYPE.ONE_TO_ONE)
            //3. set the current room, we cannot get the room info from the contact only, so set it to null
            if(room)
                setCurrentChatRoom(room as Room)

        //4. Now fecth the previous messages of this chat
        // fetchChatMessagesForCurrentChat(ROOM_TYPE.ONE_TO_ONE, targetUser)
        if(chatContainerRef.current){
            const chatCointainerReference = chatContainerRef.current as ChatContainerRef
            chatCointainerReference.fetchCurrentChatMessage(ROOM_TYPE.ONE_TO_ONE, targetUser)
        }
    }

    return <div className="full container">
             {/* left side container  */}
            <div className="contacts-container">
                <div className="chat-contact-search-div">
                    <h3>Chats</h3>
                    <SearchBar
                    onSearchResultContactSelected={handleContactClick}
                    />
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
                
                <RecentChats
                ref={recentChatRef}
                handleRecentChatItemClick={handleRecentChatItemClick}
                />
                
                
            </div>
             {/* right side message container  */}
            <div className="message-container">
                {currentlyChatContact?
                <>
                    <div className="message-container-header">
                    <div className="message-image-container">
                        <img 
                        className="chat-avatar"
                        src={avatarImage}/>
                        <strong><span>{currentlyChatContact?currentlyChatContact.username:''}</span></strong>

                        {currentlyChatContact.isOnline===false 
                || currentlyChatContact.isOnline ===undefined ?
                <span className="chat-status-header chat-inactive">&#8203;</span>:
                <span className="chat-status-header chat-active">&#8203;</span>
                } 

                        {/* <span className="chat-active">&#8203;</span> */}
                        
                    </div>
                    <div className="message-search-more-container">
                        <i className="fa fa-search"></i>
                        <i className="fa fa-ellipsis-h" style={{fontSize:"15px"}}></i>
                    </div>
                </div>
                <ChatContainer
                ref={chatContainerRef}
                />
                
                <ChatFooterContainer
                currentlyChattingWith={currentlyChatContact}
                currentRoom={currentChatRoom}
                />
                </>
                :
                    <h3 style={{textAlign:"center"}}>Select a contact to start chatting</h3>}
                
            </div>
        </div>
    
}

