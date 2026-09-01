import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiTag, FiPlus, FiTrash2, FiEdit2, FiCheck, FiCopy, FiCalendar, FiClock, FiSearch, FiPercent, FiDollarSign, FiX, FiRefreshCw } from 'react-icons/fi';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [minOrderAmount, setMinOrderAmount] = useState("");
    const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [isActive, setIsActive] = useState(true);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/coupons", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCoupons(data.coupons || []);
            } else {
                toast.error(data.message || "Failed to fetch coupons");
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Network error fetching coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleOpenCreateModal = () => {
        setEditingCoupon(null);
        setCode("");
        setDescription("");
        setDiscountType("percentage");
        setDiscountValue("");
        setMinOrderAmount("");
        setMaxDiscountAmount("");
        setUsageLimit("");
        setExpiresAt("");
        setIsActive(true);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (coupon) => {
        setEditingCoupon(coupon);
        setCode(coupon.code);
        setDescription(coupon.description || "");
        setDiscountType(coupon.discountType || "percentage");
        setDiscountValue(coupon.discountValue);
        setMinOrderAmount(coupon.minOrderAmount || "");
        setMaxDiscountAmount(coupon.maxDiscountAmount || "");
        setUsageLimit(coupon.usageLimit || "");
        setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "");
        setIsActive(coupon.isActive);
        setIsModalOpen(true);
    };

    const handleSubmitCoupon = async (e) => {
        e.preventDefault();
        if (!code || !discountValue) {
            toast.error("Please fill in coupon code and discount value");
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            const payload = {
                code: code.trim().toUpperCase(),
                description,
                discountType,
                discountValue: Number(discountValue),
                minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
                maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                expiresAt: expiresAt || null,
                isActive,
            };

            const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : "/api/coupons";
            const method = editingCoupon ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(editingCoupon ? "Coupon updated successfully" : "Coupon created successfully");
                setIsModalOpen(false);
                fetchCoupons();
            } else {
                toast.error(data.message || "Failed to save coupon");
            }
        } catch (error) {
            console.error("Save coupon error:", error);
            toast.error("Error saving coupon");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (coupon) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/coupons/${coupon._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !coupon.isActive })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Coupon ${coupon.code} ${!coupon.isActive ? "Activated" : "Deactivated"}`);
                fetchCoupons();
            } else {
                toast.error(data.message || "Failed to toggle status");
            }
        } catch (error) {
            toast.error("Error toggling status");
        }
    };

    const handleDeleteCoupon = async (coupon) => {
        if (window.confirm(`Are you sure you want to permanently delete coupon ${coupon.code}?`)) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/coupons/${coupon._id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success("Coupon deleted");
                    fetchCoupons();
                } else {
                    toast.error(data.message || "Failed to delete coupon");
                }
            } catch (error) {
                toast.error("Error deleting coupon");
            }
        }
    };

    const handleCopyCode = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied "${text}" to clipboard`);
    };

    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const now = new Date();
        const isExpired = c.expiresAt && new Date(c.expiresAt) < now;

        if (filterStatus === "active") return matchesSearch && c.isActive && !isExpired;
        if (filterStatus === "expired") return matchesSearch && (isExpired || !c.isActive);
        return matchesSearch;
    });

    const activeCount = coupons.filter(c => c.isActive && (!c.expiresAt || new Date(c.expiresAt) >= new Date())).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

    if (loading && coupons.length === 0) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading coupons atelier...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100">
            
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-xl sm:text-3xl font-serif font-light tracking-wide">Coupons & Promo Codes</h1>
                    <p className="text-xs uppercase tracking-[0.15em] text-stone-400 mt-1">
                        Create boutique promotions, discount vouchers, and configure checkout offers.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={fetchCoupons}
                        className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition cursor-pointer shadow-sm"
                        title="Refresh"
                    >
                        <FiRefreshCw className="text-sm" />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="grow sm:grow-0 inline-flex items-center justify-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer"
                    >
                        <FiPlus className="mr-2 text-sm" /> Create Coupon
                    </button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block font-medium">Total Promo Codes</span>
                        <span className="text-2xl font-serif font-light text-stone-900 dark:text-stone-100 mt-1 block">{coupons.length}</span>
                    </div>
                    <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-stone-600 dark:text-stone-300">
                        <FiTag className="text-lg" />
                    </div>
                </div>

                <div className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block font-medium">Active & Redeemable</span>
                        <span className="text-2xl font-serif font-light text-emerald-600 dark:text-emerald-400 mt-1 block">{activeCount}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <FiCheck className="text-lg" />
                    </div>
                </div>

                <div className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block font-medium">Total Redemptions</span>
                        <span className="text-2xl font-serif font-light text-stone-900 dark:text-stone-100 mt-1 block">{totalRedemptions} Uses</span>
                    </div>
                    <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-stone-600 dark:text-stone-300">
                        <FiPercent className="text-lg" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: "all", label: "All Coupons" },
                        { id: "active", label: `Active (${activeCount})` },
                        { id: "expired", label: "Inactive / Expired" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition cursor-pointer ${
                                filterStatus === tab.id
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search promo code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 pl-10 text-xs tracking-wide focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 shadow-sm"
                    />
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-none">
                    <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap text-xs">
                        <thead className="bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800">
                            <tr>
                                <th className="py-4 px-6">Promo Code</th>
                                <th className="py-4 px-6">Discount Value</th>
                                <th className="py-4 px-6">Min Spend / Cap</th>
                                <th className="py-4 px-6">Redemptions</th>
                                <th className="py-4 px-6">Validity</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                            {filteredCoupons.length > 0 ? (
                                filteredCoupons.map((coupon) => {
                                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                                    return (
                                        <tr key={coupon._id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                                            {/* Code */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-sm font-bold tracking-wider px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-950 dark:text-stone-100 rounded-lg border border-stone-200 dark:border-stone-700">
                                                        {coupon.code}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleCopyCode(coupon.code)}
                                                        className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 p-1"
                                                        title="Copy Code"
                                                    >
                                                        <FiCopy className="text-xs" />
                                                    </button>
                                                </div>
                                                {coupon.description && (
                                                    <p className="text-[11px] text-stone-400 font-light mt-1 max-w-[200px] truncate">{coupon.description}</p>
                                                )}
                                            </td>

                                            {/* Discount Value */}
                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                                    {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue.toFixed(2)} FLAT`}
                                                </span>
                                                <span className="text-[10px] text-stone-400 block font-light">
                                                    {coupon.discountType === "percentage" ? "Percentage Discount" : "Fixed Cash Discount"}
                                                </span>
                                            </td>

                                            {/* Min Spend */}
                                            <td className="py-4 px-6">
                                                <p className="text-stone-800 dark:text-stone-200">
                                                    Min: ₹{(coupon.minOrderAmount || 0).toFixed(2)}
                                                </p>
                                                {coupon.maxDiscountAmount && (
                                                    <p className="text-[10px] text-stone-400 font-light">
                                                        Cap: ₹{coupon.maxDiscountAmount.toFixed(2)}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Usage */}
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-stone-800 dark:text-stone-200">
                                                    {coupon.usedCount || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "uses"}
                                                </p>
                                                {coupon.usageLimit && (
                                                    <div className="w-20 bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className="bg-stone-900 dark:bg-stone-100 h-full rounded-full"
                                                            style={{ width: `${Math.min(100, ((coupon.usedCount || 0) / coupon.usageLimit) * 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Validity */}
                                            <td className="py-4 px-6">
                                                {coupon.expiresAt ? (
                                                    <div>
                                                        <span className={`block font-medium ${isExpired ? "text-rose-600 dark:text-rose-400" : "text-stone-700 dark:text-stone-300"}`}>
                                                            {new Date(coupon.expiresAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] text-stone-400 font-light">
                                                            {isExpired ? "Expired" : "Active until date"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-500 font-light italic">Never Expires</span>
                                                )}
                                            </td>

                                            {/* Status Switch */}
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => handleToggleActive(coupon)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                                                        coupon.isActive && !isExpired
                                                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                            : "bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700"
                                                    }`}
                                                >
                                                    {coupon.isActive && !isExpired ? "Active" : "Inactive"}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(coupon)}
                                                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                                                    title="Edit Coupon"
                                                >
                                                    <FiEdit2 className="text-xs" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon)}
                                                    className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                    title="Delete Coupon"
                                                >
                                                    <FiTrash2 className="text-xs" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light">
                                        No coupons found. Create your first promo code above!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE / EDIT COUPON MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-[95%] sm:w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                        <div className="flex justify-between items-start mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Boutique Promotions</span>
                                <h3 className="text-xl font-serif font-light mt-1">{editingCoupon ? "Edit Promo Code" : "Create New Promo Code"}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white text-xl">
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCoupon} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Coupon Code *</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. FESTIVE20"
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-stone-900 uppercase"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. 20% off for festive luxury collection"
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Discount Type *</label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                    >
                                        <option value="percentage">Percentage (% OFF)</option>
                                        <option value="fixed">Fixed Amount (₹ FLAT)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Discount Value *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 500 (for ₹500)"}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Min Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={minOrderAmount}
                                        onChange={(e) => setMinOrderAmount(e.target.value)}
                                        placeholder="0 (No minimum)"
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Max Discount Cap (₹)</label>
                                    <input
                                        type="number"
                                        value={maxDiscountAmount}
                                        onChange={(e) => setMaxDiscountAmount(e.target.value)}
                                        placeholder="Optional limit"
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Total Usage Limit</label>
                                    <input
                                        type="number"
                                        value={usageLimit}
                                        onChange={(e) => setUsageLimit(e.target.value)}
                                        placeholder="Unlimited"
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Expiration Date</label>
                                    <input
                                        type="date"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isCouponActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="isCouponActive" className="text-xs font-medium cursor-pointer">
                                    Activate coupon immediately for customer checkout
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium uppercase tracking-wider hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-medium uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CouponManagement;
