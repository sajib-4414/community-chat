export interface LoggedInUser{
    user: User,
    token:string
}

export interface User{
    _id: string,
    email:string,
    username:string,
    name:string
}