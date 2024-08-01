import { FC } from "react";
import { Link } from "react-router-dom";
import { LoggedInUser } from "../models/user.models";
import { useAppDispatch, useAppSelector } from "../store/store";
import { resetUser } from "../store/UserSlice";
import { axiosInstance } from "../utility/axiosInstance";
import { socket } from "../socket";
import { router } from "../router";

const Header:FC = ()=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
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
    if(socket.id){
        const socketId = socket.id
        try{
            await axiosInstance.post('/messages/delete-socket', {socketId},getAuthHeader())
        }catch(err){
            //this error is ok to ignore, we attempt to delete a socket from server with the existing
            //user token, but sometime token is invalid. thats why getting a token invalid
            //is ok, and we safely ignore that exception
            console.log(err)

        }finally{
            socket.disconnect()//forcefully disconnecting user
            dispatch(resetUser())
            router.navigate('/login')
        }
        
    
        
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