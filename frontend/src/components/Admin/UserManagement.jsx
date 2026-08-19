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
        return <div className="text-center py-20 text-stone-400 font-light">Loading user records...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">User Management</h2>
                <p className="text-sm text-stone-500 mt-1">Review accounts, roles, and administrative permissions.</p>
            </div>
            <div className="text-sm bg-stone-100 text-stone-700 px-4 py-2 rounded-lg font-medium whitespace-nowrap">
                Total Users: {users.length}
            </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left text-stone-600 whitespace-nowrap">
                    <thead className='bg-stone-50 text-xs uppercase text-stone-500 font-semibold tracking-wider border-b border-stone-200'>
                        <tr>
                            <th className="py-4 px-4 sm:px-6">User</th>
                            <th className="py-4 px-4 sm:px-6">Email</th>
                            <th className="py-4 px-4 sm:px-6">Role</th>
                            <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                        </tr>
                    </thead> 
                    <tbody className="divide-y divide-stone-100">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className='hover:bg-stone-50/60 transition-colors'>
                                    <td className='py-4 px-4 sm:px-6'>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span className="font-medium text-stone-900 text-sm truncate max-w-[120px] sm:max-w-none">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className='py-4 px-4 sm:px-6 text-stone-600 text-sm truncate max-w-[150px] sm:max-w-none'>{user.email}</td>
                                    <td className='py-4 px-4 sm:px-6'>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${user.role === "admin" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className='py-4 px-4 sm:px-6 text-right'>
                                        {user.role !== "admin" && (
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)}
                                                className='bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 hover:text-white transition'
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className='py-12 text-center text-stone-400 font-light'>
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