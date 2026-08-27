import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiSearch, FiUserCheck, FiShield, FiTrash2, FiUser } from 'react-icons/fi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users || []);
            } else {
                console.error("Failed to fetch users:", data.message);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, name) => {
        if (window.confirm(`Are you sure you want to remove user account "${name}"?`)) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    toast.success("User account deleted successfully");
                    setUsers(users.filter((user) => user._id !== userId));
                } else {
                    toast.error(data.message || "Failed to delete user");
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Server error while deleting user");
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = roleFilter === "All" || user.role === roleFilter;
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading user records...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100'>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-wide">User Account Management</h1>
                    <p className="text-xs uppercase tracking-[0.15em] text-stone-400 mt-1">Review registered user accounts, administrative privileges, and security roles.</p>
                </div>
                <div className="text-xs uppercase tracking-[0.15em] bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap border border-stone-200/80 dark:border-stone-800">
                    Total Accounts: {users.length}
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
                <div className="flex items-center gap-2">
                    {["All", "user", "admin"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium cursor-pointer transition-all ${
                                roleFilter === role
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                            }`}
                        >
                            {role === "All" ? "All Accounts" : role === "admin" ? "Admins" : "Customers"}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search user name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 pl-10 text-xs tracking-wide focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                    />
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        <thead className='bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800'>
                            <tr>
                                <th className="py-4 px-6">User Profile</th>
                                <th className="py-4 px-6">Email Address</th>
                                <th className="py-4 px-6">Account Role</th>
                                <th className="py-4 px-6">Joined Date</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead> 
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                        <td className='py-4 px-6'>
                                            <div className="flex items-center space-x-3.5">
                                                <div className="w-10 h-10 rounded-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center text-xs font-serif font-light flex-shrink-0 shadow-sm">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <span className="font-serif font-medium text-stone-900 dark:text-stone-100 text-sm block">{user.name}</span>
                                                    <span className="text-[10px] text-stone-400 font-mono">ID: #{user._id.substring(user._id.length - 6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-4 px-6 text-stone-700 dark:text-stone-300 text-sm font-light'>{user.email}</td>
                                        <td className='py-4 px-6'>
                                            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${user.role === "admin" ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm" : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"}`}>
                                                {user.role === "admin" ? <FiShield className="text-xs mr-1" /> : <FiUser className="text-xs mr-1" />}
                                                <span>{user.role}</span>
                                            </span>
                                        </td>
                                        <td className='py-4 px-6 text-stone-500 text-xs font-light'>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className='py-4 px-6 text-right'>
                                            {user.role !== "admin" ? (
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    className='inline-flex items-center bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-rose-600 hover:text-white transition cursor-pointer'
                                                >
                                                    <FiTrash2 className="mr-1.5" /> Delete
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-stone-400 uppercase tracking-wider font-light">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                        No users found matching query.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>    
                </div>    
            </div>    
        </div>
    );
};

export default UserManagement;