import { AxiosError } from "axios"
import { axiosInstance } from "../../utility/axiosInstance"
import React, { useEffect, useImperativeHandle, useState } from "react"
import { LoggedInUser, User } from "../../models/user.models"
import { useAppSelector } from "../../store/store"
import { useDispatch } from "react-redux"
import { resetUser } from "../../store/UserSlice"
import { router } from "../../router"
import { ChatRecentRow } from "./RecentChatRow"
import {  getUpdatedChatsOnSocketMessage } from "../../utility/recentMessagesHelper"
import { RecentChatItem, ServerMessagePayload } from "../../models/message.models"
import { getAuthHeader } from "../../utility/authenticationHelper"
interface RecentChatContainerProps{
    handleRecentChatItemClick:(imessage:RecentChatItem)=>void
}
export interface RecentChatsRef {
    setRecentChatData: (users: User[]) => void;
    updateRecentChatContainer: (messagePayload: any) => void;
}

export const RecentChats = React.forwardRef((props:RecentChatContainerProps, ref)=>{
    const [pastChats, setPastChats] = useState<RecentChatItem[]>([])
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    useEffect(()=>{
        fetchPastMessages();
    },[])
    useImperativeHandle(ref, () => ({
        //invoked by parent component chathome, whenver backend sends a socket event 
        //that contains all users(just id and isonline) to update on the recent chat UI who is online
        setRecentChatData(users:User[]) {
            console.log('called to updarte recent status')
            const userMap = new Map();
            users.forEach((user:any)=>{
                userMap.set(user.id,user.isOnline)
            })
            
            // updating the isOnline status for all pastchat row items, just modifying the user_chatting_with obj
            const currentpastChats:RecentChatItem[] = pastChats.map((ps)=>{
                // ps.room.privateRoomMembers
                return{
                    ...ps,
                    secondUser:{
                        ...ps.secondUser,
                        isOnline:userMap.get(ps.secondUser._id)||false
                    }
                }
            })
            console.log('after updating this is the pastchats')
            console.log(currentpastChats)
            setPastChats(currentpastChats)
        },
        
        //this is when there is a new message from server via socket,
        //we update the recent chat container to have that 
        updateRecentChatContainer(messagePayload:ServerMessagePayload){
            if(loggedinUser && loggedinUser.user){
                const updatedPastChats = getUpdatedChatsOnSocketMessage(messagePayload, loggedinUser?.user, pastChats)
                setPastChats(updatedPastChats)
            }
        }
        
    }));
    
    const dispatch = useDispatch()
        //Functions and listeners

    //fetching all past conversations for showing inthe chat history
    const fetchPastMessages = async()=>{
        try{
            const response = await axiosInstance.get('/messages/past-chats', getAuthHeader(loggedinUser))
        //from server we get an array that just has message and room info, for one to one chat
        //we have to find the alternate user(to which user current usr is chatting with), to show it in the recents
        const messageWithRooms:ServerMessagePayload[] = response.data
        if(loggedinUser){
            const pastChatData:RecentChatItem[] = messageWithRooms.map((imessage)=>{
                const alternateUser:User|undefined = imessage.room.privateRoomMembers.find(user=>user._id !== loggedinUser.user._id)
                if(alternateUser){
                    return {
                        latestMessage:imessage.message,
                        secondUser:alternateUser,
                        room:imessage.room
                    }
                }
                else{
                    // Handle the case where no alternate user is found[who will show in th recent chats], if necessary
                    // For now, returning an empty object to ensure the return type matches
                    return {
                        latestMessage: imessage.message,
                        secondUser: {} as User,  // Example of handling an empty user
                        room: imessage.room
                    };
                }
                
                
            })
            setPastChats(pastChatData)
        }
        }catch(err){
            console.log("cannot fetch past messages..., err=",err)
            if(err instanceof AxiosError){
                if(err!=null && err?.response?.status === 401){
                    localStorage.removeItem("user");
                    dispatch(resetUser()) //to log out the user
                    router.navigate('/login')
                  }
            }
        }
        
        
    }

    return (

    <>
        <h5 className="pl-4 mt-5">Recent Chats</h5>
					<div className="overflow-auto" style={{maxHeight:"40vh"}}>
                    {pastChats.map((imessage:RecentChatItem, index)=>{
                        return(
                            <div key={index}
                            onClick={()=>props.handleRecentChatItemClick(imessage)}>
                                <ChatRecentRow                   
                                    imessage={imessage}
                                                    />
                            </div>
                            
                        )
                    })}
					</div>
    </>
    )

})