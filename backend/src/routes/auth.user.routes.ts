import express from "express";
import { getMe, Login, Register, resetPassword, updatePassword, updateProfile, updateProfileImage } from "../controllers/auth_controller";
import { getAllUsers, searchUsers, validateZipcode } from "../controllers/user_controller";
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

export {authRouter, userRouter}