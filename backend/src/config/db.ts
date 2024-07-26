import dotenv from 'dotenv'
import mongoose, { mongo } from 'mongoose';
import { DB_NAME } from '../definitions/db_constants';

dotenv.config();

const connectionString = `${process.env.CONNECTION_STRING}${DB_NAME}`

const connectToMongoDB = async()=>{
    let connectionInstance;
    try{
        if(connectionString !==null && connectionString!==undefined){
            connectionInstance = await mongoose.connect(connectionString,{
                autoIndex:true
            })
            console.info('Connected to mongodb atlas')
        }
        else{
            console.error('Cannot connect to mongodb connection string empty')
            process.exit(1);
        }
        
    }catch(error){
        console.error('Could not connect to Database, exception happened')
        console.error(error)
        process.exit(1);
    }
}
export {connectToMongoDB}