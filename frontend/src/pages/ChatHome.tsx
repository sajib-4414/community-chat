import { useEffect, useRef, useState } from "react";
import './chathome.css'
import { socket } from "../socket";
import { useAppSelector } from "../store/store";
import { MESSAGE_FROM_SERVER, MESSAGE_TO_SERVER, READ_ACKNOWLEDGEMENT_MESSAGE } from "../constants";
import { LoggedInUser, User } from "../models/user.models";
import { axiosInstance } from "../utility/axiosInstance";
import { ChatContainer, ChatContainerRef } from "../components/Chat/ChatContainer";
import { ChatFooterContainer } from "../components/Chat/ChatFooterContainer";
import { SearchBar } from "../components/Chat/SearchBar";
import { ONLINE_STATUS_BROADCAST_FROM_SERVER, ROOM_TYPE, SOCKET_CONNECTED, SOCKET_CONNECTION_ERROR, SOCKET_DISCONNECTED } from "../utility/constants";
import { RecentChats, RecentChatsRef } from "../components/Chat/RecentChatContainer";
import {  Message, RecentChatItem, Room, ServerMessagePayload } from "../models/message.models";
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
    const notifyChatContainer = (unpublishedMessage:Message)=>{
        //this was invoked by the message footer component with the current message as dummy
        //we will send it to the message container
        if(chatContainerRef.current){
            const chatCointainerReference = chatContainerRef.current as ChatContainerRef
            chatCointainerReference.pushDummyMessage(unpublishedMessage)
            // fetchCurrentChatMessage(ROOM_TYPE.ONE_TO_ONE, contact)
        }
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
 //******We also have to update recent chat windoow */  
    if(currentChatRoom===null && currentMessageRoomType===ROOM_TYPE.ONE_TO_ONE && currentlyChatContact){
        // const room:Room = messagePayload.room;
        const targetUserFromPayload = messagePayload.message.sender as User
        if(targetUserFromPayload?._id === currentlyChatContact._id){
            if(chatContainerRef.current){
                const chatCointainerReference = chatContainerRef.current as ChatContainerRef
                chatCointainerReference.updateChatUponSocketMessage(messagePayload)
            }
        }

        //also have to update recent chat window
        if(loggedinUser){
            if(recentChatRef.current){
                console.log('I am telling to update recent chat window ehre v1')
                const recentChatReference = recentChatRef.current as RecentChatsRef
                recentChatReference.updateRecentChatContainer(currentlyChatContact, messagePayload)
            }
        }
        //also send a socket response back that user has seen it, as the chat window is currently open
        socket.emit(READ_ACKNOWLEDGEMENT_MESSAGE, {
            room:messagePayload.room
        })
    }

/*user clicked a recent chat[which has room, message both], so we know the chatroom, chat contact[for one to one we can
 retreive from the room, chcking who is the other prtyy]. This case also means we have to update the current chat window*/
 //******We also have to update recent chat windoow */   
 else if(currentChatRoom!==null && currentMessageRoomType===ROOM_TYPE.ONE_TO_ONE && currentlyChatContact){
        // we check is it sure this is the room we got from server
        if(currentChatRoom._id === messagePayload.room._id){
            if(chatContainerRef.current){
                const chatCointainerReference = chatContainerRef.current as ChatContainerRef
                chatCointainerReference.updateChatUponSocketMessage(messagePayload)
            }
        }
        
        //also have to update recent chat window
        if(loggedinUser){
            if(recentChatRef.current){
                console.log('I am telling to update recent chat window ehre v2')
                const recentChatReference = recentChatRef.current as RecentChatsRef
                recentChatReference.updateRecentChatContainer(currentlyChatContact,messagePayload)
            }
        }
        //also send a socket response back that user has seen it, as the chat window is currently open
        socket.emit(READ_ACKNOWLEDGEMENT_MESSAGE, {
            roomId:messagePayload.room._id
        },(response:any)=>{
            console.log(response)
        })

}

    
/*user has not clicked any contact/recent chat, or the incoming message's room/contact does not 
match with the currently opened chat window's cotnact/room, so we update the recent chat Items.
But We also have to update the recent chat and current chat both if user is currently chatting with someone*/
    else if (currentChatRoom==null && currentlyChatContact==null){
        if(loggedinUser){
            if(recentChatRef.current){
                console.log('actuially updating here......')
                const recentChatReference = recentChatRef.current as RecentChatsRef
                recentChatReference.updateRecentChatContainer(currentlyChatContact, messagePayload)
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
                    // console.log('recent chat reff is not null sending online braodcast')
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
        console.log('recent item clicked..................')
        console.log('this is what i received fromt he recent component, imessage=',imessage)
        const room:Room|null|string = imessage.room
        let targetUser;
        targetUser = imessage.secondUser;

        //someone wants to do a private chat, and just clicked a recent chats with another person
        //1. set currentChat to the contact
        if(targetUser){

            setCurrentlyChatContact(targetUser)
            // console.log('current chat contact has been set as',targetUser)
        }
            
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

   
    const handleClearUnread = (chattingUser:User)=>{
        //notify the recent chat container that for a certain contact/chat,
        //message has been opened, api has already marked the chat as read
        //show it in the ui
        if(recentChatRef.current){
            const recentChatReference = recentChatRef.current as RecentChatsRef
            console.log('passing ref call current contact=',currentlyChatContact)
            recentChatReference.updateRecentItemRead(chattingUser, currentChatRoom)
        }

    }
        return (
            <main className="content">
    <div className="container p-0">

		<h1 className="h3 mb-3">Messages</h1>

		<div className="card">
			<div className="row g-0">
				
				<div className="col-12 col-lg-5 col-xl-3 border-right">

					{/* <div className="px-4 d-none d-md-block">
						<div className="d-flex align-items-center">
							<div className="flex-grow-1">
								<input type="text" className="form-control my-3" placeholder="Search..."/>
							</div>
						</div>
					</div> */}
                    <SearchBar
                    onSearchResultContactSelected={handleContactClick}
                    />
					<h5 className="pl-4 mt-3">Contacts</h5>
					                
					<div className="overflow-auto" style={{maxHeight:"40vh"}}>
					{contacts.map((contact:any,index:number)=>{
                         return (
							<div onClick={handleContactClick.bind(this,contact)} key={index}>
								<a href="#" className="list-group-item list-group-item-action border-0">
							
							<div className="d-flex align-items-start">
								<img src="https://bootdey.com/img/Content/avatar/avatar5.png" className="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40"/>
								<div className="flex-grow-1 ml-3">
								{contact.username}
								{contact.isOnline?
								<div className="small"><span className="fas fa-circle chat-online"></span> Online</div>
								:
								<div className="small"><span className="fas fa-circle chat-offline"></span> Offline</div>
								}
									
								</div>
							</div>
						</a>
							</div>
                         )
                    })}

					</div>

					<RecentChats 
					ref={recentChatRef}
					 handleRecentChatItemClick={handleRecentChatItemClick}
					/>

					
					
					<hr className="d-block d-lg-none mt-1 mb-0"/>
				</div>

				<div className="col-12 col-lg-7 col-xl-9">
					<div className="py-2 px-4 border-bottom d-none d-lg-block">
						<div className="d-flex align-items-center py-1">
                            {currentlyChatContact?
                            <div className="position-relative">
                            <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
                            </div>:''}
							
							<div className="flex-grow-1 pl-3">
                            {currentlyChatContact?
								<strong>{currentlyChatContact.name}</strong>
                                :'Click a user to start chatting'} 
                                {currentlyChatContact?.isOnline===false 
                                    || currentlyChatContact?.isOnline ===undefined ? 
                                    <span className="circle-custom bg-warning">&#8203;</span>
                                    :
                                    <div className="circle-custom bg-success">&#8203;</div>
                                    }
								{/* <div className="text-muted small"><em>Typing...</em></div> */}
							</div>
							
						</div>
					</div>

					<ChatContainer
                    ref={chatContainerRef}
                    handleClearUnread={handleClearUnread}
                    />
                    {currentlyChatContact?
                    <ChatFooterContainer
                    currentlyChattingWith={currentlyChatContact}
                    currentRoom={currentChatRoom}
                    notifyChatContainer={notifyChatContainer}
                    />:''
                }

					

				</div>
			</div>
		</div>
	</div>
</main>
        )
    
}

