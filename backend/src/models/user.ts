import mongoose from "mongoose";
import  bcrypt  from "bcryptjs";
import jwt from 'jsonwebtoken'
interface IUser extends mongoose.Document{
    username:string,
    _id?:string,
    name:string,
    email:string,
    password:string,
    getSignedToken:()=>string,
    matchPassword: (password:string) => boolean;
}
const userSchema = new mongoose.Schema<IUser>({
    username:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        match:[
             /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ],
        required: [true, 'Please add a valid email'],
        unique:true
    },
    password:{
        type:String,
        required: [true, 'Please enter a password'],
        minlength:4,
        select:false
    }
})

//before saving user, modify the password to have encrypted password stored
//in schema methods, with the "this" we have refrence to the current object
userSchema.pre('save', async function name(next) {
    // only encrypt if password was changed or added(register)
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.getSignedToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET!,{
        expiresIn: process.env.JWT_EXPIRE!
    })
}

userSchema.methods.matchPassword = async function (enteredPassword:string) {
    return await bcrypt.compare(enteredPassword, this.password)
    
}

interface IUserMethods extends mongoose.Model<IUser>{
    //we can add static methods here for the model
}
const User = mongoose.model<IUser, IUserMethods>('User', userSchema)


export interface IUserSocket extends mongoose.Document{
    user:IUser|string;
    socketIds:string[];
}

const userSocketSchema = new mongoose.Schema<IUserSocket>({
    socketIds:{
        type:[String],
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})
const UserSocket = mongoose.model<IUserSocket>('UserSocket', userSocketSchema)

export {User, IUser, UserSocket}