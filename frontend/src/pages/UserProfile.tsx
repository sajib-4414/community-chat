import { FormEvent, useEffect, useRef, useState } from "react"
import { LoggedInUser, User } from "../models/user.models"
import { useAppSelector } from "../store/store"
import { getAuthHeader } from "../utility/authenticationHelper"
import { axiosInstance } from "../utility/axiosInstance"
import { useDispatch } from "react-redux"
import { storeUser } from "../store/UserSlice"
import { ErrorParser } from "../utility/errorParser"
import { Coordinate } from "./Register"
const env = await import.meta.env;

const SERVER_URL = env.VITE_APP_ROOT_URL || 'http://localhost:3001';

export const UserProfile = ()=>{
    const loggedinUser:LoggedInUser|null = useAppSelector(
        (state)=> state.userSlice.loggedInUser //we can also listen to entire slice instead of loggedInUser of the userSlice
    )
    const [username, setUserName] = useState("");
    // const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [errorLine, setErrorLine] = useState<string|null>(null);
    const [profileImageSuccessMessage, setProfileImageSuccessMessage] = useState<string>("")
    const dispatch = useDispatch()
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [zipcode, setZipcode] = useState("");
    const [coordinate,setCoordinate] = useState<Coordinate|null>(null)
    const [zipcodemsg, setZipCodeMsg] = useState<string|null>(null)
    
    const fetchUserProfile = async ()=>{
        const response = await axiosInstance.get('/auth/me',getAuthHeader(loggedinUser))
        const user:User = response.data
        setUserName(user.username)
        setName(user.name)
        setEmail(user.email)
        setZipcode(user.zipcode)
    }
    const updateUserInSystem = (updatedUser:User)=>{
        const storedUserData = localStorage.getItem("user");
        if(storedUserData){
            const storedUser: LoggedInUser = JSON.parse(
                storedUserData,
            ) as LoggedInUser;
            storedUser.user = updatedUser

            const userJSON = JSON.stringify(storedUser);
            localStorage.setItem('user', userJSON);

            dispatch(storeUser(storedUser))
        }
    }
    const updateProfilePic = async (event: React.MouseEvent<HTMLButtonElement>)=>{
        event.preventDefault()
        if (!file) {
            setErrorLine('No file chosen')
            return;
        }
        // Create a FormData object
        const formData = new FormData();
        formData.append('image', file);
        const headerData = getAuthHeader(loggedinUser)
        headerData.headers['Content-Type'] = 'multipart/form-data'
        try{
            const response = await axiosInstance.post('/auth/updateprofileimage',formData, headerData)
            const updatedUser = response.data

            setProfileImageSuccessMessage('Profile image updated successfully')
            updateUserInSystem(updatedUser)

            

            setFile(null)
            if(fileInputRef.current)
                fileInputRef.current.value = ''
            
        }catch(err){
            console.log('image upload failed',err)
            setErrorLine('Image upload failed, try again')
        }
    }


    

    const submitForm = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(name.length === 0){
            setErrorLine("name is required")
            return;
        }
        //make API call
        axiosInstance.post('/auth/updateprofile',{
            name,zip:zipcode
        },getAuthHeader(loggedinUser)).then(async(response)=>{
            const updatedUser = response.data

            setProfileImageSuccessMessage("")
            updateUserInSystem(updatedUser)
        }, (error)=>{
            console.log("profile updated failed")
            console.log(error)
            const stringError = ErrorParser(error);
            setErrorLine(stringError)
        })
        
    }
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Check if files is not null
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };
    const validateZipcode = async (event)=>{
        event.preventDefault();

        if (!zipcode || zipcode.length<6 || zipcode.length>7){
            setZipCodeMsg('Invalid zip code')
            setCoordinate(null)
            return;
        }
        try{
            const response = await axiosInstance.post('/users/validatepostcode',{
                zip:zipcode
            })
            console.log(response.status)
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
        }catch(err){
            console.log('cannto validate zipcode',err)
            setCoordinate(null)
            setZipCodeMsg('Zip code validation failed, try again')
        }
        
            
    }
    useEffect(()=>{
        fetchUserProfile()
    },[])
    return (
        <div className="my-3 ">
            <div className="row justify-content-center">
            <p className="display-4">Your Profile</p>
            </div>

            <div className="row justify-content-center align-items-center">
            

            <form className="col-md-4 border rounded" 
            onSubmit={submitForm}
            >
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" 
                className="form-control"
                 id="name" 
                 aria-describedby="emailHelp"
                 value=  {name}
                 onChange={e=>setName(e.target.value)}
                 placeholder="Your Name"
                  />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <p
                 id="email" 
                 aria-describedby="emailHelp"
                >{email}</p>
            </div>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <p
                 id="username" 
                 aria-describedby="emailHelp"
                >{username}</p>
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
            <div className="form-group">
                <label htmlFor="profileimage">Profile Image</label>
                <img 
                    src={`${SERVER_URL}${loggedinUser?.user.profileImage}`}
                    className="rounded-circle mr-1" 
                    alt="photo" 
                     
                    style={{display:"block"}}
                    />
                
                <input 
                className="form-control" 
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                 id="image"/>
                <button className="btn btn-primary" onClick={updateProfilePic}>Update profile picture</button>
                <p><small>{profileImageSuccessMessage}</small></p>
            </div>
            {/* <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input 
                className="form-control" 
                id="exampleInputPassword1" 
                value={password}
                type="password"
                onChange={e=>setPassword(e.target.value)}
                placeholder="Password"/>
            </div> */}
            
            <button type="submit" className="btn btn-primary mb-2">Submit</button>

            {/* <p>Already have an account? <Link to="/login">Login here.</Link> </p> */}
            <p className="form-error">{errorLine}</p>
        </form>
        </div>
        
        </div>
        
    )
}