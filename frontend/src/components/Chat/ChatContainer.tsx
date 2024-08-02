import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { LoggedInUser } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import { Message, Room, ServerMessagePayload } from "../../models/message.models";
import { axiosInstance } from "../../utility/axiosInstance";
import { ROOM_TYPE } from "../../utility/constants";
import { getAuthHeader } from "../../utility/authenticationHelper";
import { ChatRow } from "./ChatRow";
export interface ChatContainerRef {
    updateChatUponSocketMessage: (messagePayload:ServerMessagePayload) => void;
    fetchCurrentChatMessage: (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null) => void;
    pushDummyMessage:(unpublishedMessage:Message)=>void;
}

export const ChatContainer = React.forwardRef((props, ref)=>{
    useImperativeHandle(ref, () => ({
        updateChatUponSocketMessage(messagePayload:ServerMessagePayload){
            //checks if the message list has a dummy message, a message shown by UI
            //if yes, and the socket message is sme, we pop the dummy message and push the server message
            if(currentChatMessages.at(-1)?.message === messagePayload.message.message){
                const serverMessages = currentChatMessages.filter((msg)=> msg.message !== messagePayload.message.message)
                serverMessages.push(messagePayload.message)
                setCurrentChatMessages(serverMessages)
            }
            else{
                setCurrentChatMessages([...currentChatMessages, messagePayload.message])
            }
            
        },
        fetchCurrentChatMessage(roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null){
            fetchChatMessagesForCurrentChat(roomOrMessageType, targetUser,room)
        },
        pushDummyMessage(unpublishedMessage:Message){
            setCurrentChatMessages([...currentChatMessages, unpublishedMessage])
        }
        
    }));
    const fetchChatMessagesForCurrentChat = async (roomOrMessageType:ROOM_TYPE, targetUser?:any,room?:Room|null )=>{
        console.log('inside fetching..............')
        const payload:any = {}
        //send whatever info we have to the server
       
         //case 1: one to one chat, user clicked a contact, we dont know the room
        //ensures its the case 1
        if(!room && targetUser){
            payload.targetUser = targetUser //we just know target user, we want to fetch chat info with that user one to one
            payload.messageRoomType = roomOrMessageType//we know for sure what kind of message we want to fetch
            // payload.room=room//for one to one chat when someone clicked contact, room will be None/undefined
        }

        //case 2 user clicked a recent one to one chat, we know the room
        //we also know the target user, that is another user from the room
        if(room && targetUser){
            payload.targetUser = targetUser //target user will be xtracted from the room
            payload.messageRoomType = roomOrMessageType
            payload.room=room//for one to one chat when someone reent chat, we know the room
        }

        //fetch all the past messages for this chat with this person/group
        const response = await axiosInstance.post('/messages/all-messages',payload,getAuthHeader(loggedinUser))
        setCurrentChatMessages(response.data)
    }

    const [currentChatMessages, setCurrentChatMessages] = useState<Message[]>([])
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )


    return(
        <div className="position-relative">
						<div className="chat-messages p-4">
                        {currentChatMessages.map((message:any)=>{
                             return <ChatRow message={message}/>
                            
                         })}
                         <AlwaysScrollToBottom />

							{/* <div className="chat-message-right pb-4">
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
							</div> */}

						</div>
					</div>
        // <div className="message-container-main">
                    
        //             <ul 
        //             className="chat-message-class-demo"
        //             >
        //                 {currentChatMessages.map((message:any)=>{
        //                     return <ChatRow message={message}/>
                            
        //                 })}
        //             <AlwaysScrollToBottom />
        //             </ul>
                    
                    
                    
        //         </div>
    )
})

const AlwaysScrollToBottom = () => {
    const elementRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => elementRef.current!.scrollIntoView());
    return <div ref={elementRef} />;
};