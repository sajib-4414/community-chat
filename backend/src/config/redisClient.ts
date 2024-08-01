import dotenv from 'dotenv'
import { createClient } from 'redis';


dotenv.config()
const client = createClient({
    url:process.env.REDIS_URL
})

client.on('error',(err)=>{
    console.error('Redis connection error:', err);
})

client.connect()

export {client as redisClient}