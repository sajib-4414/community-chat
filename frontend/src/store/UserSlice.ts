import {  createSlice } from "@reduxjs/toolkit";

const initialState = {
    user:{
        username: '',
    }
}

export const UserSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        //In these methods, state represents the slice of the entire state.
        //state here means the slice. Within the slice, state means this entire slice, NOT full react state

        //this is a userslice action
        storeUser:(state, action)=>{
            const {user} = action.payload
            state.user = user
        },
        resetUser:(state)=>{
            state = initialState
        }
    }

})

export default UserSlice.reducer;
export const {storeUser, resetUser} = UserSlice.actions