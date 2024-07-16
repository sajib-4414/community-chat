
import { ValidationChain, body, query } from "express-validator";

export const registrationValidators:ValidationChain[] = [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
    .trim()
    .notEmpty()
    .isLength({min:4})
    .withMessage('You must supply a password'),
    body('name')
    .trim()
    .notEmpty()
    .withMessage('You must supply a name'),
    body('username')
    .trim()
    .notEmpty()
    .withMessage('You must supply a username'),
]

export const loginValidators:ValidationChain[] = [
    body('username').notEmpty().withMessage('username must be valid'),
    body('password')
    .trim()
    .notEmpty()
    .isLength({min:4})
    .withMessage('Password must be of minimum length 4'),
]

export const userSearchValidators:ValidationChain[] = [
    query('keyword')
    .notEmpty()
    .trim()
    .withMessage("search query cannot be empty")
]
