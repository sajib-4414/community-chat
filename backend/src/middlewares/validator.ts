import { NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateValidators = (req:any,res:any,next:NextFunction)=>{
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        throw new Error('Validation failed: ' + JSON.stringify(validationErrors.array()));
    }

    next();
}