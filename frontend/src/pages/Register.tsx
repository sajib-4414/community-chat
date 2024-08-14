import { FC, FormEvent, useState } from "react";
import './login.css'
import { useDispatch } from "react-redux";
import { storeUser } from "../store/UserSlice";
import { axiosInstance } from "../utility/axiosInstance";
import { LoggedInUser } from "../models/user.models";
import { router } from "../router";
import { socket } from "../socket";
import { ErrorParser } from "../utility/errorParser";
import { Link } from "react-router-dom";
import { ErrorMessage } from "../components/Misc/ErrorMessage";
export interface Coordinate{
    lat:number;
    long:number;
}
export const Register:FC = ()=>{


    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [errorLine,setErrorLine] = useState("")
    const [zipcodemsg, setZipCodeMsg] = useState<string|null>(null)
    const [coordinate,setCoordinate] = useState<Coordinate|null>(null)
    const dispatch = useDispatch()

    const submitForm = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(username.length === 0){
            setErrorLine("Username is required")
            return;
        }
        if(email.length === 0){
            setErrorLine("Email is required")
            return;
        }
        if(name.length === 0){
            setErrorLine("name is required")
            return;
        }
        if(email.length === 0){
            setErrorLine("email is required")
            return;
        }
        if(password.length === 0){
            setErrorLine("password is required")
            return;
        }
        if(zipcode.length === 0|| zipcode.length<6 || zipcode.length>7){
            setErrorLine("zipcode cannot be left empty or invalid")
            return;
        }
        //make API call
        axiosInstance.post('/auth/register',{
            username,
            name,
            email,
            password,
            coordinate,
            zipcode
        }).then(async(response)=>{
            console.log("response of register call is",response)
            const registedUser:LoggedInUser = response.data


            console.log("adding my socket to user after loggin in")
            const socketId = socket.id
            const headers = {
                headers: { Authorization: `Bearer ${registedUser?.token}` }
            }
            await axiosInstance.post('/messages/add-socket', {
                socketId
            },headers)
            

            dispatch(storeUser(registedUser))


            const userJSON = JSON.stringify(registedUser);
            localStorage.setItem('user', userJSON);
            dispatch(storeUser(registedUser))
            router.navigate('/');
        }, (error)=>{
            console.log("login failed")
            console.log(error)
            const stringError = ErrorParser(error);
            setErrorLine(stringError)
        })
        
    }
    const validateZipcode = async (event)=>{
        event.preventDefault();

        if (zipcode.length<6 || zipcode.length>7){
            setZipCodeMsg('Invalid zip code')
            setCoordinate(null)
            return;
        }
        const response = await axiosInstance.post('/users/validatepostcode',{
            zip:zipcode
        })
        if(response.status==200){
            setZipCodeMsg('Location validated')
            const data = response.data
            const {lat,lng} = data.geolocation
            const coordinate = {
                lat:lat,
                long:lng
            }
            setCoordinate(coordinate)
        }
            
        else{
            setCoordinate(null)
            setZipCodeMsg('Invalid zip code')
        }
            
    }
    return(

        <div className="my-3 row justify-content-center align-items-center">

            <form className="col-md-4 border rounded" onSubmit={submitForm}>
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" 
                className="form-control"
                 id="name" 
                 aria-describedby="emailHelp"
                 value={name}
                 onChange={e=>setName(e.target.value)}
                 placeholder="Your Name"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input type="email" 
                className="form-control"
                 id="email" 
                 aria-describedby="emailHelp"
                 value={email}
                 onChange={e=>setEmail(e.target.value)}
                 placeholder="Email"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="name">Username</label>
                <input type="text" 
                className="form-control"
                 id="name" 
                 aria-describedby="emailHelp"
                 value={username}
                 onChange={e=>setUserName(e.target.value)}
                 placeholder="Username"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input 
                className="form-control" 
                id="exampleInputPassword1" 
                value={password}
                type="password"
                onChange={e=>setPassword(e.target.value)}
                placeholder="Password"/>
            </div>

            <div className="form-group">
                <label htmlFor="zipcode">Location zip code(Canada)</label>
                <div className="row mx-1">
                <input 
                    id="zipcode" 
                    className="form-control col-xl-9"
                    value={zipcode}
                    onChange={e=>setZipcode(e.target.value)}
                    placeholder="Ex: S4S 3E1"/>
                <button className="btn btn-primary ml-1 col-xl-2" onClick={validateZipcode}>Validate</button>
                {coordinate!==null?
                <small className='bg-success text-white'>{zipcodemsg}</small>
                :
                <small className='bg-warning text-white'>{zipcodemsg}</small>
                }
                
                </div>
                
            </div>
            
            <button type="submit" className="btn btn-primary mb-2">Submit</button>

            <p>Already have an account? <Link to="/login">Login here.</Link> </p>
            <ErrorMessage
            errorLine={errorLine}/>
            
        </form>
        </div>
    )
}