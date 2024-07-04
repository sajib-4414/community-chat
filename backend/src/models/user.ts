import mongoose from "mongoose";
interface IUser extends mongoose.Document{
    username:string,
    _id?:string
}
const userSchema = new mongoose.Schema<IUser>({
    username:{
        type:String,
        required:true
    }
})

interface IUserMethods extends mongoose.Model<IUser>{
    //we can add static methods here for the model
}
const User = mongoose.model<IUser, IUserMethods>('User', userSchema)
export {User, IUser}