import { Friend, FriendRequest, User } from "../models/user.models";

export interface discoverFriend{
    isFriend:boolean;
    friend_request_info?:FriendRequest<string|User,string|User>,
    friend_info?:Friend
}
export type UserWithFriend = User & discoverFriend
export type modalAction = "close" | "save"
export type FriendActionButtonT = "friend_request_sent_success" 
| "friend_responded_deny" | "friend_pending_request_remove_success"
 | "friend_removal_success" | "friend_responded_accept"