import React from "react";
import { ContainerProps } from "../interfaces/ContainerProps";
import { Header } from "./Header";
import Footer from "./Footer";
const Container: React.FC<ContainerProps>= ({children})=>{
    return(
        <>
            <Header/>
            
                {children}
          
            <Footer/>
        </>
    )
}
export default Container