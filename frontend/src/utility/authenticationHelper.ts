import { LoggedInUser } from "../models/user.models";

export const getAuthHeader = (stateLoggedInUser:LoggedInUser|null)=>{
    let user:LoggedInUser|null = stateLoggedInUser
    if(!user){
        const storedUserData = localStorage.getItem("user");
        if(storedUserData){
            user = JSON.parse(
                storedUserData,
            ) as LoggedInUser;
        }
        
    }
    return {
        headers: { Authorization: `Bearer ${user?.token}` }
    }
};