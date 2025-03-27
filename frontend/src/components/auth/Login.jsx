import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Login = () => {
    const [input, setInput] = useState({
        username: "",
        password: "",
        role: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            
            // Create login data that matches the backend's expected format
            const loginData = {
                username: input.username,
                password: input.password
            };
            
            console.log("Sending login data:", loginData);
            
            // Test if server is reachable
            try {
                await axios.options(`${USER_API_END_POINT}/login`);
                console.log("Server is reachable");
            } catch (error) {
                console.log("Server connectivity test failed:", error.message);
                if (error.message.includes("Network Error")) {
                    toast.error("Cannot connect to the server. Please ensure the backend server is running.");
                    dispatch(setLoading(false));
                    return;
                }
            }
            
            const res = await axios.post(`${USER_API_END_POINT}/login`, loginData, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            
            console.log("Login response:", res.data);
            
            if (res.data.success || res.data.token) {
                // If user info is in a nested user object, extract it
                const userData = res.data.user || res.data;
                console.log("User data from login:", userData);
                
                // Set token in localStorage for future requests
                if (res.data.token) {
                    localStorage.setItem('authToken', res.data.token);
                }
                
                // Update Redux state
                dispatch(setUser(userData));
                navigate("/");
                toast.success("Login successful!");
            } else {
                // If the response has success: false but no error message
                toast.error(res.data.error || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            console.error("Response data:", error.response?.data);
            
            // Handle specific error cases
            if (error.response) {
                // Server responded with an error status
                const errorMessage = error.response.data?.error || "Login failed. Please check your credentials.";
                toast.error(errorMessage);
            } else if (error.request) {
                // Request was made but no response received
                toast.error("No response from server. Please try again later.");
            } else {
                // Error in setting up the request
                toast.error("Login failed: " + error.message);
            }
        } finally {
            dispatch(setLoading(false));
        }
    }
    
    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    
    useEffect(() => {
        console.log('Login component mounted');
    }, []);
    
    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Login</h1>
                    <div className='my-2'>
                        <Label>Email Address</Label>
                        <Input
                            type="text"
                            value={input.username}
                            name="username"
                            onChange={changeEventHandler}
                            placeholder="Enter your email address"
                        />
                        <p className="text-xs text-gray-500 mt-1">Please use the email you registered with</p>
                    </div>

                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="********"
                        />
                    </div>
                    <div className='flex items-center justify-between'>
                        {/* Role selection is not needed for login 
                        <RadioGroup className="flex items-center gap-4 my-5">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r1">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r2">Recruiter</Label>
                            </div>
                        </RadioGroup>
                        */}
                    </div>
                    <div className='pt-5 flex justify-between'>
                        <Link to="/signup" className='text-gray-600 text-sm'>
                            Don't have an account? Sign up
                        </Link>
                        <Button disabled={loading} type='submit' className='bg-blue-600'>
                            {loading ? (
                                <div className='flex items-center gap-2'>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    <p className='mb-0'>Logging in...</p>
                                </div>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login