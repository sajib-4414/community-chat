import { useState } from "react"
import { ErrorMessage } from "../components/Misc/ErrorMessage"
import { axiosInstance } from "../utility/axiosInstance"
import { getAuthHeader } from "../utility/authenticationHelper"
import { LoggedInUser, User } from "../models/user.models"
import { useAppSelector } from "../store/store"
const env = await import.meta.env;
const SERVER_URL = env.VITE_APP_ROOT_URL || 'http://localhost:3001'; 

export const DiscoverUsers:React.FC = ()=>{
    const [radius,setRadius] = useState(0)
    const [errorLine,setErrorLine] = useState("")
    const [users,setUserList] = useState<UserWithFriend[]>([])
    const loggedinUser: LoggedInUser | null = useAppSelector(
        (state) => state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
      );
    
    const fetchUsersInRadius = async ()=>{
        try{
            const response = await axiosInstance.get(`/users/discover?radius=${radius}`,getAuthHeader(loggedinUser))
            setUserList(response.data)
        }catch(err){
            console.log(err)
            setErrorLine("Could not search users, try again")
        }
    }
    function handleSearch(){
        setUserList([])
        if(radius==0){
            setErrorLine("Please select a non zero radius")
            return;
        }
        fetchUsersInRadius()
    }
    function handleSliderChange(event){
        setRadius(event.target.value)
        setErrorLine("")
    }
    function onFriendActionChanged(reciverId, friend_request_info, type){
        console.log('onfriendrequest sent called')
        console.log(reciverId)
        console.log(friend_request_info)
        if(type==="friend_request_sent_success"){
            const newUserList = users.map((user)=>{
                if (user._id === reciverId)
                    return{
                        ...user,
                        friend_request_info
                    }
                else
                    return user
            })
            setUserList(newUserList)
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
            setUserList(newUserList)

        }
        else if(type==="friend_removal_success"){

        }
        
    }
    return (<div className="container-lg">
        <h3>
            Discover users in your area
        </h3>
        <div className="pb-3">
            <label htmlFor="customRange1" className="form-label ml-3">Choose a radius</label>
            <div className="row mx-1 justify-content-center align-items-center">
                <div className="col-8">
                    <input type="range" min="0" value={radius} max="100" style={{width:"100%"}} className="form-range" onChange={handleSliderChange} id="customRange1"/>
                </div>
                <div className="col-4">
                    <p className="border rounded p-2">{radius} Km</p>
                </div>
                
            </div>
            <button className="btn btn-primary ml-3" onClick={handleSearch}>Search</button>
            <ErrorMessage
                errorLine={errorLine}/>
            
        </div>
        {users.length>0 ? 
            <>
            <h5>{users.length} Users found</h5>
            <ul className="list-group">
            {users.map((user,index)=>{
                return(
                    <UserSearchListItem
                    frCallback={onFriendActionChanged.bind(null, user._id)} 
                    key={index} 
                    user={user}/>
                )
            })}
            
            
            
            </ul>
            <div className="py-3">
                <nav aria-label="Page navigation example">
                <ul className="pagination">
                    <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item"><a className="page-link" href="#">Next</a></li>
                </ul>
                </nav>
            </div>
            </>
            :
            <h5>No Users found</h5>
        }
        
        
        
    </div>)
}
interface discoverFriend{
    isFriend:boolean;
    friend_request_info?:User,
    friend_info?:User
}
type UserWithFriend = User & discoverFriend
const UserSearchListItem = ({user,frCallback}:{user:UserWithFriend,frCallback:any})=>{
    const loggedinUser: LoggedInUser | null = useAppSelector(
        (state) => state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
      );
    const [frsuccessMsg, setFrMsg] = useState("")
    const getActionButton = ()=>{
        if(user._id === loggedinUser?.user.id)
            return '(Yourself)'
        else if(user.friend_request_info)
            return <div className="col-3">
            <p>You already sent request.</p>
            <button className="btn btn-warning" onClick={removeFriendRequest}>Remove Pending Request</button>
            </div>
        
        else if (user.friend_info)
            return <>
                You are friends.
                <button className="btn btn-warning col-3" onClick={removeFriend}>Remove Connection</button>
            </>
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
        }catch(err){
            console.log('friend reqiest removing error',err)
            setFrMsg("request failed")
        }
    }
    return(
        <li className="list-group-item">
            <div className="row px-2">
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
            </div>
            <p className="bg-warning"><small>{frsuccessMsg}</small></p>
        </li>
    )
}