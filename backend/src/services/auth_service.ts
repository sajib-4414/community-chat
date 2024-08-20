import axios from "axios";
import { BadRequestError, InternalServerError, NotAuthenticatedError, ResourceNotFoundError } from "../definitions/error_definitions";
import { IUser, User } from "../models/user"

interface IRegisterPayload{
    username:string;
    password:string;
    name:string;
    email:string;
    coordinate:{lat:number,long:number},
    zipcode:string
}

interface ILoginPayload{
    username:string;
    password:string;
}

export const login = async(payload:ILoginPayload)=>{
    //validate payload
    //todo add express validator library here

    //extract
    const { username, password } = payload; // Destructure username

    const user:IUser|null = await User.findOne({username}).select('+password')

    if(!user){
        throw new ResourceNotFoundError("User not found")
    } 
    
    //check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        throw new NotAuthenticatedError("Invalid credentials");
    }
    const token = generateToken(user)

    return {
        user,
        token
    };
}
//is invoked in both login and register
const generateToken = (user:IUser)=>{
    //create Token
    const token:string = user.getSignedToken()
    return token

}
export const register = async (body:IRegisterPayload)=>{
    let latitude,longitude;
    try{
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${body.zipcode}&key=${process.env.OPEN_CAGE_API_KEY}&language=en&pretty=1`)
        const actualData = response.data
        const {lat, lng} = actualData.results[0].geometry
        latitude = lat
        longitude = lng
    }catch(err){
        console.log('Geolocation failed in registration, error=',err)
        throw new BadRequestError('Could not verify location, please try again')
    }
    const {username, email, password, name, coordinate, zipcode} = body
    const payload = {
        username, email, password, name, zipcode,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        }
    }

    const user:IUser = await User.create({
        ...payload
    })
    //throw error if user creation fails
    if(!user){
        throw new BadRequestError("User creation failed, check data")
    }

    const token = generateToken(user)

    return {
        user,
        token
    };
}