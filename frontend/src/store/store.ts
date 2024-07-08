import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./UserSlice";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export const store = configureStore({
    reducer:{
        userSlice: UserSlice
    }
})
//for typescript, we have to define the dispatch in store as well
export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
export type IRootState = ReturnType<typeof store.getState>