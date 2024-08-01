import { io } from 'socket.io-client';
import { LoggedInUser } from './models/user.models';
import { SOCKET_CONNECTION_ERROR } from './utility/constants';

const URI = "localhost:3001"
const getHeaders = ()=>{
    const storedUserData = localStorage.getItem("user");
    let authToken;
    if(storedUserData){
        const loggedInUser: LoggedInUser = JSON.parse(
          storedUserData,
        ) as LoggedInUser;
        if(loggedInUser)
            authToken =loggedInUser.token;
    
    }
    const headers = {
        auth: {
            token: authToken
        }
    }
    return headers
}

let socket = getHeaders().auth.token ? io(URI, getHeaders()) : io(URI);
socket.on(SOCKET_CONNECTION_ERROR, (err) => {
    console.error("Socket connection error here", err.message); // prints the message associated with the error
});
//after login/register. authentication has been put on local storage, so now refreshing should work
export const refreshSocket = ()=>{
    socket =  getHeaders().auth.token ? io(URI, getHeaders()) : io(URI);
    return socket;
}
export {socket}