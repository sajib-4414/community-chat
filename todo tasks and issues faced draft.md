Problem solving:

5. Problem:




  
how to notify user via socket for a chat that user has not clicked yet and show them on the recent chat?
how to notify user via socket for a chat that user has not clicked,but talked before, but now talking to somebody else?
how to notify user via socket for a chat that nver started, and user is either talking to somebody or nobody.
how to show unread message.
last active chat(either user1 chatted, or user2 chatted) sould show on top of recent chats.


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


private chat banate jaye onek kosto hoise,



Library to add
* express validator
* mongoose aggregate pagination
* mongo migrate
* express async error
* bcrypt
* something for jwt
* route creating library

online, offline implementation:

User Profile field: online:boolean, default false.

as soon as someone logins, and their socket is sent to the addToUser API, we mark them as online, with this API call we mark them as online.

although right now the on disconnect is not firing, we have to troubleshoot why.
on disconnect we are calling the api to delte socket. with that api we will mark online=false. so right now, user will be offline
if they logout

or
onconnect frontend can send the userInfo, from that backend can add socket and mark online.
ondisconnect backend can send userInfo, from that backend can delete the socket and mark as offline.

Also have to broadcast the status of online persons to all persons, so that UI gets updated

Implement logic to detect disconnections (e.g., window closing, browser refresh).
Broadcast an updated 'online-users' event to all connected clients, reflecting the user's offline status.
we will also need react memo based recent chat row component, so that not each row updates.

later we will do the broadcast of online users periodically not to burden the system
Client-Side Optimization: Consider using a heartbeat mechanism to periodically send a 'ping' event from the client to the server. This can help identify inactive clients that haven't explicitly disconnected and update their online status accordingly. On the server side, implement a timeout to mark clients as offline if no 'ping' events are received within a reasonable time frame.
Session Management: If you're using sessions, associate the user's ID or other relevant information with the Socket.io connection. This streamlines identifying the user during socket interactions.

Later we can put the online status in Cache only, so we do not hit the database for this. we will retrieve and update it only the ram only. on starting a seervice will check which users have socket id, they will be marked online, but later based on socket on connect on disonnect only cache will be updated.
So I am trying to do cache, but for how long useronline status will be true in redis cache? should I do 20s? then if the user is not disconnected in say 1hr, then how to keep checkig if user is still connected? do i need some heartbit

**about authentication:**
we are currently doing it with middlware, that authenticates only when first connection is established.
should update it such that every message to server via socket is authenticated instead of first.

Finding all people:
radius based search hobe, to find all people

Friend request:
sender, receiver, time

friend:
user1,user2, sender

when user will search user-> we will send a related_info array, that will contain if the search, result's each person is already friend. something like, friends_association[userid]
UI will use this to show if a search result item person is a friend.

group request:
room, sender, request time

To track groups ->
roommember for each member: (room, member, joined at)

room: name, createdby, date 

Group chat planning:

who can create group chat:
everyone

how to create?
start chatting with one person, then click a button create a new group with this person
, then a modal with dropdown will come, showing all his friends, he can checkmark,
and then submit. api wil get a list of userids, and creator id. api will create a room with
a system message, omuk created this group. 

how to update?
next time when someone is in the group chat ui, they will see option to add more people, ui will show a list
of people that are not in the group as scrollview through an api, they can again mark them with checkboxes.

there is no admin facility, we will not allow removing a person by an admin.
its for later.

only way to get out of this group chat will be if someone leaves by themselves.

group chat will have an option to leave also.

when someone clicks leave, we just delete the roomMember.
messages we dont do anything.

...
acknowledgment?
already kora ase proti message e acknowledgement.


---
how about getting recent chats.
arekta query hobe
room member theke user jesob room e ase,
oi sob room niya message er sathe left join,
taile osob room er message pabo, decending sort kore last message nibo,
then just pathay dibo,
we need room, last message, thats it.
UI te name er jagay group chat name, ar last message jar e dekhano hobe.

unread query i guess, automatically roomwise
data diye dibe.

---
when frontend sends a message:
server will definitely know there is room.
it will just check if its a valid room.
then backend sends messagePayload to server{room, message}
fronend dekhbe j ei room to current chat e khola taile eta current chat e add korbe, naile recent chat e.
frontned already jane just ekta room paile ki kora lage.
so frontend is prepared for group chat.


