import React, { useEffect, useState } from 'react'

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
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

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to remove this user account?")) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    alert("User deleted successfully");
                    setUsers(users.filter((user) => user._id !== userId));
                } else {
                    alert(data.message || "Failed to delete user");
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Server error while deleting user");
            }
        }
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading user records...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100">User Management</h2>
                <p className="text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mt-1">Review accounts, roles, and administrative permissions.</p>
            </div>
            <div className="text-xs uppercase tracking-[0.15em] bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap border border-stone-200/80 dark:border-stone-800">
                Total Users: {users.length}
            </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                    <thead className='bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800'>
                        <tr>
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Email</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead> 
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                    <td className='py-4 px-6'>
                                        <div className="flex items-center space-x-3.5">
                                            <div className="w-9 h-9 rounded-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate max-w-[120px] sm:max-w-none">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className='py-4 px-6 text-stone-600 dark:text-stone-300 text-sm font-light truncate max-w-[180px] sm:max-w-none'>{user.email}</td>
                                    <td className='py-4 px-6'>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${user.role === "admin" ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950" : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className='py-4 px-6 text-right'>
                                        {user.role !== "admin" && (
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)}
                                                className='bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-rose-600 hover:text-white transition cursor-pointer'
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                    No users registered.
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