import { IUser, User } from "../models/user"

interface IRegisterPayload{
    username:string;
}
export const login = async(payload:IRegisterPayload)=>{
    //validate payload
    //todo add express validator library here

    //extract
    const { username } = payload; // Destructure username

    const user:IUser|null = await User.findOne({
        username
    }) 
    //throw error if login fails
    return user
}
export const register = async (payload:IRegisterPayload)=>{
    //validate payload
    //todo add express validator library here

    //extract
    const { username } = payload; // Destructure username


    const user:IUser = await User.create({
        username
    })
    //throw error if user creation fails

    return user;
}