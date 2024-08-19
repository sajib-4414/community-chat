import {  useEffect, useState } from "react"
import { UserWithFriend } from "../types/users.friends.types"
import { axiosInstance } from "../utility/axiosInstance"
import { FriendRequest, LoggedInUser, User } from "../models/user.models"
import { useAppSelector } from "../store/store"
import { getAuthHeader } from "../utility/authenticationHelper"
import { ErrorMessage } from "../components/Misc/ErrorMessage"
import { UserListItem } from "../components/Connections&Groups/UserListItem"
type tabType = "connections"| "requests-sent" | "groups" | "requests-recieved"
export const ConnectionGroups = ()=>{
    const [activeTab,setActiveTab] = useState<tabType>("connections")
    const [users,setUsers] = useState<UserWithFriend[]>([])
    const loggedinUser: LoggedInUser | null = useAppSelector(
        (state) => state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    );
    const [errorLine,setErrorLine] = useState("")
    const handleTabClick = (buttonType:tabType)=>{
        console.log('clicked')
        setActiveTab(buttonType)
        fetchUsers(buttonType)
        setErrorLine("")
    }
    useEffect(()=>{
        fetchUsers("connections")
    },[])
    const fetchUsers = async (type:tabType)=>{
        try{
            let path;
            if(type==="requests-sent") path = "connection-requests?type=sent"
            else if (type==="requests-recieved") path = "connection-requests?type=received"
            else if (type==="connections") path = "connections"
            else if (type==="groups") path = "groups"
            const response = await axiosInstance.get(`/users/${path}`,getAuthHeader(loggedinUser))
            
            if(type==="requests-sent"){
                const friendRequests:FriendRequest<string,User>[] = response.data
                const usersWithFriend = friendRequests.map((fr)=>{
                    const ret:UserWithFriend = {...fr.reciever} as UserWithFriend
                    ret.isFriend = false;
                    ret.friend_request_info = fr
                    return ret
                })
                setUsers(usersWithFriend)
            }
            else if(type==="requests-recieved"){
                const friendRequests:FriendRequest<User,string>[] = response.data
                const usersWithFriend = friendRequests.map((fr)=>{
                    const ret:UserWithFriend = {...fr.sender} as UserWithFriend
                    ret.isFriend = false;
                    ret.friend_request_info = fr
                    return ret
                })
                setUsers(usersWithFriend)
            }
            else if (type==="connections"){
                //data is formatted from server with the pattern
                setUsers(response.data)
            }
            
        }catch(err){
            console.log(err)
            setErrorLine("Could not search users, try again")
        }
    }
    function onFriendActionChanged(reciverId:string, friend_request_info:FriendRequest, type, friend_info=null){
        console.log('onfriendrequest sent called')
        console.log(reciverId)
        console.log(friend_request_info)
        if(type==="friend_request_sent_success" || type==="friend_responded_deny"){
            const newConnectionList = users.map((user)=>{
                if (user._id === reciverId)
                    return{
                        ...user,
                        friend_request_info
                    }
                else
                    return user
            })
            setUsers(newConnectionList)
        }
        else if(type==="friend_pending_request_remove_success"){
            const newUserList = users.map((user)=>{
                if (user._id === reciverId){
                     const newUser = {...user}
                    delete newUser['friend_request_info']
                    return newUser
                } 

                else
                    return user
            })
            setUsers(newUserList)

        }
        else if(type==="friend_removal_success"){
            const newConnectionList = users.map((user)=>{
                if (user._id === reciverId){
                    const newUser = {...user}
                    delete newUser["friend_info"]
                    return newUser
                } 
                else
                    return user
            })
            setUsers(newConnectionList)
        }
        else if(type==="friend_responded_accept" && friend_info){

            const newConnectionList = users.map((user)=>{
                if (user._id === reciverId){
                    const newUser = {...user}
                    newUser.friend_info = friend_info
                    delete newUser["friend_request_info"]
                    return newUser
                } 
                else
                    return user
            })
            setUsers(newConnectionList)
        }
    }
    return(<div className="container-xl">
        <div>
            
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button 
                    className={`nav-link`+(activeTab==="connections" ?` active`:'')}
                    aria-current="page" 
                    onClick={handleTabClick.bind(null,"connections")}>Connections</button>
                </li>
                <li className="nav-item">
                    {/* event is automatically passed as last argument for JS event handling */}
                    <button 
                    className={`nav-link`+(activeTab==="requests-sent" ?` active`:'')}
                    onClick={handleTabClick.bind(null,"requests-sent")}
                    >Requests Sent</button>
                </li>
                <li className="nav-item">
                    {/* event is automatically passed as last argument for JS event handling */}
                    <button 
                    className={`nav-link`+(activeTab==="requests-recieved" ?` active`:'')}
                    onClick={handleTabClick.bind(null,"requests-recieved")}
                    >Requests Received</button>
                </li>
                <li className="nav-item">
                    <button
                    className={`nav-link`+(activeTab==="groups" ?` active`:'')}
                    // className="nav-link disabled" 
                    tabIndex={-1} 
                    aria-disabled="true"
                    onClick={handleTabClick.bind(null,"groups")}>Groups</button>
                </li>
            </ul>
        </div>

        <div>
        {activeTab==="requests-sent"?
                <>
                    <h3>Your Sent Connection Requests</h3>
                    {users.map((user,index)=>{
                        return(
                            <UserListItem
                            frCallback={onFriendActionChanged.bind(null, user._id)} 
                            key={index} 
                            user={user}/>
                        )
                    })}
                </>
                :
                activeTab==="connections"
                ?
                <>
                    <h3>Your Connections</h3>
                    <ul className="list-group">
                    {users.map((user,index)=>{
                        return(
                            <UserListItem
                            frCallback={onFriendActionChanged.bind(null, user._id)} 
                            key={index} 
                            user={user}/>
                        )
                    })}
                    </ul>
                </>
                :activeTab==="requests-recieved"
                ?
                <>
                    <h3>Connection Requests you have received</h3>
                    {users.map((user,index)=>{
                        return(
                            <UserListItem
                            frCallback={onFriendActionChanged.bind(null, user._id)} 
                            key={index} 
                            user={user}/>
                        )
                    })}

                </>
                :
                <>
                    <h3>Groups that you are part of</h3>
                    
                </>
                }
        
        
            
        </div>

        <ErrorMessage
            errorLine={errorLine}/>
        
    </div>)
}