import { Link, useNavigate } from "react-router-dom"
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight, HiOutlineHeart } from "react-icons/hi2"
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2"
import SearchBar from "./SearchBar"
import CartDrawer from "../Layout/CartDrawer"
import { useState, useEffect } from "react"
import { IoMdClose } from "react-icons/io"
import { toast } from "sonner"

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const navigate = useNavigate();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 15);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchCartCount = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch("/api/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("userInfo");
                setCartItemCount(0);
                return;
            }

            const data = await response.json();
            if (response.ok && data.cart) {
                setCartItemCount(data.cart.reduce((acc, item) => acc + item.quantity, 0));
            } else {
                setCartItemCount(0);
            }
        } catch {
            setCartItemCount(0);
        }
    };

    useEffect(() => {
        const handleCartUpdate = () => { void fetchCartCount(); };
        queueMicrotask(handleCartUpdate);
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);

    useEffect(() => {
        const handleOpenCart = () => setDrawerOpen(true);
        window.addEventListener("openCart", handleOpenCart);
        return () => window.removeEventListener("openCart", handleOpenCart);
    }, []);

    const openDrawer = () => setNavDrawerOpen(true);
    const closeDrawer = () => setNavDrawerOpen(false);

    const toggleCartDrawer = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please log in to view your cart", { duration: 1500 });
            navigate("/login");
            return;
        }
        setDrawerOpen(prev => !prev);
    };

    const handleProfileClick = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to view your profile", { duration: 1500 });
            navigate("/login");
        } else {
            navigate("/profile");
        }
    };

    const handleWishlistClick = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to view your wishlist", { duration: 1500 });
            navigate("/login");
        } else {
            navigate("/wishlist");
        }
    };

    const navLinks = [
        { label: "Men", path: "/collections/Men" },
        { label: "Women", path: "/collections/Women" },
        { label: "Top Wear", path: "/collections/Top Wear" },
        { label: "Bottom Wear", path: "/collections/Bottom Wear" },
    ];

    return (
        <>
            {/* ── Top Navigation Bar ── */}
            <nav className={`w-full transition-all duration-300 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl z-30 relative ${
                isScrolled
                    ? "border-b border-stone-200/80 dark:border-stone-800/80 shadow-sm py-3.5 md:py-4"
                    : "border-b border-stone-100 dark:border-stone-900 py-4 md:py-6"
            }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Brand Logo — always visible */}
                    <Link to="/" className="text-2xl lg:text-3xl font-serif font-normal tracking-[0.25em] uppercase text-stone-950 dark:text-stone-100">
                        Zaaish
                    </Link>

                    {/* Desktop centre links */}
                    <div className="hidden md:flex space-x-8 lg:space-x-10">
                        {navLinks.map(({ label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop right-side icons */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-5">
                        <SearchBar />

                        <button
                            onClick={toggleDarkMode}
                            className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer"
                            title="Toggle Theme"
                        >
                            {darkMode ? <HiOutlineSun className="h-5 w-5 stroke-[1.5]" /> : <HiOutlineMoon className="h-5 w-5 stroke-[1.5]" />}
                        </button>

                        <button
                            onClick={handleWishlistClick}
                            className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer"
                            title="Wishlist"
                        >
                            <HiOutlineHeart className="h-5 w-5 stroke-[1.5]" />
                        </button>

                        <button
                            onClick={handleProfileClick}
                            className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer"
                            title="Profile"
                        >
                            <HiOutlineUser className="h-5 w-5 stroke-[1.5]" />
                        </button>

                        <button
                            onClick={toggleCartDrawer}
                            className="relative text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer"
                            title="Cart"
                        >
                            <HiOutlineShoppingBag className="h-5 w-5 stroke-[1.5]" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 text-[9px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-semibold">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ── Mobile right cluster: Cart + Hamburger only ── */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleCartDrawer}
                            className="relative p-2 text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Cart"
                        >
                            <HiOutlineShoppingBag className="h-[22px] w-[22px] stroke-[1.5]" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 text-[8px] rounded-full h-[15px] w-[15px] flex items-center justify-center font-bold">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={openDrawer}
                            className="p-2 text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Open Menu"
                        >
                            <HiBars3BottomRight className="h-6 w-6 stroke-[1.5]" />
                        </button>
                    </div>

                </div>
            </nav>

            {/* ── Cart Drawer ── */}
            <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

            {/* ── Mobile Overlay ── */}
            <div
                onClick={closeDrawer}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                    navDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* ── Mobile Nav Drawer (right-side slide-in) ── */}
            <div
                className={`fixed inset-y-0 right-0 z-50 flex flex-col w-[min(20rem,85vw)] bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-100 dark:border-stone-800 md:hidden transition-transform duration-300 ease-out ${
                    navDrawerOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 flex-shrink-0">
                    <Link
                        to="/"
                        onClick={closeDrawer}
                        className="text-xl font-serif tracking-[0.3em] uppercase text-stone-950 dark:text-stone-100"
                    >
                        Zaaish
                    </Link>
                    <button
                        onClick={closeDrawer}
                        className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
                    >
                        <IoMdClose className="h-5 w-5" />
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-5 pt-5 pb-2 flex-shrink-0">
                    <SearchBar />
                </div>

                {/* Scrollable nav body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Collections */}
                    <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-600 font-medium mb-3 px-2">
                        Collections
                    </p>
                    <nav className="mb-6 space-y-0.5">
                        {navLinks.map(({ label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={closeDrawer}
                                className="flex items-center justify-between px-3 py-3.5 rounded-xl text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-950 dark:hover:text-white transition-colors group"
                            >
                                <span className="text-xs uppercase tracking-[0.15em] font-medium">{label}</span>
                                <span className="text-stone-300 dark:text-stone-700 text-base group-hover:translate-x-0.5 transition-transform">›</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Account */}
                    <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-600 font-medium mb-3 px-2">
                        Account
                    </p>
                    <div className="space-y-0.5">
                        <button
                            onClick={() => { closeDrawer(); handleWishlistClick(); }}
                            className="flex items-center gap-3 w-full px-3 py-3.5 rounded-xl text-xs font-medium uppercase tracking-[0.12em] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <HiOutlineHeart className="h-4 w-4 stroke-[1.5] flex-shrink-0" />
                            Wishlist
                        </button>
                        <button
                            onClick={() => { closeDrawer(); handleProfileClick(); }}
                            className="flex items-center gap-3 w-full px-3 py-3.5 rounded-xl text-xs font-medium uppercase tracking-[0.12em] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <HiOutlineUser className="h-4 w-4 stroke-[1.5] flex-shrink-0" />
                            My Profile
                        </button>
                    </div>
                </div>

                {/* Drawer footer — Dark mode toggle */}
                <div className="flex-shrink-0 px-5 py-4 border-t border-stone-100 dark:border-stone-800">
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium uppercase tracking-[0.12em] cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                        {darkMode
                            ? <HiOutlineSun className="h-4 w-4 stroke-[1.5]" />
                            : <HiOutlineMoon className="h-4 w-4 stroke-[1.5]" />
                        }
                    </button>
                </div>
            </div>
        </>
    );
};

export default Navbar;
