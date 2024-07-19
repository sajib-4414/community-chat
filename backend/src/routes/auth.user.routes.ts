import express from "express";
import { Login, Register } from "../controllers/auth_controller";
import { getAllUsers, searchUsers } from "../controllers/user_controller";
import { loginValidators, registrationValidators, userSearchValidators } from "../helpers/auth_validators";
import { validateValidators } from "../middlewares/validator";
const authRouter = express.Router()

authRouter.route('/register')
.post(registrationValidators, validateValidators, Register)

authRouter.route('/login')
.post(loginValidators, validateValidators, Login)

const userRouter = express.Router()

userRouter.route('/all')
.get(getAllUsers)

userRouter.route('/find')
.get(userSearchValidators, validateValidators,searchUsers)

export {authRouter, userRouter}