import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/appContext';
import {motion} from 'motion/react'
import axios from 'axios'
import { toast } from 'react-toastify';
const Login = () => {
 
  const [state,setState] = useState('Login');
  const {setShowLogin, backendUrl,setToken,setUser,setCredits,loadCreditsData} = useContext(AppContext)
  
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
        let response;

        if (state === 'Login') {
            response = await axios.post(backendUrl + '/api/user/login', { email, password });
        } else {
            response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
        }

        const { data } = response; // ✅ Correctly extract data from the response

        if (data.success) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            setShowLogin(false);
            
            if (state === 'Login') {
                loadCreditsData(); // ✅ Now it will work properly
            }
        } else {
            toast.error(data.message);
        }

        console.log("User Data from API:", data.user);

    } catch (error) {
        toast.error(error.message);
        console.error("Error during login/register:", error);
    }
};


  useEffect(()=>{
    
    document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';  
      }
  },[])


  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>


        <motion.form onSubmit={onSubmitHandler}
         initial={{opacity: 0.2, y: 50}}
         transition={{duration:0.3}}
         whileInView={{opacity:1, y:0}}
         viewport={{once:true}}
        className='relative bg-white p-10 rounded-xl text-slate-500'>
            <h1 className='text-center text-2xl text-neutral-700 font-medium '>{state}</h1>
            <p>Welcome back! Please sign in to continue</p>
   { state!=='Login' && <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
        <img src={assets.user_icon} alt=''/>
        <input onChange={e=> setName(e.target.value)} type='text' placeholder='Full Name' required/>
    </div>}

            <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.email_icon} alt=''/>
                <input onChange={e=> setEmail(e.target.value)} type='email' placeholder='Email id' required/>
            </div>

            <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.lock_icon} alt=''/>
                <input onChange={e=> setPassword(e.target.value)} type='password' placeholder='Password' required/>
            </div>
            <p className='text-sm text-blue-600 my-4 cursor-pointer'>Forgot Password?</p>
            <button className='bg-blue-600 w-full text-white py-2 rounded-full cursor-pointer'>{state === 'Login' ? 'login' : 'create account'}</button>
           { state==='Login' ?  <p className='mt-5 text-center'>Don't have an account? <span className='text-blue-600 cursor-pointer' onClick={()=>setState('Sign Up')}>Sign Up</span></p>:
          <p className='mt-5 text-center'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState('Login')}>Login</span></p>}
     
      <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt='' className='absolute top-5 right-5 cursor-pointer'/>
     
        </motion.form>
      
    </div>
  )
}


export default Login
