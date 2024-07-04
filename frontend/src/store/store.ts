import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./UserSlice";

export const store = configureStore({
    reducer:{
        userSlice: UserSlice
    }
})

export type IRootState = ReturnType<typeof store.getState>