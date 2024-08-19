
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

export const getConnectionRequestsValidator:ValidationChain[] = [
    query('type')
    .notEmpty()
    .trim()
    .withMessage("connection type query cannot be empty"),
    query('type')
    .isIn(['received', 'sent'])
    .withMessage('type must be one of: received, sent')
]

export const RespondConnectionRequestValidator:ValidationChain[] = [
    body('response')
    .notEmpty()
    .trim()
    .withMessage("connection type query cannot be empty"),
    body('response')
    .isIn(['deny', 'accept'])
    .withMessage('type must be one of: received, sent'),
    body('reciverId')
    .notEmpty()
    .trim()
    .withMessage("reciverId cannot be empty"),
]
