import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

console.log('Connecting to Redis...'); // Print log before connecting

client.connect()
    .then(() => {
        console.log('Connected to Redis successfully!');
    })
    .catch((err) => {
        console.error('Failed to connect to Redis:', err);
    });

export { client as redisClient };