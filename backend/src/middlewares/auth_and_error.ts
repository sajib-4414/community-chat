import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user";
import { BadRequestError, CustomErrorResponse, InternalServerError, NotAuthenticatedError, NotAuthorizedError, ResourceNotFoundError } from "../definitions/error_definitions";
import { MongoServerError } from 'mongodb';

export const authorizedRequest = async(req:any, res:Response, next:NextFunction)=>{
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
        throw new NotAuthenticatedError('Not authenticated...')
    try{
        //verify the token
        const decoded:JwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        console.log(decoded)
        req.user = await User.findById(decoded.id)
        next()
    }
    catch(err){
        console.log(err)
        throw new NotAuthenticatedError('Not authenticated...')
    }
}

export const globalErrorHandler = (err:Error, req:Request, res:Response, next:NextFunction)=>{
    console.log('error intercepted..................................')
    console.log(err)
    if(err instanceof NotAuthenticatedError || err instanceof NotAuthorizedError || err instanceof ResourceNotFoundError 
        || err instanceof BadRequestError || err instanceof InternalServerError
    ){
        console.log("its coming here")
        res.status(err.statusCode).send({
            errors: err.formattedErrors()
        })
        return; 
    }
    else if (err instanceof MongoServerError && err.code === 11000) {
        // Duplicate key error
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        
        console.log(err)
        return res.status(400).send({
            errors:[{
                message: `Duplicate key error: ${field} with value ${value} already exists.`,
            }]
        })
      }
    //coming here meanserror was not a defined custom error
    console.log(err)
    res.status(400).send({
        errors:[{
            message:'Unexpected server error, see stacktrace'
        }]
    })
}