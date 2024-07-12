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
until both user messaged  each other, then they are not part of a room actively(private chat mainly), and both are not connected via socket with room, so the message sent via socket to a room does not reach from one to another. 
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
I added new Model, UserSocket: user, socketId[]
I added API, addUserSocket [ deleting old sockets for the moment, have to later store all socketId until deleted, right now seeing socket disconnect is not fired at all], deleteUserSocket[] upon logout.
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

how to notify user via socket for a chat that user has not clicked yet and show them on the recent chat?
how to notify user via socket for a chat that user has not clicked,but talked before, but now talking to somebody else?
how to notify user via socket for a chat that nver started, and user is either talking to somebody or nobody.
how to show unread message.
last active chat(either user1 chatted, or user2 chatted) sould show on top of recent chats.

change the implementation of one to one chat.
right now if user1 messages user2, we create a channel named as pvt-username1-username2.
we sort the username so that either user1, user2 can access the same channel.
alternative:
for roomtype one to one, we keep an array of privateRoomMembers:[user1,user2], for group chat it will be empty.
for group chat privateRoomMembers will be empty and roommembers array will say how many members are in a group. 

For first message:
user1 sends message to user2, 
front end will send, messagetype one to one, targetUser: user[for group chat this will not be sent], message content, roomInfo[will be left empty for first private message]
backend sees there is no room info submitted and message type is one to one. Still it checks if there is a Room which is one to one, where both user1, user2 is there.
if it is, then they already have a private room, if not, then backend creates such room.
now socketio joins the sender socket, reciver socket to the room and send the message. adding sockets to the room
is idempotent, as its a set.We could do some optimization later that should we check if user is already there.
So we no longer need roomcode

For later messages:
Now, for subsequent messages, 
frotnend sends messagetype groupchat, targetUser:empty, message content, roomInfo
backend sees retrieves that room from db, so backend just creates a message,with that room, make both sockets join room, and send the mesage to the room.
What to send to the frotnend?
frontend needs, dbMessage, roomInfo[will be used for groupchat to show. also for one to one chat, if room shows one to one and message says one to one, then frotnend checks what is the other User, then shows that on the UI ]

backend always check if there is room exist for that user1,user2 as room can be empty, when user chooses a contact and send a message.

now how will getAllPrevious messages API work: that fetches messages with this person earlier?
backend will get call like: requesting message history, type-one-to-one[assuming user clicked contact name],roomInfo:null/info[null when just contact is chosen, roominfo there when room will be selected, or the previous chat will be selected], targetUser

Message models:receiver will be empty for group chats.

also dont do api call for first chat, do the same socket call, let backend handle that.

upon a message come from backend with room, message,
from backend we will always have room.
how to update current chat?
we check if the message is one to one. then we check who they are chatting with
how to update recent chats?

in the frontnend what happens when someone clicks a username?
-> setCurrentChatRoom:null
-> currentMessageType:one_to_one
-> setCurrentContact:contact

what happens when someone clicks a recent chat?
if the clicked ChatWithRoomInfo, and see the room, from there we set the curentchatroom, current message type, currentcontact will be the other person
from the room's privateRoomMember
-> setCurrentChatRoom:roomInfo
-> currentMessageType:one_to_one
-> setCurrentContact:contact

For group chat, if they click the group, room->rooom, message_type:take from group, currentcontact:null

So now user sends a message:
backend sends messagetype:currentMessageType[taken from the room info], message, targetUser(if its one to one message),roomInfo:if possible if they click recent chat of one to one

Todo: do token based authentication with socketio middleware

unfnished query to get past one to one chats with populated privateMmbers
[
  {
    $match: {
      privateRoomMembers: {
        $in: [
          ObjectId("668ffc9d277b9c7ecc25bc04"),
        ],
      },
    },
  },
  {
    $lookup: {
      from: "messages",
      localField: "_id",
      foreignField: "room",
      pipeline: [
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 1,
        },
      ],
      as: "message",
    },
  },
  {
    $unwind: {
      path: "$message",
    },
  },
  {
    $unwind: {
      path: "$privateRoomMembers",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "privateRoomMembers",
      foreignField: "_id",
      as: "user_detail"
    }
  },
  {
    $unwind: {
      path: "$user_detail",
      preserveNullAndEmptyArrays: false
    }
  },
  {
  // {
  //   $group: {
  //     _id: "_id",
  //     room: {
  //       $push:{
  //         privateRoomMembers:"$privateRoomMembers",
  //         message:"$message"
  //       }
  //     }
  //   }
  // }
  // {
  //   $project: {
  //     room: {
  //       name: "$name",
  //       _id: "$_id",
  //       code: "$code",
  //       roomType: "$roomType",
  //       createdAt: "$createdAt",
  //       updatedAt: "$updatedAt",
  //       createdBy: "$createdBy",
  //       privateRoomMembers: "$privateRoomMembers",
  //     },
  //     message: 1,
  //   },
  // }
]

private chat banate jaye onek kosto hoise,
first e erkm korsi j roomname banabo pvt-username1-username2,
ei private room banabo, then oitai maintain korbo.
r frotnend first time chat hole room ekhono create hoy nai, erkm name form kore room name send korto,
ota diyei banay feltam, jeta bujhlam eta businesss logic er ongso securirt er jonno eta froentned e thaka uchit na.

pore ekhon jeta korsi, first time chat er jonno frotnend sudhu name gula pathato, backend dekhto room ase kina, na thakle banay dito,
then frotnend k room dito, kivabe room banabe eta backend er upore.

r first e room, roommembers, messages, users erkm collection banai, then dekhlam rpivate chat er jonno roommemmber theke abar join kore
ana redundant, as just duita user. so ami one to one chat er jonno duita room member er name, room model ei rekhe disi, group chat er jonno roommembers model use hobe, as room e eonek onek lok thakte pare.

r prothome routegard banaisilam hocche parent route, child route emne kore. all component jekhaner authenticated howa lagbe,
segula same ekta parent er under a bar bar create korsilam. (parent(compA), parent(compB)). ete kore dekhlam child ta invoke hoye jeto, then parent er logic e redirect korto login e . but jeta dorkar seta hocche child ta invoke jate na hoy, jate 401 error na khay jodi localhost e user nai thake.
ejonno HOC banai, all comp jegular auth lagbe, segula HOC ekta component banai, seta check korto auth info ase kina store or local storage e, then na thakle null(empty kind of) reutnr korto, r auth thakle actual component return korto. ete kore jei component e auth lagbe seta invoke e hoto na, HOC jodi dekhto auth nai, taile oi component return korto na, invoke o hoto na, ar 401 khayna. so this was a much better option.