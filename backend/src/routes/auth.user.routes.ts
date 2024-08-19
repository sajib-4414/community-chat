import express from "express";
import { getMe, Login, Register, resetPassword, updatePassword, updateProfile, updateProfileImage } from "../controllers/auth_controller";
import { addFriend, discoverUser, getAllConnections, getAllGroups, getAllUsers, getConnectionRequests, RemoveFriend, RemoveFriendRequest, searchUsers, validateZipcode } from "../controllers/user_controller";
import { loginValidators, registrationValidators, userSearchValidators } from "../helpers/auth_validators";
import { validateValidators } from "../middlewares/validator";
import { authorizedRequest } from "../middlewares/auth.error";
import { upload } from "../config/multerConfig";
const authRouter = express.Router()

authRouter.route('/register')
.post(registrationValidators, validateValidators, Register)

authRouter.route('/login')
.post(loginValidators, validateValidators, Login)

authRouter.route('/me')
.get(authorizedRequest, getMe)

authRouter.route('/updateprofile')
.post(authorizedRequest, updateProfile)

authRouter.route('/updateprofileimage')
.post( authorizedRequest, upload.single('image'), updateProfileImage)

authRouter.route('/updatepassword')
.get(authorizedRequest, updatePassword)

authRouter.route('/resetpassword')
.get(authorizedRequest, resetPassword)

const userRouter = express.Router()

userRouter.route('/all')
.get(getAllUsers)

userRouter.route('/find')
.get(userSearchValidators, validateValidators,searchUsers)

userRouter.post('/validatepostcode', validateZipcode)

//only authenticated user can discover, because we need user's own location
userRouter.get('/discover',authorizedRequest, discoverUser)

//only authenticated can send friend request
userRouter.post('/addfriend',authorizedRequest, addFriend)


userRouter.post('/removefriendrequest',authorizedRequest, RemoveFriendRequest)

userRouter.post('/removefriend',authorizedRequest, RemoveFriend)

userRouter.post('/connection-requests',authorizedRequest, getConnectionRequests)

userRouter.post('/connections',authorizedRequest, getAllConnections)

userRouter.post('/groups',authorizedRequest, getAllGroups)

export {authRouter, userRouter}