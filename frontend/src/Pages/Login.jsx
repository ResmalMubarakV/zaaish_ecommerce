import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import login from "../assets/login.webp"
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await fetch("/api/users/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password })
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
                          window.dispatchEvent(new Event("wishlistUpdated"));
                      }
                  } catch (cartError) {
                          console.error("Error syncing pending cart item:", cartError);
                  }
              }
              
              if (data.user.role === "admin") {
                  navigate("/admin");
              } else {
                  navigate("/");
              }
          } else {
              alert(data.message || "Invalid credentials");
          }
      } catch (error) {
          console.error("Login error:", error);
          alert("Server error during login");
      }
    };

  return (
    <div className='flex h-[calc(100vh-73px)] w-full bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors overflow-hidden'>
      
      {/* Left Side: Form Container */}
      <div className='w-full md:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-10 h-full overflow-y-auto'>
        <form onSubmit={handleSubmit} className='my-6 w-full max-w-md bg-white dark:bg-stone-900 p-6 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm'>
          
          <div className='flex justify-center mb-6'>
            <h2 className='text-2xl font-serif tracking-[0.25em] uppercase text-stone-950 dark:text-stone-100 font-light'>Zaaish</h2>
          </div>
          
          <h2 className='text-xl font-serif font-light text-center mb-2 tracking-wide'>Welcome Back</h2>
          <p className='text-center mb-8 text-stone-400 dark:text-stone-500 text-[10px] uppercase tracking-[0.2em] font-medium'>
            Please enter your details to sign in
          </p>
          
          <div className='mb-5'>
            <label className='block text-[10px] uppercase tracking-[0.2em] font-medium mb-2 text-stone-400 dark:text-stone-500'>Email Address</label>
            <input 
             type="email" 
             value={email} 
             onChange={(e) => setEmail(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
             className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors'
             placeholder="Enter your email address"
             required />
          </div>
          
          <div className='mb-8'>
            <label className='block text-[10px] uppercase tracking-[0.2em] font-medium mb-2 text-stone-400 dark:text-stone-500'>Password</label>
            <div className='relative'>
              <input 
               type={showPassword ? "text" : "password"}
               value={password}
               onChange={(e) => setPassword(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
               className='w-full p-3.5 pr-12 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors'
               placeholder="Enter your password"
               autoComplete="current-password"
               required />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className='absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer'>
                {showPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}
              </button>
            </div>
          </div>
          
          <button type='submit' className='w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 p-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer shadow-sm'>
            Sign In
          </button>
          
          <p className='mt-8 text-center text-xs text-stone-500 dark:text-stone-400 font-light'>
            Don't have an account?{" "}
            <Link to="/register" className='text-stone-900 dark:text-stone-100 font-medium underline underline-offset-4'>Register</Link>
          </p>
        </form>
      </div>

      {/* Right Side: Image Banner */}
      <div className='hidden md:block w-1/2 h-full bg-stone-900 overflow-hidden'>
        <img src={login} alt="Login To Account" className='h-full w-full object-cover brightness-[0.85]'/>
      </div>
      
    </div>
  )
}

export default Login;
