import { useEffect, useState } from "react"
import { LoggedInUser, User } from "../../models/user.models"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useAppSelector } from "../../store/store";
import { ErrorMessage } from "../common/ErrorMessage";
import { axiosInstance } from "../../utility/axiosInstance";
import { getAuthHeader } from "../../utility/authenticationHelper";
import { modalAction } from "../../types/users.friends.types";
import { ServerMessagePayload } from "../../models/message.models";

export const GroupChatModal = ({chosenFriends, modalShow, onModalClose}:{chosenFriends:User[], modalShow:boolean, onModalClose:(action:modalAction, responseGroupMessage:ServerMessagePayload|null)=>void})=>{

    const [allFriends,setAllFriends] = useState<User[]>([])
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const [moreFriends, setMoreFriends] = useState<User[]>()
    const [errorLine,setErrorLine] = useState("")
    const [chosenIds, setChosenIds] = useState<string[]>([])
    const handleSubmit = async (action:modalAction)=>{
        console.log(action)

        if(action === "close"){
            onModalClose(action,null)
        }
        else if (action === "save"){
            if(chosenIds.length===0)
                setErrorLine("plesae choose at least one friend, or abort creating group chat")
            else
                {
                    const userIds1:string[] = chosenFriends.reduce((acc:string[],friend)=>{
                        if(friend && friend._id){
                            acc.push(friend._id)
                        }
                        return acc
                    },[])
                    
                    const userIds = userIds1.concat(chosenIds)

                    try{
                        const response = await axiosInstance.post('/messages/create-chat-group', {
                            userIds
                        }, getAuthHeader(loggedinUser))
                        if(response.status>399){
                            onModalClose("close",null)
                        }
                        else{
                            onModalClose(action,response.data)
                        }

                    }catch(err){
                        console.log('group chat crate error',err)
                        onModalClose("close",null)
                    }
                    
                    
                }
        }

        
    }

    const handleCheckBoxChange = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const { name, checked } = event.target;
        if(checked){
            setChosenIds([...chosenIds, name])
        }
        else{
            setChosenIds(chosenIds.filter(id=>id!==name))
        }
        
    }
    useEffect(()=>{
        axiosInstance.get(`/users/connections`,getAuthHeader(loggedinUser)).then((response)=>{
            const allFriends:User[] = response.data
            setAllFriends(allFriends)
        })
    },[])
    useEffect(()=>{
        const friendsSet = new Set()
        chosenFriends.forEach(friend=>friendsSet.add(friend._id))
        console.log('set=',friendsSet)
        if(allFriends){
            const moreFriends = allFriends.filter(friend=> !friendsSet.has(friend._id))
            setMoreFriends(moreFriends)
        }
        
    },[allFriends, chosenFriends])

    useEffect(()=>{
        setErrorLine("")
    },[modalShow])

    return (
        <div
          className="modal show"
          style={{ display: 'block', position: 'initial' }}
        >
          <Modal show={modalShow} onHide={handleSubmit.bind(null,"close")}>
            <Modal.Header closeButton>
              <Modal.Title>Choose friends to start a group chat</Modal.Title>
            </Modal.Header>
    
            <Modal.Body>
            <div className="mb-2">
                <h5>Friends chosen</h5>
                <div className="border p-2">
                    {chosenFriends.map((friend,index)=>{
                        return (
                            <div key={index} className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" disabled checked/>
                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                    {friend.name}
                                </label>
                            </div>
                        )
                    })}
                    
                </div>
                
             </div>

             <h5>Friends to choose</h5>
            <ul className="list-group">
                {moreFriends?.map((friend,index)=>{
                    return(
                    <li key={index} className="list-group-item">
                        <div className="form-check">
                            <input 
                            className="form-check-input" 
                            type="checkbox" 
                            value="" 
                            name={friend._id}
                            id={`flexCheckDefault-${index}`}
                            onChange={handleCheckBoxChange}
                            />
                            <label className="form-check-label" htmlFor={`flexCheckDefault-${index}`}>
                                {friend.name}
                            </label>
                        </div>
                    </li>
                    )
                })}
                
                
            </ul>
            <ErrorMessage
            errorLine={errorLine}/>
            </Modal.Body>
    
            <Modal.Footer>
              <Button variant="secondary" onClick={handleSubmit.bind(null,"close")}>Close</Button>
              <Button variant="primary" onClick={handleSubmit.bind(null,"save")}>Create group chat</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
}

