import { AxiosError } from "axios";
interface MyCustomErrorResponse {
    errors?: { message: string }[];
    // Other properties if needed
}


export const ErrorParser = (error:AxiosError<MyCustomErrorResponse>):string=>{
    if(error.response?.data?.errors){
        try{
            const errorArray = error.response?.data?.errors;
            let finalErrorString = ""
            errorArray.forEach((err:{message:string}) => {
                finalErrorString = finalErrorString+ err.message+"\n"
            });
            if(finalErrorString ==="")
                finalErrorString = "Unknown error occurred, try again"
            return finalErrorString
        }catch(err){
            console.log('failed to display errors',err)
            return "Unknown error occurred, try again"
        }
        
    }
    else
        return "Unknown error occurred, try again"
}