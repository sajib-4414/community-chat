import express from "express";
import { Login, Register } from "../controllers/auth_controller";
import { getAllUsers } from "../controllers/user_controller";
const router = express.Router()

router.route('/register')
.post(Register)

router.route('/login')
.post(Login)

router.route('/users/all')
.get(getAllUsers)

export {router as authRouter}