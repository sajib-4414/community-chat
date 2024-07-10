#### configuration of express server and socketio server
```
//initializaing a socket and express server
const expressServer = express()
const server = createServer(expressServer)
const io = new Server(server,{})

//when a new socket joins to the server
//or when a new client connects
io.on("connection", (socket: Socket) => {
    console.log('new socket client just joined')
});

expressServer.get('/',(req,res)=>{
    res.send('Hello world')
})

server.listen(3001, ()=>{
    console.log('http server is running at 3001 port')
})
```
**
Vite has by default support for .env files.
How to use: https://stackoverflow.com/a/77102955


Library to add
* express validator
* mongoose aggregate pagination
* mongo migrate
* express async error
* bcrypt
* something for jwt
* route creating library

CORS:
const cors = require('cors')
expressServer.use(cors())//using default settings, CORS-> Allow all server
//best approach is to configure which server to allow

Problem solving:
1. Was not able to join room through backend api when socket connection is already established. 
 // //this code not working, does not fire anymore when client is already joined
        // io.on("connection", (socket:any) => {
        //     console.log("inside the on connection")
        //     socket.join(room.name);
        // });

        const socket = io.sockets.sockets.get(socketId);
so i did not have the socket instance to join it in the room. solve was, sending currently connected socket id from 
frotnend to server. then in the api call
const socket = io.sockets.sockets.get(socketId);
socket.join(room.name);

2. How to handle one to one chat?
one to one message was done by private channel.
we could do just connecting one socket to another, but that way we will loose reference once socket disconnected
and could not store and retrieve messages. so i decided i could do a channel pvt-username1-username2
and communicating through this room will be their one to one chat.

3. how did i handle first time chat of one to one?
one approach was as soon as someone clicks somebody's name, create a pvt channel(either by requeting throuh api or via socket event). but if person is not doing chat, it would be redudnant chatroom creation in the database.
another approach was, as soon as someone clcks someone's name, it will create a socket event, server will create a charoom in DB, join both of them, this will be option too. but that means so many uncessary channels, if the user does not chat eventually.

4. how to get scoket instance throughout the app?
If I want to access the io instance from a controller to emit something, and create a new io with new Server() everytime in every controller, in that case client could be [test kor nai] connected to another controllers another socket. also we will be creating so many socket instances.
better way, use a singleton instead of creating every time new Server(). 

5. Problem:
until both user started to chat with each other, then they are not part of a room actively(private chat mainly), and both are not connected via socket with room, so the message sent via socket to a room does not reach from one to another. 
Mainly because i make a user socket join a room upon message, not before that.
if both user message each other then they join a room and start to see messages instantly.
solution is to make both users part of the room before he gets a message.

Related scenario:
1. user has not clicked, but chatted before/Joined that room before, so he is a part of the room.
upon chatUI launch, join him to all those rooms. so he can get all messages of all the rooms he is part of with socket upon entering the chatpage
=> it worked. created an API to join user's socket to all rooms. in client with socket on connect i called an api with the socketId to make user join all rooms.
2. user has not clicked or chatted before, but someone new messaged him.
for this case, he has just become part of a new room.
i think we can do it,
so user1 has messaged user2, they have not chatted before, no private room exists between them.
so the user1's first message sent via API, in that API I am making the user1's socket to join the room,
and send the message back to user1 from server via socket.
and in the API i am also making user2 a part of the same room.
I just need to make user2 actively join that room, for that i need user2's socket.
Solution: will add a socket Id array for each user. so another model, UserSocket.
it will have a new Model, UserSocket: user, socketId[]
there will be an API, addUserSocket [ deleting old sockets for the moment, have to later store all socketId until deleted, right now seeing socket disconnect is not fired at all], deleteUserSocket[] upon logout.
whenver backend sees a message(from user1) for a channel(like pvt-user1-user2),where user2 that is new, so user2's is socket is not yet connected to that room, so we will query the user2's associated socketIds in the backend, find socket with the socketId and join that socket (of User2) to the new room. Now we send message to the room. I must say, we will recieve user1's socketId in the backend call, and user1 will be also added to the room as well. so both user1, user2 will be added to the room and then server will send the message to the room.


Also learnt about backend integration properly with frontend,
especiaally which query to run, for which ui, which mongoose query to run, response.

if you jsut use express async error, and continue to throw error, it wil always throw 500.
if you want to handle it, you have to use a global error handler to catch the error, and to properly send a response to user.
just having something like this wont properly handle the error, express async error will always show 500 if not caught with a global handler like below.
class CustomErrorResponse extends Error{
    statusCode: number;
    constructor(message:string, statusCode:number){
        super(message);
        this.statusCode = statusCode
    }
}

class BadRequestError extends CustomErrorResponse{
    constructor(message?:string){
        if(!message){
            super("Request cannot be fulfilled, bad data",HTTP_400_BAD_REQUEST)
        }
        else{
            super(message,400)
        }
        
    }
}
```
app.use((err, req, res, next) => {
    if (err instanceof NotAuthenticatedError) {
        res.status(err.statusCode).json({ message: err.message });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
```
specialty of this hadnler means, only this middleware will be contacted, or this will intercept
if there is errors. other middleware which does not have err in the definiton, will not catch errors
in the request response cycle.
//global error handler, It must be placed after all routes, controllers are assigned to app instance,
//that intercept any error that happens in the request response cycle
app.use(globalErrorHandler)

*** to have a base url for all axios request, and intercept all api response errors, and customizing it
to redirect to login page, we need to have axios instance, we will use it throughout the app.
import axios from "axios";
const env = await import.meta.env;
const BASE_URL = env.VITE_APP_API_URL || 'http://localhost:3001/api'; // Default URL

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Add other axios configurations here
    timeout: 10000, // Set timeout in milliseconds (optional)
    headers: {
      'Content-Type': 'application/json', // Default content type (optional)
    },
  });

  //also intercepting the error to watch for some kind of errors
  //such as for 401 redirect to login page
  //could do that in any axios instance, inside the component too.
  //but using here such that all axios in the app are intercepted

  axiosInstance.interceptors.response.use(
    (response)=>{
      console.log('Response:', response);
      return response;
    },
    (error)=>{
      if(error!=null && error.status === 401){
        console.log('401 error happened.............')
      }
      //intercepting and sending the same error to the caller component
      return Promise.reject(error)
    }
  )

but now we need a custom router component to use the router.navigate('/login') inside the axios
isntead of react router dom's navigate. react router dom's navigate does not work out of component.
create a new router.tsx file
const HOCWithContainer = (OriginalComponent) => {
    function NewComponent(props) {
      return (
        <Container>
          <OriginalComponent {...props} />
        </Container>
      );
    }
    return NewComponent;
};
const WrappedRegister = HOCWithContainer(Register)
const WrappedLogin= HOCWithContainer(Login)
now specify the router paths like this(dont use Browser Router, Router, Routes now in the project) in the router.tsx file,
export const router = createBrowserRouter([
    {
      element: <GuardedChatHome />,
      path: ""
    },
    {
        path: "/register",
        element: <WrappedRegister/>
      },
      {
        path: "/login",
        element: <WrappedLogin/>,
      }
 ])
inside app component return this,
<RouterProvider router={router} />

  error boundary sikha lagbe

*** proper way te routeguard, for every protected route, loggedInUser is checked first.
const GuardedHOC = (OriginalComponent:any) => {
  function NewComponent(props:any) {
  //render OriginalComponent and pass on its props.
    
  const loggedInUser: LoggedInUser|null = useAppSelector(
    (state) => state.userSlice.loggedInUser,
  );
  useEffect(()=>{
    if (!loggedInUser) {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
        //   notificationHook.showNotification("Please login first"); will be added soon
          router.navigate("login");
        }
    }
  },[loggedInUser])
    return loggedInUser ? <OriginalComponent {...props} /> : null;
  }
  return NewComponent;
};
export default GuardedHOC;

//in destination
const GuardedChatHome = GuardedHOC(WrappedChatHome)
<GuardedChatHome />
