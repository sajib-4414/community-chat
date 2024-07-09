import './App.css';
import Container from './common/Container';
import { Routes, Route } from "react-router-dom";
import { ChatHome } from './pages/ChatHome';
import { Login } from './pages/Login';
import { Provider } from 'react-redux';
import { Register } from './pages/Register';
import { store, useAppDispatch } from "./store/store";
import { useEffect } from 'react';
import { LoggedInUser } from './models/usermodels';
import { resetUser, storeUser } from './store/UserSlice';
import { RouteGuardWrapper } from './components/RouteGuardWrapper';
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
      <Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route  element={<RouteGuardWrapper />} >
            <Route path="" element={<ChatHome />} />
          </Route>
        </Routes>
      </Container>
  );
}

export default AppWrapper;