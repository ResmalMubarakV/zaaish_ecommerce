import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                if (data.user.role === "admin") {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userInfo", JSON.stringify(data.user));
                    navigate("/admin");
                } else {
                    alert("Access Denied: You do not have administrator privileges.");
                }
            } else {
                alert(data.message || "Invalid admin credentials");
            }
        } catch (error) {
            console.error("Admin login error:", error);
            alert("Server error during admin login");
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-stone-950 text-stone-100 p-6'>
            <div className='w-full max-w-md bg-stone-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-stone-800'>
                <div className='text-center mb-8'>
                    <h2 className='text-xl sm:text-2xl font-serif font-light tracking-[0.25em] uppercase text-white'>Zaaish Admin</h2>
                    <p className='text-[10px] uppercase tracking-[0.2em] text-stone-500 mt-2'>Restricted Access Only</p>
                </div>
                <form onSubmit={handleAdminSubmit}>
                    <div className='mb-5'>
                        <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 mb-2'>Admin Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-3.5 border border-stone-800 rounded-xl bg-stone-950 text-stone-100 text-sm font-light focus:outline-none focus:border-stone-500 transition-colors'
                            placeholder="admin@example.com"
                            required 
                        />
                    </div>
                    <div className='mb-8'>
                        <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 mb-2'>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            className='w-full p-3.5 border border-stone-800 rounded-xl bg-stone-950 text-stone-100 text-sm font-light focus:outline-none focus:border-stone-500 transition-colors'
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    <button type='submit' className='w-full bg-stone-100 text-stone-950 p-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-white transition-all cursor-pointer shadow-sm'>
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;