import { FC } from "react";
import './login.css'
export const Login:FC = ()=>{
    return(
        <>
            <form className="login-form">
            <input
            placeholder="Username"/>
            <input
            placeholder="Password"/>
            <button>Login</button>
            </form>
            
        </>
    )
}