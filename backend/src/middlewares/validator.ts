import { NextFunction } from "express";
import { validationResult } from "express-validator";
import { BadRequestError } from "../definitions/error_definitions";

export const validateValidators = (req:any,res:any,next:NextFunction)=>{
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        throw new BadRequestError('Validation failed: ' + JSON.stringify(validationErrors.array()));
    }

    next();
}