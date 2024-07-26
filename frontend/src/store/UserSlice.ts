import {  createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoggedInUser } from "../models/user.models";

export interface LoggedInUserState {
    loggedInUser: LoggedInUser | null;
}
const initialState:LoggedInUserState = {
    loggedInUser:null
}

export const UserSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        //In these methods, state represents the slice of the entire state.
        //state here means the slice. Within the slice, state means this entire slice, NOT full react state

        //this is a userslice action
        storeUser:(state, action:PayloadAction<LoggedInUser>)=>{
            state.loggedInUser = action.payload
        },
        resetUser:(state)=>{
            state.loggedInUser = null; //=initialState does not work
            localStorage.removeItem("user");
        }
    }

})

export default UserSlice.reducer;
export const {storeUser, resetUser} = UserSlice.actions