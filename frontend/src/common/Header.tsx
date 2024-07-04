import { FC } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "../store/store";

const Header:FC = ()=>{
    const userStore = useSelector((state:IRootState)=>state.userSlice)
    return(
        <header>
            <nav className="container">
                <h2>Dev chat application</h2>
                <ul>
                    <li>Option1</li>
                    <li>Option2</li>
                    <li>{userStore.user.username===''?'Signup':userStore.user.username}</li>
                </ul>
            </nav>
        </header>
    )
}
export {Header}