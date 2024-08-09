### How to create a backend HTTP server and SocketIo server both?

In App.ts
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

### Could not make a socket(of a client) join a room in backend when socket is already connected:
Was not able to join room through backend code when socket connection is already established. This is the socketIo instance's listener code on server,
```
 // //this code not working, does not fire anymore when client is already joined
         io.on("connection", (socket:any) => {
             console.log("inside the on connection")
             socket.join(room.name);
         });
```
Solution was to use the socketId of client to retrive the client socket and then make that socket join a room. ways to do that was, either client can send the socketId when they join via API call or socketio event to backend. or client can send socketId in every event they emit to server.

**However I think the best approach** was to send the socketId to server upon login or upon entering a socketbased frotnend page(like chatHome) page, and server will the store the socketId of a user in a Model like Usersocket. From there server can retrieve the socketId.

Once we have the socketId somehow, then in the backend code when we need to make the socket join a room, just use
```
const socket = io.sockets.sockets.get(socketId);
socket.join(room.name);
```

### Using room facility of the socketIo how to do a One to One chat?
It will be done through a private room.

Naive approach: we could do just make  one socket join the other socket (each socket acts like a room also)on demand, but that way we will loose reference once socket disconnected. We need to store retrieve the one to one chat sessions.

Better approach: so i decided i could do a channel pvt-username1-username2 and communicating through this room will be their one to one chat. Both frotnend and backend will know this. Their will be a backend Room Model with just name. And another model roommembers, which will hold room reference and user reference to keep track of members. For any new chat, frotnend will form this name(pvt-username1-username2) and send to backend. Backend will create a new room with this name. Problem is, we are exposing the the business logic to the frotnend, and thats too easy and easy to exploit way of creating a one to one chat room.

Even better: first time chat er jonno frotnend sudhu name gula pathato, backend dekhto room ase kina, na thakle banay dito, then frotnend k room dito, kivabe room banabe eta backend er upore. In future, we will stop sending roomInfo details to frotnend, backend should only receive roomId, and send roomId.

### How to do a private chat and group chat both with almost similar implementation?
I have not done the group chat yet, but I think the current approach for one to one chat will require very few changes for group chat.

first e room, roommembers, messages, users erkm collection banai, then dekhlam rpivate chat er jonno roommemmber theke abar join kore ana redundant, as just duita user. so ami one to one chat er jonno duita room member er name, room model ei rekhe disi, group chat er jonno roommembers model use hobe, as room e eonek onek lok thakte pare.
Current RoomModel has `room code, privateRoomMembers, roomType`

### What to do when first time someone messages someone[one to one chat]? should we create private rooms for all user combinations beforehand?

Naive approach: one approach was as soon as someone clicks somebody's name, we create a pvt channel in backend(either frontend will emit socketio event or invoke backend API). but if person does not end up doing the chat, it would be redudnant chatroom creation in the database.
Better Approach: create rooms on the go, only if the user1 sends message to user2 then. See the below step that covers both firt time chat and subsequent chats.

### How should we initiate/start private chats with socketIo room terminology?
* Case 1: User1 is sending message to User2, **none of them chatted before**. We need to create a private room and messsages between user1 and user2 only should stay between them. But when should we make them join channels?

    Solution: Backend Room model will have `RoomType, RoomCode, isPrivate, privateRoom Members`. UserSocket Model `UserSocket: user, socketId[]`
    
    For first message user1 sends message to user2,  front end will send, 

    ```
    messagetype = one to one, 
    targetUser: user[for group chat this will not be sent/null], 
    message content, 
    roomInfo[will be left empty for first private message]
    ```
    backend sees there is no room info submitted and message type is one to one. Still it checks if there is a Room which is one to one type Room, where both user1, user2 is there as private members. if it is, then they already have a private room, if not, then backend creates such room. now in the backend we make the socket, reciver socket (backend retrieves socketIds from the UserSocket Model)join to the private [existing/created] room and sever send the message to that room. For the sender its a replay of his own message, and for the receiver he sees something new for the first time. Adding sockets to the room is idempotent, as its a set.We could do some optimization later that should we check if user is already there. 
* **Case2 users chatted before**: For later messages
frotnend sends the following with socketio emit
    ```
    messagetype=one to one chat, 
    targetUser, 
    message content, 
    roomInfo(frotnend already has it)
    ```
backend retrieves that room from db. Then backend creates a message object in DB, with Room reference. Backend also retrieves the socketIds from the UserSocket model, then from the socketIds it retrieves the sockets for both these users. **Backend joins the two sockets** to the room(to make sure sockets surely gets the messages, adding socket to room is an constant Set operation, but we can optimize it), then backend emits the messsage to the room so both the private users ge the instant messsage. When joining reciver, socket maybe invalid as receiver maybe offline, so ignore that error with try catch.

Issues faced before this redundant joining room was done: Before I only make the current usr join a private room(of DB) when he messaged another person. In that case, it left a bug, until both user started messaging each other, they wont be connected to the room, and both of them wont get instant messages, solution was to add receiver user to the privateRoom for each message sent from sender. 

### How and when to keep track of user sockets in the server?
I added API, addUserSocket [ deleting old sockets for the moment, have to later store all socketId until deleted, right now seeing socket disconnect is not fired at all], call API deleteUserSocket upon logout& socketDisconnect.


### Now how to use the previous section logic to start a new chat with Live Socket or previous chat from the UI(one to one)
* **Case 1 users may or maynot have chatted before, but user has clicked another user contact to start chat**:
backend always check if there is room exist for that user1,user2 as room can be empty for first time chats. 
frontnend  case sends

    ```
    messagetype=one to one chat, 
    targetUser, 
    message content, 
    roomInfo:None
    ```
* **Case 2 users may or maynot have chatted before, user clicked a recent chat to keep chatting with someone**:
frontnend in this case sends

    ```
    messagetype=one to one chat, 
    targetUser=extracted from the roomInfo detail's privateRoomMembers, 
    message content, 
    roomInfo:have it, roomInfo was provided when recent chats api was called
    ```
### How to design a Room Model such that we can keep the support the private chat& group chat?
First naive implementation was: if user1 messages user2, we create a channel named as pvt-username1-username2.
we sort the username so that either user1, user2 can access the same channel. With this system we know who are the private chat memmebers just from name. But this is too naive, and people can exploit the system by sending strings(pvt-username1-username2) like this to create as many as channels in the backend.
Better approach:
for roomtype one to one, we keep an array of privateRoomMembers:[user1,user2], for group chat it will be empty.
for group chat privateRoomMembers will be empty and roommember model will have reference to all (user, room) combinations.

### How to retrive the chat history with a person(one to one) in backend?
now how will getAllPrevious messages API work: 
frotnend API call payload, 

```
type-one-to-one[whether user clicked a contact name or recent chat],
roomInfo:null/info[null when just contact is chosen. roominfo will be there when someone clicked a recent chat], 
targetUser
```

### Users chatted before(one to one), but is not receiving the instant message before from that persons?
Although when backend sends a message to a private room(because one of the private users want to send a message to other user), backend tries to make the sender, reciver both sockts to join a room, But if the reciver is offline when the message was sent, then when receiver comes online he may not start getting the instant messages, because backend obivously failed to send message with socket to this receiver[although he will see message from DB in the recents]. For this purpose upon logging in+coming to the chatHome page, we call an API so that backend make the client socket join to all rooms he was part of before, so we will start getting messages.
There is some redudancy like we could omit joining the receiver to the room everytime when backend sends next message, but we migth miss some edge cases, we have to check and test

### What to send to the frotnend for every emit message from server(for one to one chat) such that curent chatwindow, recent chat can be appropriately populated?
frontend needs, dbMessage object, roomInfo. Roominfo will be used for groupchat to show rooName in the recent chat window. RoomInfo is also used in recent chat window for one to one chats as well, as RoomInfo has the name of two private members(for one to one) who is in it, so the frotnend can show the other user with who the current user is chatting with. 


### How to get the Socketio Server instance without creating everytime throughtout the backend app?
If I want to access the io instance from a controller to emit something, and create a new io with new Server() everytime in every controller, in that case client could be [is not tested] connected to another controllers another socket. also we will be creating so many socket instances.
better way, use a singleton instead of creating every time new Server(). 
```
export const initializeSocketIoServer = (httpExpressServer:any)=>{
    io = new Server(httpExpressServer,{
        cors: {
          origin: "frotnend server url" //for CORS
        }
    })
    //when a new socket joins to the server
    //or when a new client connects
    io.on("connection", (socket: Socket) => {
        console.log('new socket client just joined, socket id=', socket.id)
        socket.on(USER_JOINED_ROOM,()=>{
            console.log('Client joined')
        })
        socket.on(USER_ROOM_JOIN_REQUEST,({roomName})=>{
            socket.join(roomName);
            console.log('CLient want to join a room')
        })
        socket.on(MESSAGE_TO_SERVER,async (payload:MessagePayLoadToServer)=>{
            //do something as needed
        })
    });
}

export const getIoInstance = ()=>{
    return io;
}
```

### How to configure CORS?
CORS is there to protect one server's request to be accessed by another server(frotnend). Without CORS you will see that the frontend server request to access resource is denied with Cross origin request. Solution is to set the backend server to whitelist the the frotnend server. or ONLY development, set the backend to allow all other servers, which is not recommemmended.
```
    const cors = require('cors')
    app.use(cors())//using default settings, CORS-> Allow all server
    //best approach is to configure which frotnend or other servers to allow with cors options
```

#### How to do a Proper Error Handling with custom type of cotnroller error messages in express?

if you jsut use express async error, and continue to throw all error, You dont have to catch it, and server will not be stopped in case of error, but it wil always throw 500.

if you want to handle it, you have to use a global error handler to catch the error, and to properly send a response to user.just having express async errors will not properly handle the error with predicable approrpriate error code and messages, express async error will always show 500 if not caught with a global handler like below. 

The following code is an example you defined a custom error class, and you are throwing that error explicitly when something wrong happens from the code.

```
class CustomErrorResponse extends Error{
    statusCode: number;
    constructor(message:string, statusCode:number){
        super(message);
        this.statusCode = statusCode
        Object.setPrototypeOf(this, CustomErrorResponse.prototype);
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

//in some controller
some error happens, throw new BadReqeustError("bad data)

//if you dont have global error handler it will be still sent as 500 response, just having this class is not sufficient

***Use this middleware, this is a global middlewae***

app.use((err, req, res, next) => {
    if (err instanceof NotAuthenticatedError) {
        res.status(err.statusCode).json({ message: err.message });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

*** in app.ts after defining all routes**
app.use(globalErrorHandler)
```
specialty of this hadnler means, only this middleware will be contacted, or this will intercept
if there is errors. other middleware which does not have err in the definiton, will not catch errors in the request response cycle.
global error handler, must be placed after all routes, controllers are assigned to app instance, such that intercept any error that happens in the request response cycle

Object.setPrototypeOf(this, CustomErrorResponse.prototype); this make sure the object of this class
when we will use `instanceof ClassName`, js engine will detect correctly that object is of this type,
without this its a hit and miss sometime.

### Authenticate sockets with Middleware and ensuring each socket belongs to one user:
* i added socketio middleware in server, that will check if token object is there in socket handshake.
```
# in the server side
 io = new Server(httpExpressServer,{
        cors: {
          origin: "http://localhost:5173"
        }
    })
    // authentication related middlware
    io.use(async(socket:Socket, next:any)=>{

        try{
            const token = socket.handshake.auth.token;
            ....
            if(!user)
                next(new NotAuthenticatedError('Socket authentication error'))
            next()
            }catch(err){
                console.log("error authenticating socket")
                next(new NotAuthenticatedError('Socket authentication error'))
            }
        
    })

    # in the client side
    const headers = {
    auth: {
        token: authToken
    }
  }
  export const socket = authToken ? io(URI, headers) : io(URI);
```
**Now the problem is**, socket only get disconnected when page refreses, with react page never refreshes.
and this way each socket is termed authenticated by a token, if someone logs out, token is gone from frotnend.
but the socket is still connected.
next person logs in, and as the socket is already connected, socket will not be connected again.
therefore the second person is connected+authenticated to server with the token of first user.
Therefore on logout i invoked `socket.disconnect()` such that second person connects and authentiactes with his own token. Now socket is disconnected and wont connect i refresh page which starts everything new, but with react page never refreshes. so i called `socket.connect()` in the chat page. now it connects with the authenticated token.


### How to do a heartbeat from backend to frotnend in socketio?
its to check if the user is still connected. it is useful if you want to build a chat app,
and show on the UI that those users are online. socketio will ping after each given interval, then if frotned client
does not return a ping response(called pong), that means that client is offline. with a chatapp, you may want to update that users status to offline.
export const initializeSocketIoServer = (httpExpressServer:any)=>{
    io = new Server(httpExpressServer,{
        cors: {
          origin: "http://localhost:5173"
        },
        //this means socketio will do a ping to do a hearbeat request to the client
        pingInterval: 5000,
        pingTimeout:4000
    })

### How did I implement online, offline feature?
on login I kept all user list to cache.
then on socket connect and disconnect
i updated the cache.
then every 20s i did a node-cron task that sends just the user list and their oneline status to the froitnend.
Now frotnend if updates the recent chat item, then the entire list all rows in recent chat will be refreshed, too many rerendered. so in the frotnend I used React.memo, and provided a function isEqual. so only if the isOnline status gets updated that will referesh some row, it will not rerender the other rows.

### How did i do unread, read feature?
Instead of tracking if message was unread, i tracked if user has read the chatroom.
I created a room UserRoomLastSeen, it has room, user, lastseen time.
Each room also have lastRoomMessage time field. so for a given user if users lastRoomSeen time
is behind than room's last message time, it means user is behind, means messages are unread.
when I am sending all the recent messages via API, i also send that for this room, is the user behind
meaning unread or Not.
When a user sends a message, it updates both the room last message time, user room last seen time.
when user recieves a message, if it is in current chat opened window, frotnend sends a socket
that please update my last seen time for this room, the backend updates this. This way for a opened chat window, if user sends or receives, in both cases, user's last room seen time is updated.
Now, when a user clicks a recent message which is marked as unread, i call the api to fetch all messages in this chat, now at the same time in backend i mark user last seen for this room as Now, which means user has just read all the unread messages.
Now, when a new message comes, we check if it is in the current chat window, if not, we dont send an acknolwedgement that message was read. in fact that time we update in the UI's isUnread for that message to true, means user has not yet seen(as that message is not for user's current chat window)


# Frontnend related

### How to design a routeguard in React, so that particular page cannot be accesssed without authentication ?

Naive way: r prothome routegard banaisilam hocche parent route, child route emne kore. all component jekhaner authenticated howa lagbe, segula same ekta parent er under a bar bar create korsilam. (parent(compA), parent(compB)). ete kore dekhlam child ta invoke hoye jeto, then parent er logic e redirect korto login e . 
like
```
<Route element=SomeCompoThatChecksAuth&RedirectsIfNot>
    <Route element=actualcomponent>
</Route>
```
but jeta dorkar seta hocche child ta invoke jate na hoy, jate 401 error na khay jodi localhost e user nai thake.

**Better way**: ejonno HOC banai, all comp jegular auth lagbe, segula HOC ekta component banai, seta check korto auth info ase kina store or local storage e, then na thakle null(empty kind of) reutnr korto, r auth thakle actual component return korto. ete kore jei component e auth lagbe seta invoke e hoto na, HOC jodi dekhto auth nai, taile oi component return korto na, invoke o hoto na, ar 401 khayna. so this was a much better option.
```
proper way te routeguard, for every protected route, loggedInUser is checked first.
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
```

#### How to use Env variables from .env files in Vite?
Vite has by default support for .env files.
How to use: https://stackoverflow.com/a/77102955
#### Socketio event listeners on frotnend is fired too many times redundantly.
Solution, in the useeffect you must have used `socketio.on("connect", onConnectListener)`
for all such listeners, remove those listeners with socket.off
```
useEffect(()=>{
        fetchContacts();
        fetchPastMessages();
        
        if(socket){
            socket.connect()
            socket.on(SOCKET_CONNECTED, onConnect.bind(null));

            socket.on('foo', (value) => {
                console.log('on foo event value',value)
            });
            socket.on(SOCKET_DISCONNECTED,onDisconnect)
            socket.on(SOCKET_CONNECTION_ERROR, (err) => {
                console.log("Socket connection error", err.message); // prints the message associated with the error
            });
        }
        else{
            console.log('socket is maybe null')
            console.log('still printing it', socket)
        }
        
    
        //this return function works as a cleanup method
        return()=>{
            socket.off('foo');
            socket.off(MESSAGE_FROM_SERVER);
            socket.off(MESSAGE_TO_SERVER);
            socket.off(SOCKET_CONNECTED)
            socket.off(SOCKET_DISCONNECTED)
        }

    },[])
```

### How to use axios interceptor to track special error codes like 401 to redirect user to login page And also have a base Server URL?
to have a base url for all axios request, and intercept all api response errors, and customizing it
to redirect to login page, we need to have axios instance, we will use it throughout the app.

```
axiosInstance.ts file
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
```
Now instead of `axios` use `axiosInstance` everywhere in the app, and omit the server domain part of the url(like localhost:8005)

but now we need a custom router component to use the router.navigate('/login') inside the axios instead of react router dom's navigate. react router dom's navigate does not work out of component.

create a new `router.tsx` file
```
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
 ```
inside App component return this instead of Router definition,
`<RouterProvider router={router} />`
**Also get rid of other Router,Routes, Browser Router` definitions from the project**

### Calling method of child component from parent.
```
const ChildComponent = forwardRef((props, ref) => {
    const [data, setData] = useState(null);

    useImperativeHandle(ref, () => ({
        setData(newData) {
            setData(newData);
        }
    }));

    return (
        <div>
            {data ? <p>Data: {data}</p> : <p>No data yet</p>}
        </div>
    );
});

export default ChildComponent;

const ParentComponent = () => {
    const childRef = useRef();

    const handleEvent = () => {
        const newData = 'Some data from event';
        if (childRef.current) {
            childRef.current.setData(newData);
        }
    };

    return (
        <div>
            <button onClick={handleEvent}>Send Data to Child</button>
            <ChildComponent ref={childRef} />
        </div>
    );
};

export default ParentComponent;
```

# Lessons

- **backend frontend integration**: learnt about backend integration properly with frontend,especially which query to run, for which ui, which mongoose query to run, response. For example, I had Room(name,code, privateRoomMembers), Message(room, sender), User. Frotnend needed previous chat messages, for that i needed all rooms that logged in user are part of, those room's last messsage, and who is the other user that current user is chatting with. So I wrote mongoose aggregate query, created Typescript type, MessageWithRoom. I also had to aggreate lookup with the user table to send the info of the other person current user is chatting with.

- **React state update asyncrhonously**: i tried to set a react state, and soon in few lines tried to use it, isaw obsolete data. in fact react state update asyncrhonously, your code must be done in a way that when new state data is asyncrhonously set, then your code should update appropriately. for example, i tried to set current chat contact in state, and soon after that i tried to pass that current chat contact to another parent such that they can update the unreadmessage=false(mark as read), but i saw the state does not work syncrhonously. therefore when i tried to pass the current chat cotnact as soon as i set the state, i was getting obsolte value. 