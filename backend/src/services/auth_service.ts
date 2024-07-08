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
//is invoked in both login and register
const generateToken = (user:IUser)=>{
    //create Token
    const token:string = user.getSignedToken()
    return token

}
export const register = async (payload:IRegisterPayload)=>{
    //validate payload
    //todo add express validator library here

    const user:IUser = await User.create({
        ...payload
    })
    //throw error if user creation fails

    const token = generateToken(user)

    return {
        user,
        token
    };
}