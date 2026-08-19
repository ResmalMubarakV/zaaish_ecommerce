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
        <div className='flex min-h-screen items-center justify-center bg-gray-900'>
            <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'>
                <div className='text-center mb-6'>
                    <h2 className='text-2xl font-bold text-gray-900'>Zaaish Admin Portal</h2>
                    <p className='text-sm text-gray-500 mt-1'>Restricted Access Only</p>
                </div>
                <form onSubmit={handleAdminSubmit}>
                    <div className='mb-4'>
                        <label className='block text-sm font-semibold mb-2 text-gray-700'>Admin Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder="admin@example.com"
                            required 
                        />
                    </div>
                    <div className='mb-6'>
                        <label className='block text-sm font-semibold mb-2 text-gray-700'>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            className='w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    <button type='submit' className='w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-800 transition'>
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;