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
    const headers: Record<string, string> = {
        Authorization: `Bearer ${user?.token || ''}`,
      };
    
      return { headers };
};