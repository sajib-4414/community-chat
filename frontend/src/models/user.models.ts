export interface LoggedInUser{
    user: User,
    token:string
}

export interface User{
    _id?:string,
    id?:string,
    email:string,
    username:string,
    name:string,
    zipcode:string,
    isOnline:boolean;
    profileImage:string;
}

export interface FriendRequest<S=string,R=string>{
    _id:string;
    isAccepted:Boolean;
    sender:S;
    reciever:R;
    createdAt:Date;
    updatedAt:Date;
    respondTime?:Date;
}