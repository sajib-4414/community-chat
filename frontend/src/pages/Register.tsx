import { FC, FormEvent, useState } from "react";
import './login.css'
import { useDispatch } from "react-redux";
import { storeUser } from "../store/UserSlice";
import { axiosInstance } from "../axiosInstance";
import { LoggedInUser } from "../models/usermodels";
import { router } from "../router";
import { socket } from "../socket";
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
        })
        
    }
    return(
        <>
            <form className="login-form" onSubmit={submitForm}>
            <input
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Your name"/>
            <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="Your email"/>
            <input
            value={username}
            onChange={e=>setUserName(e.target.value)}
            placeholder="Username"/>
            <input
            value={password}
            type="password"
            onChange={e=>setPassword(e.target.value)}
            placeholder="Password"/>
            <button>Register</button>
            <p className="form-error">{errorLine}</p>
            </form>
            
        </>
    )
}