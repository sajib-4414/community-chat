import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header:FC = ()=>{
    const [username, setUsername] = useState("")
    const navigate = useNavigate()
    useEffect(()=>{
        const storedUserJson = localStorage.getItem("user")
        if(storedUserJson){
            const storedUser = JSON.parse(storedUserJson)
            if(storedUser.username !== ""){
                setUsername(storedUser.username)
            }
        }
    })
    const handleLogout = ()=>{
        localStorage.removeItem('user');
        navigate('/login')
    }
    //we will later restore the user from local storage in App.ts,
    //that time we will fetch from just state in header
    // const userStore = useSelector((state:IRootState)=>state.userSlice)
    return(
        <header>
            <nav className="container">
                <h2>Dev chat application</h2>
                <ul>
                    <li>Option1</li>
                    <li>Option2</li>
                    <li>{username===''?'Signup':username}</li>
                    {username!==''?<li style={{cursor:"pointer"}} onClick={handleLogout}>
                        Logout
                    </li>:''}
                </ul>
            </nav>
        </header>
    )
}
export {Header}