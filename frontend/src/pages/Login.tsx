import { FC, FormEvent, useState } from "react";
import './login.css'
import { Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { storeUser } from "../store/UserSlice";
import { axiosInstance } from "../axiosInstance";
import { LoggedInUser } from "../models/usermodels";
import { socket } from "../socket";
import { router } from "../router";
export const Login:FC = ()=>{

    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [errorLine,setErrorLine] = useState("")
    const dispatch = useDispatch()

    const submitForm = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(username.length === 0){
            setErrorLine("Username is required")
            return;
        }
        
        if(password.length === 0){
            setErrorLine("password is required")
            return;
        }
        //make API call
        axiosInstance.post('/auth/login',{
            username,
            password
        }).then(async (response)=>{
            console.log("response of login call is",response)
            const registedUser:LoggedInUser = response.data
            const userJSON = JSON.stringify(registedUser);
            localStorage.setItem('user', userJSON);

           
            console.log("adding my socket to user after loggin in")
            const socketId = socket.id
            const headers = {
                headers: { Authorization: `Bearer ${registedUser?.token}` }
            }
            await axiosInstance.post('/messages/add-socket', {
                socketId
            },headers)
            

            dispatch(storeUser(registedUser))
            
            router.navigate('/');
        }, (error)=>{
            console.log("login failed")
            console.log(error)
        })
        
    }
    return(
        <>
            <form className="login-form" onSubmit={submitForm}>
            <input
            value={username}
            onChange={e=>setUserName(e.target.value)}
            placeholder="Username"/>
            <input
            value={password}
            type="password"
            onChange={e=>setPassword(e.target.value)}
            placeholder="Password"/>
            <button>Login</button>
            <p>
            <span>Dont have an account? <Link to="/register">Register here.</Link> </span>
            </p>
            <p className="form-error">{errorLine}</p>
            </form>
            
            
        </>
    )
}