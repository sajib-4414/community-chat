import axios, { AxiosError } from "axios";
const env = await import.meta.env;
const BASE_URL = env.VITE_APP_API_URL || 'http://localhost:3001/api'; // Default URL

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Add other axios configurations here
    timeout: 10000, // Set timeout in milliseconds (optional)
    headers: {
      'Content-Type': 'application/json', // Default content type (optional)
    },
  });

  //also intercepting the error to watch for some kind of errors
  //such as for 401 redirect to login page
  //could do that in any axios instance, inside the component too.
  //but using here such that all axios in the app are intercepted

  axiosInstance.interceptors.response.use(
    (response)=>{
      console.log('Response:', response);
      return response;
    },
    (error:AxiosError)=>{
      console.log("axios interceptor caught an error",error)
      if(error!=null && error?.response?.status === 401){
        console.log('401 error happened.............')
      }
      //intercepting and sending the same error to the caller component
      return Promise.reject(error)
    }
  )