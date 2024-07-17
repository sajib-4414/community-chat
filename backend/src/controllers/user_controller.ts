import { Request, Response } from "express";
import { getAllDBUsers, getUserAutoCompleteSearchResult } from "../services/user_services";
import { IUser } from "../models/user";
import { BadRequestError } from "../definitions/error_definitions";

//to show in the UI all users
export const getAllUsers = async (req:Request, res:Response)=>{
    const all_users:IUser[] = await getAllDBUsers()
    res.json(all_users)
}

//search users
export const searchUsers = async (req:Request, res:Response)=>{
    const {keyword} = req.query;
    console.log("original keyword is",keyword)
    if(typeof keyword !== 'string'){
        throw new BadRequestError("Invalid keyword format")
    }
    const users:IUser[] = await getUserAutoCompleteSearchResult(keyword)
    res.json(users)
}