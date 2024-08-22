import { Room } from "../models/message.models";
import { User } from "../models/user.models";

export const getInitialsFromUser = (user:User)=>{
    if (user.name){
        const splitwords = user.name.split(" ")
        let initials = splitwords.reduce((acc,curr)=>{
            acc = acc + curr[0]
            return acc
        },"")
        return initials
    }
    else if (user.username)
        return user.username[0]
    else 
        return "N/A"
}

export const getInitialsFromRoom = (room:Room)=>{
    const splitwords = room.name.split(" ")
        let initials = splitwords.reduce((acc,curr)=>{
            acc = acc + curr[0]
            return acc
        },"")
    return initials
}