import './App.css';
import { RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { store, useAppDispatch } from "./store/store";
import { useEffect } from 'react';
import { LoggedInUser } from './models/user.models';
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