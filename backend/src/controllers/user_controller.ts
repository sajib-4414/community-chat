import { Request, Response } from "express";
import { getAllDBUsers, getUserAutoCompleteSearchResult } from "../services/user_services";
import { IUser } from "../models/user";
import { BadRequestError, InternalServerError } from "../definitions/error_definitions";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config()

//to show in the UI all users
export const getAllUsers = async (req:Request, res:Response)=>{
    const all_users:IUser[] = await getAllDBUsers()
    res.json(all_users)
}

//search users
export const searchUsers = async (req:Request, res:Response)=>{
    const {keyword} = req.query;
    if(typeof keyword !== 'string'){
        throw new BadRequestError("Invalid keyword format")
    }
    const users:IUser[] = await getUserAutoCompleteSearchResult(keyword)
    res.json(users)
}

//validate a zip code with opencage
export const validateZipcode = async (req:Request, res:Response)=>{
    const {zip} = req.body
    try{
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${process.env.OPEN_CAGE_API_KEY}&language=en&pretty=1`)
        const actualData = response.data
        const {lat, lng} = actualData.results[0].geometry
        res.status(200).json({
            geolocation:{
                lat,
                lng
            },
            status:'success'
        })
    }catch(err){
        console.log('Geolocation fetch failed, error=',err)
        throw new InternalServerError('Validation check failed, try again with correct data')
    }
    
}