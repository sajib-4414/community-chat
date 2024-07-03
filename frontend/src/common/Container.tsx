import React from "react";
import { ContainerProps } from "../interfaces/ContainerProps";
import { Header } from "./Header";
import Footer from "./Footer";
const Container: React.FC<ContainerProps>= ({children})=>{
    return(
        <div>
            <Header/>
            <div 
            // className="container"
            >
                {children}
            </div>
            <Footer/>
        </div>
    )
}
export default Container