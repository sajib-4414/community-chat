import { FC, FormEvent, useState } from "react";
import './login.css'
import { useDispatch } from "react-redux";
import { storeUser } from "../store/UserSlice";
import { axiosInstance } from "../utility/axiosInstance";
import { LoggedInUser } from "../models/user.models";
import { router } from "../router";
import { socket } from "../socket";
import { ErrorParser } from "../utility/errorParser";
import { Link } from "react-router-dom";
export const Register:FC = ()=>{

    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [errorLine,setErrorLine] = useState("")
    const dispatch = useDispatch()

    const submitForm = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(username.length === 0){
            setErrorLine("Username is required")
            return;
        }
        if(email.length === 0){
            setErrorLine("Email is required")
            return;
        }
        if(name.length === 0){
            setErrorLine("name is required")
            return;
        }
        if(email.length === 0){
            setErrorLine("email is required")
            return;
        }
        if(password.length === 0){
            setErrorLine("password is required")
            return;
        }
        //make API call
        axiosInstance.post('/auth/register',{
            username,
            name,
            email,
            password
        }).then(async(response)=>{
            console.log("response of register call is",response)
            const registedUser:LoggedInUser = response.data


            console.log("adding my socket to user after loggin in")
            const socketId = socket.id
            const headers = {
                headers: { Authorization: `Bearer ${registedUser?.token}` }
            }
            await axiosInstance.post('/messages/add-socket', {
                socketId
            },headers)
            

            dispatch(storeUser(registedUser))


            const userJSON = JSON.stringify(registedUser);
            localStorage.setItem('user', userJSON);
            dispatch(storeUser(registedUser))
            router.navigate('/');
        }, (error)=>{
            console.log("login failed")
            console.log(error)
            const stringError = ErrorParser(error);
            setErrorLine(stringError)
        })
        
    }
    return(
        // <>
        //     <form className="login-form" onSubmit={submitForm}>
        //     <input
        //     value={name}
        //     onChange={e=>setName(e.target.value)}
        //     placeholder="Your name"/>
        //     <input
        //     value={email}
        //     onChange={e=>setEmail(e.target.value)}
        //     placeholder="Your email"/>
        //     <input
        //     value={username}
        //     onChange={e=>setUserName(e.target.value)}
        //     placeholder="Username"/>
        //     <input
        //     value={password}
        //     type="password"
        //     onChange={e=>setPassword(e.target.value)}
        //     placeholder="Password"/>
        //     <button>Register</button>
        //     <p className="form-error">{errorLine}</p>
        //     </form>
            
        // </>

        <div className="my-3 row justify-content-center align-items-center">

            <form className="col-md-4 border rounded" onSubmit={submitForm}>
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" 
                className="form-control"
                 id="name" 
                 aria-describedby="emailHelp"
                 value={name}
                 onChange={e=>setName(e.target.value)}
                 placeholder="Your Name"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input type="email" 
                className="form-control"
                 id="email" 
                 aria-describedby="emailHelp"
                 value={email}
                 onChange={e=>setEmail(e.target.value)}
                 placeholder="Email"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="name">Username</label>
                <input type="text" 
                className="form-control"
                 id="name" 
                 aria-describedby="emailHelp"
                 value={username}
                 onChange={e=>setUserName(e.target.value)}
                 placeholder="Username"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input 
                className="form-control" 
                id="exampleInputPassword1" 
                value={password}
                type="password"
                onChange={e=>setPassword(e.target.value)}
                placeholder="Password"/>
            </div>
            
            <button type="submit" className="btn btn-primary mb-2">Submit</button>

            <p>Already have an account? <Link to="/login">Login here.</Link> </p>
            <p className="form-error">{errorLine}</p>
        </form>
        </div>
    )
}