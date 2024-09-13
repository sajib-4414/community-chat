import { FC } from "react";
import { Link } from "react-router-dom";
import { LoggedInUser } from "../../models/user.models";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { resetUser } from "../../store/UserSlice";
import { axiosInstance } from "../../utility/axiosInstance";
import { socket } from "../../socket";
import { router } from "../../router";
const env = await import.meta.env;
const SERVER_URL = env.MODE === 'production'?`${window.location.origin}`: "http://localhost:3001"

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
      else{
        dispatch(resetUser())
        router.navigate('/login')
      }
    }
    
    //we will later restore the user from local storage in App.ts,
    //that time we will fetch from just state in header
    // const userStore = useSelector((state:IRootState)=>state.userSlice)
    return(

        <header className="p-3 bg-dark">
    <div className="container">
      <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
        <Link to="/" className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
          <h4> Community chat application</h4>
        </Link>

        <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
          <li><Link to="/discover" className="nav-link px-2 text-secondary">Discover</Link></li>
          <li><Link to="/connectionlibrary" className="nav-link px-2 text-white">Connections & Groups</Link></li>
          <li><Link to="/profile" className="nav-link px-2 text-white">Profile</Link></li>
        </ul>

        <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
          <input type="search" className="form-control form-control-dark text-bg-dark" placeholder="Search..." aria-label="Search"/>
        </form>

        <div className="text-end">
          
          {loggedinUser && loggedinUser?.user ?
          <>
          <strong className="text-light mr-2">{loggedinUser?.user?.name}</strong>
          <img
            src={`${SERVER_URL}${loggedinUser?.user.profileImage}`}
            className="rounded-circle mr-1"
            alt="profile picture"
            width="30"
            height="30"
          />
          <button type="button" className="btn btn-warning" onClick={handleLogout}>Logout</button>
          </>
          
          :
          <>
        <Link to="/login" className="btn btn-outline-light mr-3">Login</Link>
        <Link to="/register" className="btn btn-warning">Sign-up</Link>
          </>}
        </div>
      </div>
    </div>
  </header>
    )
}
export {Header}