import express from "express";
import { Login, Register } from "../controllers/auth_controller";
const router = express.Router()

router.route('/register')
.post(Register)

router.route('/login')
.post(Login)

export {router as authRouter}