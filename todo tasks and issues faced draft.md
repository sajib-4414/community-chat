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

