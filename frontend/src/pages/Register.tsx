import { FC, FormEvent, useState } from "react";
import './login.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { storeUser } from "../store/UserSlice";
import axios from "axios";
export const Register:FC = ()=>{

    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const submitForm = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        //make API call
        axios.post('http://localhost:3001/api/auth/register',{
            username
        }).then((response)=>{
            console.log("response of register call is",response)
            const userJSON = JSON.stringify(response.data);
            localStorage.setItem('user', userJSON);
            dispatch(storeUser({
                user:{
                    username
                }
            }))
            navigate('/');
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
            <button>Register</button>
            </form>
            
        </>
    )
}