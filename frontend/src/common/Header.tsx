import { FC } from "react";

const Header:FC = ()=>{
    return(
        <header>
            <nav className="container">
                <h2>Dev chat application</h2>
                <ul>
                    <li>Option1</li>
                    <li>Option2</li>
                    <li>Signup</li>
                </ul>
            </nav>
        </header>
    )
}
export {Header}