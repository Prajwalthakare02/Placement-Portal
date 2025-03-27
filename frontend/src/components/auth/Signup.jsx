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

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "student",
        file: "",
        confirmPassword: "",
        isAgreed: false,
        username: ""
    });
    const {loading,user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            
            // Validate form
            if (input.password !== input.confirmPassword) {
                toast.error("Passwords do not match!");
                dispatch(setLoading(false));
                return;
            }
            
            // Generate username from email if not provided
            const generatedUsername = input.username || input.email.split('@')[0];
            
            const userData = {
                username: generatedUsername,
                email: input.email,
                password: input.password,
                userType: input.role || "student",
                fullname: input.fullname || "",
                phoneNumber: input.phoneNumber || "",
            };
            
            console.log("Sending registration data:", userData);
            
            // Test if server is reachable
            try {
                await axios.options(`${USER_API_END_POINT}/register`);
                console.log("Server is reachable");
            } catch (error) {
                console.log("Server connectivity test failed:", error.message);
                if (error.message.includes("Network Error")) {
                    toast.error("Cannot connect to the server. Please ensure the backend server is running.");
                    dispatch(setLoading(false));
                    return;
                }
            }
            
            const res = await axios.post(`${USER_API_END_POINT}/register`, userData, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                // Redirect to profile setup with resume upload instead of profile page
                navigate('/profile-setup');
                toast.success(res.data.message);
            } else {
                // If the response has success: false but no error message
                toast.error(res.data.error || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            
            // Handle specific error cases
            if (error.response) {
                // Server responded with an error status
                const errorMessage = error.response.data?.error || "Registration failed";
                toast.error(errorMessage);
            } else if (error.request) {
                // Request was made but no response received
                toast.error("No response from server. Please try again later.");
            } else {
                // Error in setting up the request
                toast.error("Registration failed: " + error.message);
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
    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Sign Up</h1>
                    <div className='my-2'>
                        <Label>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div className='my-2'>
                        <Label>Email Address</Label>
                        <Input
                            type="text"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="Enter your email address"
                        />
                    </div>
                    <div className='my-2'>
                        <Label>Phone Number</Label>
                        <Input
                            type="text"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="Enter your phone number"
                        />
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
                    <div className='my-2'>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={input.confirmPassword}
                            name="confirmPassword"
                            onChange={changeEventHandler}
                            placeholder="********"
                        />
                    </div>

                    <div className='pt-5 flex justify-between'>
                        <Link to="/login" className='text-gray-600 text-sm'>
                            Already have an account? Login
                        </Link>
                        <Button disabled={loading} type='submit' className='bg-blue-600'>
                            {loading ? (
                                <div className='flex items-center gap-2'>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    <p className='mb-0'>Signing up...</p>
                                </div>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup