import { BadRequestError, NotAuthenticatedError, ResourceNotFoundError } from "../definitions/error_definitions";
import { IUser, User } from "../models/user"

interface IRegisterPayload{
    username:string;
    password:string;
}
export const login = async(payload:IRegisterPayload)=>{
    //validate payload
    //todo add express validator library here

    //extract
    const { username, password } = payload; // Destructure username

    const user:IUser|null = await User.findOne({username}).select('+password')

    if(!user){
        throw new ResourceNotFoundError("User not found")
    } 
    
    //check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        throw new NotAuthenticatedError("Invalid credentials");
    }
    const token = generateToken(user)

    return {
        user,
        token
    };
}
//is invoked in both login and register
const generateToken = (user:IUser)=>{
    //create Token
    const token:string = user.getSignedToken()
    return token

}
export const register = async (payload:IRegisterPayload)=>{
    const user:IUser = await User.create({
        ...payload
    })
    //throw error if user creation fails
    if(!user){
        throw new BadRequestError("User creation failed, check data")
    }

    const token = generateToken(user)

    return {
        user,
        token
    };
}