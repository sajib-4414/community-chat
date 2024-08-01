import fs from 'fs';
import mongoose from 'mongoose';

import * as dotenv from "dotenv";
import { User } from '../models/user';
import { Room } from '../models/room';
import { Message } from '../models/message';
import { DB_NAME } from '../definitions/db_constants';
dotenv.config({ path: __dirname+'/../../.env' });

const connectionString = `${process.env.CONNECTION_STRING}${DB_NAME}`
const connectToMongo = async ()=>{
    await mongoose.connect(connectionString,{
        autoIndex:true
    })
}
connectToMongo()
/*
How to run this file?
ts-node seeder argument.
Example, ts-node seeder -i, this will import
-i for import
-d for delete
this -i or -d is captured as argv[2]
*/
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const rooms = JSON.parse(fs.readFileSync(`${__dirname}/rooms.json`,'utf-8'))
const messages = JSON.parse(fs.readFileSync(`${__dirname}/messages.json`,'utf-8'))

const importData = async(userImport:boolean,roomImport:boolean,messageImport:boolean)=>{
    try{
        if(userImport)
        {
            console.log("Creating Users....")
            await User.create(users);
            console.log("Done creating users")
        }
        if(roomImport)
        {
            console.log("Creating Rooms....")
            await Room.create(rooms);
            console.log("Done creating Rooms")
        }
        if(messageImport)
        {
            console.log("Creating Messages....")
            await Message.create(messages);
            console.log("Done creating Messages")
        }
            
        process.exit()
    }catch(err){
        console.error("error in importing,error=",err)
    }
}

const deleteData = async(deleteUser:boolean,deleteRoom:boolean,deleteMessages:boolean)=>{
    try{

        if(deleteUser)
        {
            console.log("Deleting All Users....")
            await User.deleteMany()
            console.log("Done Deleting users")
        }
        if(deleteRoom)
        {
            console.log("Deleting All Rooms....")
            await Room.deleteMany()
            console.log("Done Deleting Rooms")
        }
        if(deleteMessages)
        {
            console.log("Deleting Messages....")
            await Message.deleteMany()
            console.log("Done Deleting Messages")
        }
        console.log("All Deletion completed successfully.");
        process.exit();
    }catch(err){
        console.error("Deletion failed:", err);
    }
}


if(process.argv[2]=== '-i'){
    if(process.argv[3]=== '-u' && process.argv[4]=== '-r' && process.argv[5]=== '-m')
        importData(true,true,true)
    else if (process.argv[3]=== '-u' && process.argv[4]=== '-r')
        importData(true,true,false)
}


else if(process.argv[2] === '-d'){
    if(process.argv[3]=== '-u' && process.argv[4]=== '-r' && process.argv[5]=== '-m')
        deleteData(true,true,true)
    else if (process.argv[3]=== '-u' && process.argv[4]=== '-r')
        deleteData(true,true,false)
}


/* What commands to issue to use this?*/
//issue command as
// ts-node seeder.ts -i -u -r -m to seed Users, Rooms, Messages
// ts-node seeder.ts -i -u -r to seed Users, Rooms

//issue command as
// ts-node seeder.ts -d -u -r -m to delete All Users, Rooms, Messages
// ts-node seeder.ts -d -u -r to delete All Users, Rooms