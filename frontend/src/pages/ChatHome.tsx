import { useEffect, useState } from "react";
import './chathome.css'
import { socket } from "../socket";
import avatarImage from './../assets/test_avatar_image.jpg';
import { useAppSelector } from "../store/store";
import { MESSAGE_FROM_SERVER, MESSAGE_TO_SERVER } from "../constants";
import { LoggedInUser } from "../models/usermodels";
import { axiosInstance } from "../axiosInstance";
import { IMessage, IRoom, IUser, MessagePayLoadToServer, MessageWithRoom, ROOM_TYPE } from "../interfaces/MessageInterfaces";
import { ChatContainer } from "../components/ChatContainer";
import { ChatFooterContainer } from "../components/ChatFooterContainer";
export  const ChatHome = ()=>{
    
    

    //All States
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const [contacts, setContacts] = useState<any>([])
    const [currentlyChatContact, setCurrentlyChatContact] = useState<IUser|null>(null)
    const [currentMessageType, setCurrentMessageType] = useState("")
    const [currentChatRoom, setCurrentChatRoom] = useState<IRoom|null>(null)
    const [currentChatMessages, setCurrentChatMessages] = useState<IMessage[]>([])
    const [currentMessage, setCurrentMessage] = useState("")
    const [pastChats, setPastChats] = useState<MessageWithRoom[]>([])

    //Functions and listeners
    const getAuthHeader = ()=>{
        let user:LoggedInUser|null = loggedinUser
        if(!user){
            const storedUserData = localStorage.getItem("user");
            if(storedUserData){
                user = JSON.parse(
                    storedUserData,
                ) as LoggedInUser;
            }
            
        }
        return {
            headers: { Authorization: `Bearer ${user?.token}` }
        }
    };
    async function deleteSocketFromUser(socketId:string) {
        await axiosInstance.post('/messages/delete-socket', {
            socketId
        },getAuthHeader())
    }
    async function onConnect() {
        console.log('socket connected')
        console.log('on Connect auth header is',getAuthHeader())
        if(socket.id){
            await joinAllRoomsOfUser(socket.id);
            await addSocketToUser(socket.id);
        }     
    }
    async function onDisconnect() {
        console.log('socket got disconnected')
        console.log('on disconnect auth header is',getAuthHeader())
        if(socket.id){
            await deleteSocketFromUser(socket.id);
        }  
    }
    const fetchContacts = async()=>{
        const response = await axiosInstance.get('/auth/users/all')
        const allUsers = response.data
        const usersExceptLoggedInUser = allUsers.filter((user:any)=> user.username!=loggedinUser?.user?.username)
        setContacts(usersExceptLoggedInUser)
    }
    //fetching all past conversations for showing inthe chat history
    const fetchPastMessages = async()=>{
        const response = await axiosInstance.get('/messages/past-chats', getAuthHeader())
        setPastChats(response.data)
    }
    const joinAllRoomsOfUser = async (socketId:string)=>{
        const payload = {
            socketId
        }
        console.log(payload)
        await axiosInstance.post('/messages/join-all',payload, getAuthHeader())
    }
    const addSocketToUser = async(socketId:string)=>{
        console.log("adding my socket to user")
        await axiosInstance.post('/messages/add-socket', {
            socketId
        },getAuthHeader())
    }
    const sendCurrentMessage = async()=>{
        //Now we send all message via socket, No first message via API,
        //API will determine if its the first message or what to do
        
        // //send the first message with api
        // if(currentChatMessages.length==0){
        //     const users = [loggedinUser?.user.username, currentlyChattingWith.username]
        //     users.sort()
        //     const roomName = "pvt-"+users.join("-")

            
        //     await axiosInstance.post('/messages/message',{
        //         receiver:currentlyChattingWith, 
        //         messageRoomName:roomName,
        //         message:currentMessage,
        //         socketId:socket.id
        //     }, getAuthHeader())
        //     setCurrentMessage("")
        // }
        // else{
            console.log("sent by socket./...........")
            //if there is message already then send via socket

            // //request to server via socket event to join the room
            // const users = [loggedinUser?.user.username, currentlyChattingWith.username]
            // users.sort()
            // const roomName = "pvt-"+users.join("-")

            //does not working joining and sending the message at the same time, 
            // we are doing this inthe server, joining the socket in the room then emitting a message
            // socket.emit(USER_ROOM_JOIN_REQUEST,{
            //     roomName
            // } )

            //then emit the mesasge
            const messagePayload:MessagePayLoadToServer = {
                // sender:loggedinUser?.user,//todo this will come from authentiation
                // room:roomName,
                // message: currentMessage
                messageType: ROOM_TYPE.ONE_TO_ONE,
                targetUser: currentlyChattingWith!,//it will be empty for groupchats
                message:currentMessage,
                room:undefined
            }
            socket.emit(MESSAGE_TO_SERVER, messagePayload )
            setCurrentMessage("")
        // }
    }

    const fetchChatMessagesForCurrentChat = async (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:IRoom|null )=>{
        // const users = [loggedinUser?.user.username, targetUser.username]
        // users.sort()
        // const roomName = "pvt-"+users.join("-")
        // const response = await axiosInstance.post('/messages/all-messages',{
        //     roomName,
        //     currentChatter:loggedinUser?.user.username
        // },getAuthHeader())

        // setCurrentChatMessages(response.data)


        const payload:any = {}
        //send whatever info we have to the server
       
         //case 1: one to one chat, user clicked a contact, we dont know the room
        //ensures its the case 1
        if(!room && targetUser){
            payload.targetUser = targetUser //we just know target user, we want to fetch chat info with that user one to one
            payload.messageType = roomOrMessageType//we know for sure what kind of message we want to fetch
            // payload.room=room//for one to one chat when someone clicked contact, room will be None/undefined
        }

        //case 2 user clicked a recent one to one chat, we know the room
        //we also know the target user, that is another user from the room
        if(room && targetUser){
            payload.targetUser = targetUser //target user will be xtracted from the room
            payload.messageType = roomOrMessageType
            payload.room=room//for one to one chat when someone reent chat, we know the room
        }

        //fetch all the past messages for this chat with this person/group
        const response = await axiosInstance.post('/messages/all-messages',payload,getAuthHeader())
        setCurrentChatMessages(response.data)
    }
    const handleContactClick = (contact?:IUser)=>{
        if(contact){
            //someone wants to do a private chat, and just clicked a contact of a private person
            //1. set currentChat to the contact
            setCurrentlyChatContact(contact)
            //2. set current message type
            setCurrentMessageType(ROOM_TYPE.ONE_TO_ONE)
            //3. set the current room, we cannot get the room info from the contact only, so set it to null
            setCurrentChatRoom(null)

            //4. Now fecth the previous messages of this chat
            fetchChatMessagesForCurrentChat(ROOM_TYPE.ONE_TO_ONE, contact)
        }
        else{
            //someone clicked a group chat name, no contact to send the message to.
            //1. Fetch group messages
        }
        
    }
    socket.on(MESSAGE_FROM_SERVER, (dbMessage) => {
        //TODO also now check if the message should go to current chat message or past chat message.
        console.log("new message received",dbMessage)

        setCurrentChatMessages([...currentChatMessages, dbMessage])
        
    });
    useEffect(()=>{
        fetchContacts();
        fetchPastMessages();
        
        if(socket){
            socket.on('connect', onConnect.bind(null));

            socket.on('foo', (value) => {
                console.log('on foo event value',value)
            });
            socket.on('disconnect',onDisconnect)
        }
        else{
            console.log('socket is maybe null')
            console.log('still printing it', socket)
        }
        
    
        //this return function works as a cleanup method
        return()=>{
            socket.off('foo');
            socket.off(MESSAGE_FROM_SERVER);
            socket.off(MESSAGE_TO_SERVER);
        }

    },[])

    const handleRecentChatItemClick = (imessage:MessageWithRoom)=>{
        console.log('clicked')
        // handleContactClick(imessage.receiver)
        const room:IRoom|null|string = imessage.room
        let targetUser;
        if(room && typeof room === 'object'){
            targetUser = room.privateRoomMembers.find(user=> user._id !== loggedinUser?.user._id)
        }

        //someone wants to do a private chat, and just clicked a recent chats with another person
        //1. set currentChat to the contact
        if(targetUser)
            setCurrentlyChatContact(targetUser)
        //2. set current message type
        setCurrentMessageType(ROOM_TYPE.ONE_TO_ONE)
        //3. set the current room, we cannot get the room info from the contact only, so set it to null
        if(room)
            setCurrentChatRoom(room as IRoom)

        //4. Now fecth the previous messages of this chat
        fetchChatMessagesForCurrentChat(ROOM_TYPE.ONE_TO_ONE, targetUser)
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
                            pastChats.map((imessage:MessageWithRoom,index)=><li 
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
                <ChatContainer
                currentChatMessages={currentChatMessages}
                />
                
                <ChatFooterContainer
                currentlyChattingWith={currentlyChattingWith}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                sendCurrentMessage={sendCurrentMessage}
                />
                </>
                :
                    <h3 style={{textAlign:"center"}}>Select a contact to start chatting</h3>}
                
            </div>
        </div>
    
}

