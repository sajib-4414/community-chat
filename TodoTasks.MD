# Project Todos

### FrontEnd
- Learn Error Boundary and Implement.
- split the ChatHome into recent container, contacts container, and Message container. with callback.
- Fix the UI for login, registration pages.
- Fix chat bubble padding when zooming in or out.
- See a better implementation of socket, like in useeffect or where its best.
- React Add memo for listview items

### Backend

- use a Websocket file for better implementation
- Add online, offline functionality.
- Optimize Searching contact it with caching, indexing. Maybe add apache elastic search. Advanced: search in messages as well
- Search messages in the current chat window
- Add Logging
- Current window chat messages should be paginated, recent chat should be too.
- Adding profile images
- Being able to upload images
- User Blocking: Allow users to block/unblock other users.
- Message read/seen functionality.
- Add message delete functionality.
- Add message sent/Not sent functionality[auto append sender's message, then update with socket response]
- Add functionality to accept one to one chat request and then. Maybe add a friend request or something, use a graph database also.
- Add testing.
- Add Postal code, and postal code based radius based searching.
- Add group chat
- Lock/Unlock users.
- Add a moderator role that can ban users.
- Message Reactions
- Add end to end encryption
- Message Notifications: Implement push notifications for new messages when users are not actively using the app.
- Add namespace such that typescript recognizes req.user (Done)
- Socketio middleware for authentication(Done)
- Search API for autocomplete: (Done)
- Add seeder, and use superseeder/some library for mocking data.
### Devops
- Add github workflow
- Add Docker with docker entry point sh file, docker compose, multi stage build,docker run command, mongodb local instance.

### Misc:
- Add documentation with some tools