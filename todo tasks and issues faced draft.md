Problem solving:


4. how to get scoket instance throughout the app?



5. Problem:
until both user messaged  each other, then they are not part of a room actively(private chat mainly), and both are not connected via socket with room, so the message sent via socket to a room does not reach from one to another. 
Mainly because i make a user socket join a room upon message, not before that.
if both user message each other then they join a room and start to see messages instantly.
solution is to make both users part of the room before he gets a message.

Related scenario:
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


*** 

  error boundary sikha lagbe


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

