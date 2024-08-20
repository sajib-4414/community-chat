import { useState } from "react";
import { LoggedInUser } from "../../models/user.models";
import { useAppSelector } from "../../store/store";
import { UserWithFriend } from "../../types/users.friends.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { getAuthHeader } from "../../utility/authenticationHelper";
const env = await import.meta.env;
const SERVER_URL = env.VITE_APP_ROOT_URL || 'http://localhost:3001'; 

export type FRResponse = "accept" | "deny"
export const UserListItem = ({user,frCallback,showDeny=true}:{user:UserWithFriend,frCallback:any,showDeny?:boolean})=>{
    const loggedinUser: LoggedInUser | null = useAppSelector(
        (state) => state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
      );
    const [frsuccessMsg, setFrMsg] = useState("")
    const getActionButton = ()=>{
        console.log('inside get action button')
        console.log(user.name,user.friend_request_info)
        if(user._id === loggedinUser?.user.id)
            return '(Yourself)'
        else if(user.friend_request_info && user.friend_request_info.sender===loggedinUser?.user.id && !user.friend_request_info.respondTime)
            return <div className="col-3">
            <button className="btn btn-warning" onClick={removeFriendRequest}>Remove Pending Request</button>
            </div>
        else if(user.friend_request_info && user.friend_request_info.reciever===loggedinUser?.user.id && !user.friend_request_info.respondTime)
            return <div className="col-3">
            <button className="btn btn-success mb-1" onClick={respondFriendRequest.bind(null,"accept")}>Accept request</button>
            <button className="btn btn-danger" onClick={respondFriendRequest.bind(null,"deny")}>Deny request</button>
            </div>
        else if (user.friend_info)
            return <div className="col-3">
                <p>You are friends.</p>
                <button className="btn btn-warning" onClick={removeFriend}>Remove Connection</button>
            </div>
        else
            return <button className="btn btn-success col-3" onClick={addFriendRequest}>Add Connection</button>
    }
    const addFriendRequest = async ()=>{
        try{
            const response = await axiosInstance.post('/users/addfriend',{
                reciverId:user._id
            },getAuthHeader(loggedinUser))
            const friendRequestData = response.data
            frCallback(friendRequestData,"friend_request_sent_success")
            setFrMsg("request sent")
            setTimeout(()=>{
                setFrMsg("")
            },1000)
        }catch(err){
            console.log('friend reqiest sending error',err)
            setFrMsg("request failed")
        }
    }
    const removeFriendRequest = async ()=>{
        try{
            await axiosInstance.post('/users/removefriendrequest',{
                reciverId:user._id
            },getAuthHeader(loggedinUser))
            frCallback(null,"friend_pending_request_remove_success")
            setFrMsg("Friend request removed")
            setTimeout(()=>{
                setFrMsg("")
            },1000)
        }catch(err){
            console.log('friend reqiest removing error',err)
            setFrMsg("request failed")
        }
    }

    const respondFriendRequest = async (response:FRResponse)=>{
        console.log('respond called with argument',response)
        try{
            const apiResponse = await axiosInstance.post('/users/respond-connection-requests',{
                reciverId:user._id,
                response
            },getAuthHeader(loggedinUser))
            const data = apiResponse.data
            const friend_info = data.friend_info
            const friend_request_info  = data.friend_request_info
            if(response==="accept")
                frCallback(friend_request_info,"friend_responded_accept",friend_info)
            if(response==="deny")
                frCallback(friend_request_info,"friend_responded_deny",friend_info)
            setFrMsg("Friend request "+response+"d")
            setTimeout(()=>{
                setFrMsg("")
            },1000)
        }catch(err){
            console.log('friend reqiest removing error',err)
            setFrMsg("request failed")
        }
    }
    const removeFriend = async ()=>{
        try{
            await axiosInstance.post('/users/removefriend',{
                reciverId:user._id
            },getAuthHeader(loggedinUser))
            frCallback(null,"friend_removal_success")
            setFrMsg("Friend removed")
            setTimeout(()=>{
                setFrMsg("")
            },1000)
        }catch(err){
            console.log('friend reqiest removing error',err)
            setFrMsg("request failed")
        }
    }

    //dont show denied request row if showdeny=false
    if(!showDeny && user.friend_request_info?.respondTime && user.friend_request_info?.isAccepted===false)
    {
        console.log('getting true')
        return null
    }
        
    return(
        <li className="list-group-item">
            <div className="row px-2">
                {user.friend_request_info?.respondTime && user.friend_request_info?.isAccepted===false? `Your connection request to ${user.name} was denied`
                :
                <>
                <div className="col-1">
                    <img
                        src={`${SERVER_URL}${user.profileImage}`}
                        className="rounded-circle mr-1"
                        alt="profile picture"
                        width="30"
                        height="30"
                    />
                </div>
                    
                <p className="col-8">{user.name}</p>
                        
                {getActionButton()}
                </>}
                
            </div>
            <p className="bg-warning"><small>{frsuccessMsg}</small></p>
        </li>
    )
}