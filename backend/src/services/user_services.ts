import { User } from "../models/user"

export const getAllDBUsers = async ()=>{
    const users = await User.find({});
    return users;
}