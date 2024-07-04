import { FC, FormEvent, useState } from "react";
import './login.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { storeUser } from "../store/UserSlice";
export const Login:FC = ()=>{

    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const submitForm = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        //make API call
        console.log("username=",username,"password is",password)
        dispatch(storeUser({
            user:{
                username
            }
        }))
        navigate('/chat');
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
            </form>
            
        </>
    )
}