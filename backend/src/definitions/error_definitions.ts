import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR } from "./http_constants";

abstract class CustomErrorResponse extends Error{
    statusCode: number;
    constructor(message:string, statusCode:number){
        super(message);
        this.statusCode = statusCode
    }
    formattedErrors() {
        return [{ message: this.message }];
    }
}

class BadRequestError extends CustomErrorResponse{
    constructor(message?:string){
        if(!message){
            super("Request cannot be fulfilled, bad data",HTTP_400_BAD_REQUEST)
        }
        else{
            super(message,400)
        }
        
    }
}

class NotAuthenticatedError extends CustomErrorResponse{
    constructor(message?:string){
        if(!message){
            super("You are not logged in",HTTP_401_UNAUTHORIZED)
        }
        else{
            super(message,HTTP_401_UNAUTHORIZED)
        }
        
    }
}

class NotAuthorizedError extends CustomErrorResponse{
    constructor(message?:string){
        if(!message){
            super("You are not authorized",HTTP_403_FORBIDDEN)
        }
        else{
            super(message,HTTP_403_FORBIDDEN)
        }
        
    }
}

class ResourceNotFoundError extends CustomErrorResponse{
    constructor(message?:string){
        if(!message){
            super("Resource cannot be found",HTTP_404_NOT_FOUND)
        }
        else{
            super(message,HTTP_404_NOT_FOUND)
        }
        
    }
}

class InternalServerError extends CustomErrorResponse{
    constructor(message?:string){
        if(!message){
            super("Internal server error occurred",HTTP_500_INTERNAL_SERVER_ERROR)
        }
        else{
            super(message,HTTP_500_INTERNAL_SERVER_ERROR)
        }
        
    }
}

export {CustomErrorResponse, InternalServerError, NotAuthenticatedError, BadRequestError, ResourceNotFoundError, NotAuthorizedError}