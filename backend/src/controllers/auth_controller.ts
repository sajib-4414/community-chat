import { Request, Response } from "express";
import { login, register } from "../services/auth_service";
import { BadRequestError, InternalServerError } from "../definitions/error_definitions";
import sharp from "sharp";
import path from "path";
import { IUser, User } from "../models/user";
import axios from "axios";

export const Register = async(req:Request, res:Response)=>{

    

    const {user,token} = await register(req.body)
    const jwtCookieExpire = process.env.JWT_COOKIE_EXPIRE;
    if(!jwtCookieExpire){
        throw new InternalServerError('JWT_COOKIE_EXPIRE is not defined');
    }
    console.log('jwt cookie expire is',jwtCookieExpire)
    const options:{maxAge:Date,httpOnly:boolean,secure?:boolean} = {
        maxAge: new Date(Date.now() + Number(jwtCookieExpire)*24*60*60*1000),
        httpOnly:Boolean(process.env.IS_ENVIRONMENT_HTTP_ONLY)
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.status(201).cookie('token',token, 
        // options //have to figure out the options parameter
    )
    .json({
        user:user,
        token:token
    })
}


export const Login = async(req:Request, res:Response)=>{
    const user = await login(req.body)
    res.json(user)
}

//get me, get current user
export const getMe = async(req:Request, res:Response)=>{
    res.json(req.user)
}

export const updateProfile = async(req:Request, res:Response)=>{
    const {name} = req.body
    const {zip} = req.body
    let latitude,longitude;
    try{
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${process.env.OPEN_CAGE_API_KEY}&language=en&pretty=1`)
        const actualData = response.data
        const {lat, lng} = actualData.results[0].geometry
        latitude = lat
        longitude = lng
        
    }catch(err){
        console.log('Geolocation fetch failed, error=',err)
        throw new InternalServerError('Validation check failed, try again with correct data')
    } 

    const updatedUser:IUser|null = await User.findByIdAndUpdate(req.user._id,{
        name, zipcode:zip,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        }
    },{returnOriginal: false})

    res.json(updatedUser)
}

export const updateProfileImage = async(req:Request, res:Response)=>{
    if (!req.file) throw new BadRequestError("No file uploaded")
    const inputPath = req.file.buffer;
    const originalFilename = req.file.originalname;
    const outputFilename = `${Date.now()}-${path.basename(originalFilename, path.extname(originalFilename))}.jpeg`;
    const outputPath = `uploads/${outputFilename}`;
    try {
        // Compress the image using sharp
        await sharp(inputPath)
          .resize({ width: 100 }) // Resize image to width of 100px, maintaining aspect ratio
          .jpeg({ quality: 80 }) // Compress and convert to JPEG with 80% quality
          .toFile(outputPath);
        //the path in server, such as /uploads/filename.jpg
        const filePath = `/uploads/${outputFilename}`
        const updatedUser:IUser|null = await User.findByIdAndUpdate(req.user._id,{
            profileImage:filePath
        },{returnOriginal: false})
        // const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${outputFilename}`;
        // res.json({ url: fileUrl });
        res.send(updatedUser)
      } catch (error) {
        console.error('error uploading image',error)
        throw new BadRequestError('File upload error')
      }
    // res.json(req.user)
}

export const updatePassword = async(req:Request, res:Response)=>{
    res.json(req.user)
}

export const resetPassword = async(req:Request, res:Response)=>{
    res.json(req.user)
}