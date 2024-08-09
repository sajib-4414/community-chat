import express from "express";
import { getMe, Login, Register } from "../controllers/auth_controller";
import { getAllUsers, searchUsers } from "../controllers/user_controller";
import { loginValidators, registrationValidators, userSearchValidators } from "../helpers/auth_validators";
import { validateValidators } from "../middlewares/validator";
import { authorizedRequest } from "../middlewares/auth.error";
const authRouter = express.Router()

authRouter.route('/register')
.post(registrationValidators, validateValidators, Register)

authRouter.route('/login')
.post(loginValidators, validateValidators, Login)

authRouter.route('/me')
.get(authorizedRequest, getMe)

const userRouter = express.Router()

userRouter.route('/all')
.get(getAllUsers)

userRouter.route('/find')
.get(userSearchValidators, validateValidators,searchUsers)

export {authRouter, userRouter}