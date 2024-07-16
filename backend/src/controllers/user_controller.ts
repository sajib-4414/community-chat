import { Request, Response } from "express";
import { getAllDBUsers, getUserAutoCompleteSearchResult } from "../services/user_services";
import { IUser } from "../models/user";

//to show in the UI all users
export const getAllUsers = async (req:Request, res:Response)=>{
    const all_users:IUser[] = await getAllDBUsers()
    res.json(all_users)
}

//search users
export const searchUsers = async (req:Request, res:Response)=>{
    const {keyword} = req.params;
    const users:IUser[] = await getUserAutoCompleteSearchResult(keyword)
    res.json(users)
}