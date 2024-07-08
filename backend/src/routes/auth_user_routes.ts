import express from "express";
import { Login, Register } from "../controllers/auth_controller";
import { getAllUsers } from "../controllers/user_controller";
import { loginValidators, registrationValidators } from "../helpers/auth_validators";
import { validateValidators } from "../middlewares/validator";
const router = express.Router()

router.route('/register')
.post(registrationValidators, validateValidators, Register)

router.route('/login')
.post(loginValidators, validateValidators, Login)

router.route('/users/all')
.get(getAllUsers)

export {router as authRouter}