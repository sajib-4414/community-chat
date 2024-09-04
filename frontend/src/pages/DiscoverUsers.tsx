import { useState } from "react"
import { ErrorMessage } from "../components/common/ErrorMessage"
import { axiosInstance } from "../utility/axiosInstance"
import { getAuthHeader } from "../utility/authenticationHelper"
import { FriendRequest, LoggedInUser } from "../models/user.models"
import { useAppSelector } from "../store/store"
import { FriendActionButtonT, UserWithFriend } from "../types/users.friends.types"
import { UserListItem } from "../components/connectiongroups/UserListItem"


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
    function handleSliderChange(event:React.ChangeEvent<HTMLInputElement>){
        setRadius(Number(event.target.value))
        setErrorLine("")
    }
    function onFriendActionChanged(reciverId:string, friend_request_info:FriendRequest, type:FriendActionButtonT){
        console.log('onfriendrequest sent called')
        console.log(reciverId)
        console.log(friend_request_info)
        if(type==="friend_request_sent_success"){
            console.log("here inside if")
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
                    <UserListItem
                    frCallback={onFriendActionChanged.bind(null, user._id)} 
                    key={index} 
                    showDeny={false}
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
