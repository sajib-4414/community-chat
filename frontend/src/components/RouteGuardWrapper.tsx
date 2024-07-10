import { Outlet } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../store/store";
import { LoggedInUser } from "../models/usermodels";
import { router } from "../router";
export const RouteGuardWrapper: React.FC = () => {
  const loggedInUser: LoggedInUser|null = useAppSelector(
    (state) => state.userSlice.loggedInUser,
  );
  const initialized = useRef(false);
  useEffect(() => {
    //checking if it is first render
    if (!initialized.current) {
      initialized.current = true;
      //if first time render, then if not logged in show the toast. Because react was rendering this twice.
      if (!loggedInUser) {
        //check again in local storage,  as state takes time to load
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
        //   notificationHook.showNotification("Please login first"); will be added soon
          router.navigate("login");
        }
      }
    }
  }, []);

  return (
    <>
      {/* <ToastContainer /> will be added soon*/}
      <Outlet />
      {/* outlet renders the child components passed to a protected route if validation passes */}
    </>
  );
};