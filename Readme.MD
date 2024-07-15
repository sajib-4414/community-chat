## Community Chat

Overview: This is an ongoing project of mine to build a community chat application to facilitate one to one chat and group chat in a given community, especially for newcomers. People often finds it hard to communicate or find new people in a new area. This application is trying to mitigate that. 

The way it works is, Users can signup for the community chat with a postal code. Once they create an account they can start to chat with other people or groups that are available. In order to find new people and group they have to search. Search will show up people who have signed up or the group chats which are open to people of the postcode, the new user put when registering. Users can also find people and community from other postcode, they just have to modify the postcode when searching.

Users can then send request to chat to other users or also send request to join a group chat.

Technology stack: Typescript, React, Vite, Redux, Redux Toolkit, Express, MongoDB, SocketIO

Installation:
- Clone the project.
- Have nodejs, and npm installed.
- Go to the backend and frontend folders in two terminals, and issue command `npm install`.
- in both terminals issue command `npm start`.

Features to be added:
* Ability to find people using gps/current location.
* Content filtering, therefore users can report any message/user.
* Searching people by name.
