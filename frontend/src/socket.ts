import { io } from 'socket.io-client';
import { LoggedInUser } from './models/user.models';
import { SOCKET_CONNECTION_ERROR } from './utility/constants';
const env = await import.meta.env;
const URI = env.MODE === 'production'? window.location.origin: "http://localhost:3001" //3001 is the backend microservice
console.log('socket url is..',URI)

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

const getIo = ()=>{
    const isUserAuthenticated:boolean = getHeaders().auth.token?true :false;
    const isProductionMode:boolean = env.MODE === 'production'
    if(isProductionMode){
        if(isUserAuthenticated){
            return io(URI, 
                {
                    auth:{
                        token:getHeaders().auth.token
                    },
                    path:'/sockets'
                })
        }
        else{
            return io(URI,{
                path:'/sockets'
            })
        }
    }
    else{
        if(isUserAuthenticated){
            return io(URI, getHeaders())
        }
        else{
            return io(URI)
        }
    }
}
let socket = getIo();
socket.on(SOCKET_CONNECTION_ERROR, (err) => {
    console.error("Socket connection error here", err.message); // prints the message associated with the error
});
//after login/register. authentication has been put on local storage, so now refreshing should work
export const refreshSocket = ()=>{
    socket =  getIo();
    return socket;
}
export {socket}