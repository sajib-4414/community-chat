export const ErrorMessage = ({errorLine})=>{
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