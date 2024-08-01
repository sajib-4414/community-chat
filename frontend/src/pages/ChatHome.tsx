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

   
    // (
        
    // <div className="full container-new">
    //          {/* left side container  */}
    //         <div className="contacts-container">
    //             <div className="chat-contact-search-div">
    //                 <h3>Chats</h3>
    //                 <SearchBar
    //                 onSearchResultContactSelected={handleContactClick}
    //                 />
    //             </div>
    //             <div className="chat-contacts">
    //                 <h4> Contacts</h4>
    //                 <ul>

                    
    //                 {contacts.map((contact:any,index:number)=>{
    //                     return (
    //                         <li 
    //                         onClick={handleContactClick.bind(this,contact)}
    //                         key={index}>{contact.username}
    //                         </li>
    //                     )
    //                 })}
    //                 </ul>
    //             </div>
                
    //             <RecentChats
    //             ref={recentChatRef}
    //             handleRecentChatItemClick={handleRecentChatItemClick}
    //             />
                
                
    //         </div>
    //          {/* right side message container  */}
    //         <div className="message-container">
    //             {currentlyChatContact?
    //             <>
    //                 <div className="message-container-header">
    //                 <div className="message-image-container">
    //                     <img 
    //                     className="chat-avatar"
    //                     src={avatarImage}/>
    //                     <strong><span>{currentlyChatContact?currentlyChatContact.username:''}</span></strong>

    //                     {currentlyChatContact.isOnline===false 
    //             || currentlyChatContact.isOnline ===undefined ?
    //             <span className="chat-status-header chat-inactive">&#8203;</span>:
    //             <span className="chat-status-header chat-active">&#8203;</span>
    //             } 

    //                     {/* <span className="chat-active">&#8203;</span> */}
                        
    //                 </div>
    //                 <div className="message-search-more-container">
    //                     <i className="fa fa-search"></i>
    //                     <i className="fa fa-ellipsis-h" style={{fontSize:"15px"}}></i>
    //                 </div>
    //             </div>
    //             <ChatContainer
    //             ref={chatContainerRef}
    //             />
                
    //             <ChatFooterContainer
    //             currentlyChattingWith={currentlyChatContact}
    //             currentRoom={currentChatRoom}
    //             notifyChatContainer={notifyChatContainer}
    //             />
    //             </>
    //             :
    //                 <h3 style={{textAlign:"center"}}>Select a contact to start chatting</h3>}
                
    //         </div>
    //     </div>
        // )
        return (
            <main className="content">
    <div className="container p-0">

		<h1 className="h3 mb-3">Messages</h1>

		<div className="card">
			<div className="row g-0">
				<div className="col-12 col-lg-5 col-xl-3 border-right">

					<div className="px-4 d-none d-md-block">
						<div className="d-flex align-items-center">
							<div className="flex-grow-1">
								<input type="text" className="form-control my-3" placeholder="Search..."/>
							</div>
						</div>
					</div>

					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="badge bg-success float-right">5</div>
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar5.png" className="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Vanessa Tucker
								<div className="small"><span className="fas fa-circle chat-online"></span> Online</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="badge bg-success float-right">2</div>
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar2.png" className="rounded-circle mr-1" alt="William Harris" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								William Harris
								<div className="small"><span className="fas fa-circle chat-online"></span> Online</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Sharon Lessman
								<div className="small"><span className="fas fa-circle chat-online"></span> Online</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar4.png" className="rounded-circle mr-1" alt="Christina Mason" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Christina Mason
								<div className="small"><span className="fas fa-circle chat-offline"></span> Offline</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar5.png" className="rounded-circle mr-1" alt="Fiona Green" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Fiona Green
								<div className="small"><span className="fas fa-circle chat-offline"></span> Offline</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar2.png" className="rounded-circle mr-1" alt="Doris Wilder" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Doris Wilder
								<div className="small"><span className="fas fa-circle chat-offline"></span> Offline</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar4.png" className="rounded-circle mr-1" alt="Haley Kennedy" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Haley Kennedy
								<div className="small"><span className="fas fa-circle chat-offline"></span> Offline</div>
							</div>
						</div>
					</a>
					<a href="#" className="list-group-item list-group-item-action border-0">
						<div className="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Jennifer Chang" width="40" height="40"/>
							<div className="flex-grow-1 ml-3">
								Jennifer Chang
								<div className="small"><span className="fas fa-circle chat-offline"></span> Offline</div>
							</div>
						</div>
					</a>

					<hr className="d-block d-lg-none mt-1 mb-0"/>
				</div>
				<div className="col-12 col-lg-7 col-xl-9">
					<div className="py-2 px-4 border-bottom d-none d-lg-block">
						<div className="d-flex align-items-center py-1">
							<div className="position-relative">
								<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
							</div>
							<div className="flex-grow-1 pl-3">
								<strong>Sharon Lessman</strong>
								<div className="text-muted small"><em>Typing...</em></div>
							</div>
							<div>
								<button className="btn btn-primary btn-lg mr-1 px-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-phone feather-lg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button>
								<button className="btn btn-info btn-lg mr-1 px-3 d-none d-md-inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-video feather-lg"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></button>
								<button className="btn btn-light border btn-lg px-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-more-horizontal feather-lg"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
							</div>
						</div>
					</div>

					<div className="position-relative">
						<div className="chat-messages p-4">

							<div className="chat-message-right pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:33 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
									<div className="font-weight-bold mb-1">You</div>
									Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
								</div>
							</div>

							<div className="chat-message-left pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:34 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
									<div className="font-weight-bold mb-1">Sharon Lessman</div>
									Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
								</div>
							</div>

							<div className="chat-message-right mb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:35 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
									<div className="font-weight-bold mb-1">You</div>
									Cum ea graeci tractatos.
								</div>
							</div>

							<div className="chat-message-left pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:36 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
									<div className="font-weight-bold mb-1">Sharon Lessman</div>
									Sed pulvinar, massa vitae interdum pulvinar, risus lectus porttitor magna, vitae commodo lectus mauris et velit.
									Proin ultricies placerat imperdiet. Morbi varius quam ac venenatis tempus.
								</div>
							</div>

							<div className="chat-message-left pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:37 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
									<div className="font-weight-bold mb-1">Sharon Lessman</div>
									Cras pulvinar, sapien id vehicula aliquet, diam velit elementum orci.
								</div>
							</div>

							<div className="chat-message-right mb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:38 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
									<div className="font-weight-bold mb-1">You</div>
									Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
								</div>
							</div>

							<div className="chat-message-left pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:39 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
									<div className="font-weight-bold mb-1">Sharon Lessman</div>
									Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
								</div>
							</div>

							<div className="chat-message-right mb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:40 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
									<div className="font-weight-bold mb-1">You</div>
									Cum ea graeci tractatos.
								</div>
							</div>

							<div className="chat-message-right mb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:41 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
									<div className="font-weight-bold mb-1">You</div>
									Morbi finibus, lorem id placerat ullamcorper, nunc enim ultrices massa, id dignissim metus urna eget purus.
								</div>
							</div>

							<div className="chat-message-left pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:42 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
									<div className="font-weight-bold mb-1">Sharon Lessman</div>
									Sed pulvinar, massa vitae interdum pulvinar, risus lectus porttitor magna, vitae commodo lectus mauris et velit.
									Proin ultricies placerat imperdiet. Morbi varius quam ac venenatis tempus.
								</div>
							</div>

							<div className="chat-message-right mb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:43 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
									<div className="font-weight-bold mb-1">You</div>
									Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
								</div>
							</div>

							<div className="chat-message-left pb-4">
								<div>
									<img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40"/>
									<div className="text-muted small text-nowrap mt-2">2:44 am</div>
								</div>
								<div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
									<div className="font-weight-bold mb-1">Sharon Lessman</div>
									Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
								</div>
							</div>

						</div>
					</div>

					<div className="flex-grow-0 py-3 px-4 border-top">
						<div className="input-group">
							<input type="text" className="form-control" placeholder="Type your message"/>
							<button className="btn btn-primary">Send</button>
						</div>
					</div>

				</div>
			</div>
		</div>
	</div>
</main>
        )
    
}

