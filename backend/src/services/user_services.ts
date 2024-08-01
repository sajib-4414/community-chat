import { User } from "../models/user"

export const getAllDBUsers = async ()=>{
    const users = await User.find({});
    return users;
}

//return upto 4 results only for autocomplete search
export const getUserAutoCompleteSearchResult = async (keyword:string)=>{
    const users = await User.find(
        {
            name: {'$regex' : keyword, '$options' : 'i'} //means search with contains or like *keyword*
        }
    ).limit(4)
    return users;
}