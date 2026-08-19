import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import registerImg from "../assets/register.webp"

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userInfo", JSON.stringify(data.user));

                const pendingItem = sessionStorage.getItem("pendingCartItem");
                if (pendingItem) {
                    try {
                        const itemData = JSON.parse(pendingItem);
                        const cartResponse = await fetch('/api/cart', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${data.token}`
                            },
                            body: JSON.stringify(itemData)
                        });

                        if (cartResponse.ok) {
                            sessionStorage.removeItem("pendingCartItem");
                            sessionStorage.setItem("openCartAfterLogin", "true");
                            window.dispatchEvent(new Event("cartUpdated"));
                        }
                    } catch (cartError) {
                        console.error("Error syncing pending cart item after registration:", cartError);
                    }
                }

                navigate("/");
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Server error during registration");
        }
    };

  return (
    // Changed to h-[calc(100vh-84px)] to account for the navbar and lock the viewport
    <div className='flex h-[calc(100vh-84px)] w-full overflow-hidden bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors'>
      
      {/* Left Side: Form Container */}
      <div className='w-full md:w-1/2 h-full flex flex-col justify-center items-center p-4 sm:p-8 overflow-y-auto'>
        <form onSubmit={handleSubmit} className='w-full max-w-md bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm'>
          
          <div className='flex justify-center mb-4 sm:mb-6'>
            <h2 className='text-xl sm:text-2xl font-serif tracking-[0.2em] uppercase text-stone-950 dark:text-stone-100'>Zaaish</h2>
          </div>
          
          <h2 className='text-lg sm:text-xl font-serif font-medium text-center mb-1 sm:mb-2'>Create Account</h2>
          <p className='text-center mb-5 sm:mb-6 text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs uppercase tracking-widest'>
            Join our luxury boutique experience
          </p>
          
          <div className='mb-4'>
            <label className='block text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-1.5 sm:mb-2 text-stone-600 dark:text-stone-300'>Name</label>
            <input 
             type="text" 
             value={name} 
             onChange={(e) => setName(e.target.value)}
             className='w-full p-2.5 sm:p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100'
             placeholder="Enter Your Name"
             required />
          </div>

          <div className='mb-4'>
            <label className='block text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-1.5 sm:mb-2 text-stone-600 dark:text-stone-300'>Email</label>
            <input 
             type="email" 
             value={email} 
             onChange={(e) => setEmail(e.target.value)}
             className='w-full p-2.5 sm:p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100'
             placeholder="Enter Your Email Address"
             required />
          </div>

          <div className='mb-5 sm:mb-6'>
            <label className='block text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-1.5 sm:mb-2 text-stone-600 dark:text-stone-300'>Password</label>
            <input 
             type="password" 
             value={password}
             onChange={(e) => setPassword(e.target.value)} 
             className='w-full p-2.5 sm:p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100'
             placeholder="Enter Your Password"
             required />
          </div>

          <button type='submit' className='w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 p-3 sm:p-3.5 rounded-xl text-[10px] sm:text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer shadow-sm'>
            Sign Up
          </button>

          <p className='mt-5 sm:mt-6 text-center text-[10px] sm:text-xs text-stone-500 dark:text-stone-400'>
            Already have an account?{" "}
            <Link to="/login" className='text-stone-900 dark:text-stone-100 font-semibold underline underline-offset-4'>Login</Link>
          </p>
        </form>
      </div>

      {/* Right Side: Image Banner */}
      <div className='hidden md:block w-1/2 h-full bg-stone-900'>
        <img src={registerImg} alt="Register Account" className='h-full w-full object-cover brightness-90'/>
      </div>
      
    </div>
  )
}

export default Register;