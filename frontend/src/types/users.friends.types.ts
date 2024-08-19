import { User } from "../models/user.models";

export interface discoverFriend{
    isFriend:boolean;
    friend_request_info?:User,
    friend_info?:User
}
export type UserWithFriend = User & discoverFriend