import React from "react"

export const ErrorMessage:React.FC<{errorLine:string}> = ({errorLine}:{errorLine:string})=>{
    return (
        <>
        {
            errorLine?
            <p className="bg-danger text-white rounded px-1 py-1">{errorLine}</p>
            :''
        }
        </>
        
    )
}