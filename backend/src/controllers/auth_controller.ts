import { Request, Response } from "express";
import { login, register } from "../services/auth_service";
import { InternalServerError, ResourceNotFoundError } from "../definitions/error_definitions";


export const Register = async(req:Request, res:Response)=>{

    //validate payload
    //todo add express validator library here

    const {user,token} = await register(req.body)
    const jwtCookieExpire = process.env.JWT_COOKIE_EXPIRE;
    if(!jwtCookieExpire){
        throw new InternalServerError('JWT_COOKIE_EXPIRE is not defined');
    }
    console.log('jwt cookie expire is',jwtCookieExpire)
    const options:any = {
        maxAge: new Date(Date.now() + Number(jwtCookieExpire)*24*60*60*1000),
        httpOnly:process.env.IS_ENVIRONMENT_HTTP_ONLY
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.status(201).cookie('token',token, 
        // options //have to figure out the options parameter
    )
    .json({
        user:user,
        token:token
    })
}


export const Login = async(req:Request, res:Response)=>{

    //validate payload
    //todo add express validator library here

    const user = await login(req.body)
    res.json(user)
}