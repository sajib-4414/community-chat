const mongoose = require("mongoose");
import request from 'supertest'
import dotenv from 'dotenv'
import { connectToMongoDB } from "../config/db";
import { app } from '../app';
import { redisClient } from '../config/redisClient';



//for env file confiugration
dotenv.config();

/* Connecting to the database before each test. */
beforeEach(async ()=>{
    await connectToMongoDB()
})

/* Closing database connection after each test. */
afterEach(async ()=>{
    await redisClient.disconnect();
    await mongoose.connection.close()
    console.log('mongodb connection closed')
})

describe("GET /api/users/all", ()=>{
    it("should return all users", async ()=>{
        const res = await request(app).get("/api/users/all")
        expect (res.statusCode).toBe(200)
        expect(res.body.length).toBeGreaterThan(0)
    })
})