import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoggedInUser } from "../models/usermodels";
import { useAppDispatch, useAppSelector } from "../store/store";
import { resetUser } from "../store/UserSlice";
import { axiosInstance } from "../axiosInstance";
import { socket } from "../socket";

const Header:FC = ()=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const navigate = useNavigate()
    const dispatch = useAppDispatch();

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


    const handleLogout = async()=>{
    console.log("deleting my socket to user after logging out")
    if(socket.id){
        const socketId = socket.id
        await axiosInstance.post('/messages/delete-socket', {socketId},getAuthHeader())
    
        dispatch(resetUser())
        navigate('/login')
        }
    }
    
    //we will later restore the user from local storage in App.ts,
    //that time we will fetch from just state in header
    // const userStore = useSelector((state:IRootState)=>state.userSlice)
    return(
        <header>
            <nav className="container">
                <h2><Link className="header-link-styles" to="/">Dev chat application</Link></h2>
                <ul>
                    <li>Option1</li>
                    <li>Option2</li>
                    {loggedinUser && loggedinUser?.user ?
                        <>
                            <li><strong>{loggedinUser?.user?.name}</strong></li>
                            <li style={{cursor:"pointer"}} onClick={handleLogout}>Logout</li>
                        </>
                        :
                        <li> <Link to="/register" className="header-link-styles" >Signup</Link></li>
                    }
                </ul>
            </nav>
        </header>
    )
}
export {Header}