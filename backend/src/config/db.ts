import dotenv from 'dotenv'
import mongoose, { mongo } from 'mongoose';

dotenv.config();

const connectionString = process.env.CONNECTION_STRING

const connectToMongoDB = async()=>{
    try{
        if(connectionString !==null && connectionString!==undefined){
            await mongoose.connect(connectionString,{
                autoIndex:true
            })
            console.info('Connected to mongodb atlas')
        }
        else{
            console.error('Cannot connect to mongodb connection string empty')
        }
        
    }catch(error){
        console.error(error)
    }
}
export {connectToMongoDB}