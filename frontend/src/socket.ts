import { io } from 'socket.io-client';
import { LoggedInUser } from './models/usermodels';

const URI = "localhost:3001"
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
export const socket = authToken ? io(URI, headers) : io(URI);