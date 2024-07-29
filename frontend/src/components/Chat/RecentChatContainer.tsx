import { AxiosError } from "axios"
import { IUser, MessageWithAlternateUser, MessageWithRoom } from "../../interfaces/MessageInterfaces"
import { axiosInstance } from "../../utility/axiosInstance"
import React, { useEffect, useImperativeHandle, useState } from "react"
import { LoggedInUser } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import { useDispatch } from "react-redux"
import { resetUser } from "../../store/UserSlice"
import { router } from "../../router"
import { ChatRecentRow } from "./RecentChatRow"

export const RecentChats = React.forwardRef((props, ref)=>{
    const [pastChats, setPastChats] = useState<MessageWithAlternateUser[]>([])
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    useEffect(()=>{
        fetchPastMessages();
    },[])
    useImperativeHandle(ref, () => ({
        setRecentChatData(users) {
            // console.log('I am called on the child activity.................')
            // setPastChats(newData);
            console.log("all users online status received....", users)
                const userMap = new Map();
                users.forEach((user:any)=>{
                    userMap.set(user.id,user.isOnline)
                })
                console.log(userMap)
                //
                // const currentPastMessages = structuredClone(pastChats)
                // console.log('current past chats=',currentPastMessages)
                // console.log('witout state=', pastChatList)
                // //lets update users online status.
                const currentpastChats = pastChats.map((ps)=>{
                    ps.room.privateRoomMembers
                    return{
                        ...ps,
                        user_chatting_with:{
                            ...ps.user_chatting_with,
                            isOnline:userMap.get(ps.user_chatting_with._id)||false
                        }
                    }
                })
                console.log('updated past chats')
                setPastChats(currentpastChats)
                // console.log(currentpastChats)
                
                // setPastChats(currentpastChats)
                //trying this 
                
        },
        updateRecentChatContainer(messagePayload){
            console.log('here3')
            const alternateUser:IUser|undefined = messagePayload.room.privateRoomMembers.find(user=>user._id !== loggedinUser.user._id)
            
            
            const newMessageWithUser:MessageWithAlternateUser = {
                latest_message:messagePayload.message,
                user_chatting_with:alternateUser!,
                room:messagePayload.room
            }
            console.log("new message with user is  ", newMessageWithUser)
            // console.log('past chat list is,....',pastChatList)
            const existingchatIndex = pastChats.findIndex((ps:MessageWithAlternateUser)=> ps.user_chatting_with._id === alternateUser!._id)
            if(existingchatIndex !=-1){
                //there is already chat of the new message sender at this moment
                //so we need to pop it first, we dont want to show duplicate item
                //in the recent chats UI
                const currentPastMessages = structuredClone(pastChats)
                currentPastMessages.splice(existingchatIndex,1)
                currentPastMessages.push(newMessageWithUser)
                currentPastMessages.sort((a,b)=>{
                    return(new Date(b.latest_message.createdAt).getTime()-new Date(a.latest_message.createdAt).getTime())
                })
                
                 setPastChats(currentPastMessages)
            }
            else{
                //there is no existing chat in the pastchat array from the new message sender
                const currentPastMessages = structuredClone(pastChats)
                currentPastMessages.push(newMessageWithUser)
                currentPastMessages.sort((a,b)=>{
                    return(new Date(b.latest_message.createdAt).getTime()-new Date(a.latest_message.createdAt).getTime())
                })
                
                setPastChats(currentPastMessages)
            }
            
        }
        
    }));
    
    const dispatch = useDispatch()
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
    //fetching all past conversations for showing inthe chat history
    const fetchPastMessages = async()=>{
        try{
            const response = await axiosInstance.get('/messages/past-chats', getAuthHeader())
        console.log("past messages response is",response)
        //from server we get an array that just has message and room info, for one to one chat
        //we have to find the alternate user(to which user current usr is chatting with), to show it in the recents
        const messageWithRooms:MessageWithRoom[] = response.data
        if(loggedinUser){
            const pastChatData:MessageWithAlternateUser[] = messageWithRooms.map((imessage)=>{
                const alternateUser:IUser|undefined = imessage.room.privateRoomMembers.find(user=>user._id !== loggedinUser.user._id)
                if(alternateUser){
                    return {
                        latest_message:imessage.message,
                        user_chatting_with:alternateUser,
                        room:imessage.room
                    }
                }
                else{
                      // Handle the case where no alternate user is found, if necessary
                    // For now, returning an empty object to ensure the return type matches
                    return {
                        latest_message: imessage.message,
                        user_chatting_with: {} as IUser,  // Example of handling an empty user
                        room: imessage.room
                    };
                }
                
                
            })
            console.log('past chat data is',pastChatData)
            setPastChats(pastChatData)
            // pastChatList = pastChatData
        }
        }catch(err){
            console.log("cannot fetch past messages..., err=",err)
            if(err instanceof AxiosError){
                if(err!=null && err?.response?.status === 401){
                    // console.log('401 error happened.............')
                    localStorage.removeItem("user");
                    dispatch(resetUser()) //to log out the user
                    router.navigate('/login')
                  }
            }
        }
        
        
    }

    return (
        <div className="recent-messages">
        <h4>Recent</h4>
        <ul>
            {
                pastChats.map((imessage:MessageWithAlternateUser,index)=>
                <li 
                key={index}
                onClick={()=>props.handleRecentChatItemClick(imessage)}
                >
                    <ChatRecentRow
                    imessage={imessage}
                    />
                </li>)
                
            }
            
    
        </ul>
    </div>
    )

})