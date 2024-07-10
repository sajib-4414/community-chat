import './App.css';
import Container from './common/Container';
import { RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';

import { store, useAppDispatch } from "./store/store";
import { useEffect } from 'react';
import { LoggedInUser } from './models/usermodels';
import { resetUser, storeUser } from './store/UserSlice';
import { router } from './router';
const AppWrapper = ()=>{
  return(
    //we are wrapping so that App component itself can use React redux store(dispatch command), fetch functionalities
    <Provider store={store}>
      <App />
    </Provider>
  )
}
function App() {
  const dispatch = useAppDispatch(); // Works!
  useEffect(()=>{
    const storedUserData = localStorage.getItem("user");
    if(storedUserData){
      const loggedInUser: LoggedInUser = JSON.parse(
        storedUserData,
      ) as LoggedInUser;
      dispatch(storeUser(loggedInUser))
    }
    else{
      dispatch(resetUser())
    }
  })
  return (
      // <Container>
        <RouterProvider router={router} />
      // </Container>
  );
}

export default AppWrapper;