import { useState } from "react"
import { RoomMemberAndRoom } from "../../models/message.models"
import { axiosInstance } from "../../utility/axiosInstance"
import { LoggedInUser } from "../../models/user.models";
import { useAppSelector } from "../../store/store";
import { getAuthHeader } from "../../utility/authenticationHelper";
import { AxiosResponse } from "axios";

export const GroupListItem = ({group,onGroupLeave}:{group:RoomMemberAndRoom,onGroupLeave:(groupId:string)=>void})=>{
    const loggedinUser: LoggedInUser | null = useAppSelector(
        (state) => state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    );
    async function onLeaveGroup(){
        try{
            const response:AxiosResponse = await axiosInstance.post('/users/groups/leave', {
                groupId:group.room._id
            }, getAuthHeader(loggedinUser))
            if(response.status<400){
                setFrMsg('Group left successfully')
                setTimeout(()=>{
                    onGroupLeave(group.room._id)
                },800)
                
            }
            else{
                setFrMsg('Failed to leave group')
            }
            
        }catch(err){
            console.log('group leave error',err)
            setFrMsg('Failed to leave group')
        }
        
    }
    const [frsuccessMsg, setFrMsg] = useState("")
    return(
        <li className="list-group-item">
            <div className="row px-2">
                
               
                <div className="col-10">
                    <p className="d-inline mr-2"><strong>Groupname: </strong>{group.room.name}</p>
                    {/* <p className="d-inline">(<strong>Created by</strong> {group.room.createdBy.name})</p> */}
                </div>
                
                <button className="btn btn-warning col-2" onClick={onLeaveGroup}>Leave Group</button>
               
                
            </div>
            <p className="bg-warning"><small>{frsuccessMsg}</small></p>
        </li>
    )
}