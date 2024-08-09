import { useEffect, useState } from "react"
import { LoggedInUser, User } from "../models/user.models"
import { useAppSelector } from "../store/store"
import { getAuthHeader } from "../utility/authenticationHelper"
import { axiosInstance } from "../utility/axiosInstance"

export const UserProfile = ()=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const [username, setUserName] = useState("");
    // const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    
    const fetchUserProfile = async ()=>{
        const response = await axiosInstance.get('/auth/me',getAuthHeader(loggedinUser))
        const user:User = response.data
        setUserName(user.username)
        setName(user.name)
        setEmail(user.email)
    }
    useEffect(()=>{
        fetchUserProfile()
    },[])
    return (
        <div className="my-3 ">
            <div className="row justify-content-center">
            <p className="display-4">Your Profile</p>
            </div>

            <div className="row justify-content-center align-items-center">
            

            <form className="col-md-4 border rounded" 
            // onSubmit={submitForm}
            >
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" 
                className="form-control"
                 id="name" 
                 aria-describedby="emailHelp"
                 value=  {name}
                 onChange={e=>setName(e.target.value)}
                 placeholder="Your Name"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <p
                 id="email" 
                 aria-describedby="emailHelp"
                >{email}</p>
            </div>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <p
                 id="username" 
                 aria-describedby="emailHelp"
                >{username}</p>
            </div>
            <div className="form-group">
                <label htmlFor="profileimage">Profile Image</label>
                <input className="form-control" type="file" id="formFile"/>
            </div>
            {/* <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input 
                className="form-control" 
                id="exampleInputPassword1" 
                value={password}
                type="password"
                onChange={e=>setPassword(e.target.value)}
                placeholder="Password"/>
            </div> */}
            
            <button type="submit" className="btn btn-primary mb-2">Submit</button>

            {/* <p>Already have an account? <Link to="/login">Login here.</Link> </p> */}
            {/* <p className="form-error">{errorLine}</p> */}
        </form>
        </div>
        
        </div>
        
    )
}