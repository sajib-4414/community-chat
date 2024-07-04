import { Request, Response } from "express";
import { login, register } from "../services/auth_service";


export const Register = async(req:Request, res:Response)=>{

    //validate payload
    //todo add express validator library here

    const user = await register(req.body)
    res.json(user)
}


export const Login = async(req:Request, res:Response)=>{

    //validate payload
    //todo add express validator library here

    const user = await login(req.body)
    res.json(user)
}