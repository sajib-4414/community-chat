import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user";

const protect = async(req:any, res:Response, next:NextFunction)=>{
    let token:any;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        //set token from bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    //if the token is sent via cookie
    else if (req.cookies.token){
        token = req.cookies.token
    }

    //Make sure token is a non empty non null one
    if(token === undefined || !token)
        throw new Error('Not authorized')
    try{
        //verify the token
        const decoded:JwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        console.log(decoded)
        req.user = await User.findById(decoded.id)
        next()
    }
    catch(err){
        console.log(err)
        throw new Error('Not authorized')
    }
}