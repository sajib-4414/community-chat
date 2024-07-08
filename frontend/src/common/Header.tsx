import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoggedInUser } from "../models/usermodels";
import { useAppDispatch, useAppSelector } from "../store/store";
import { resetUser } from "../store/UserSlice";

const Header:FC = ()=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const navigate = useNavigate()
    const dispatch = useAppDispatch();
    const handleLogout = ()=>{
        dispatch(resetUser())
        navigate('/login')
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