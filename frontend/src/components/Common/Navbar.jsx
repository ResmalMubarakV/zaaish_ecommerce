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
    const [navDrawerOpen, setNavdrawerOpen] = useState(false);
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

    const toggleDarkMode = () => setDarkMode(!darkMode);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchCartCount = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartItemCount(0);
            return;
        }

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
                const totalCount = data.cart.reduce((acc, item) => acc + item.quantity, 0);
                setCartItemCount(totalCount);
            } else {
                setCartItemCount(0);
            }
        } catch (error) {
            console.error("Failed to load cart count:", error);
            setCartItemCount(0);
        }
    };

    useEffect(() => {
        fetchCartCount();
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);

    const toggleNavDrawer = () => setNavdrawerOpen(!navDrawerOpen);

    const toggleCartDrawer = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please log in to view your cart", { duration: 1500 });
            navigate("/login");
            return;
        }
        setDrawerOpen(!drawerOpen);
    } 

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

  return (
    <>
        <nav className={`w-full transition-all duration-300 bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl ${isScrolled ? "border-b border-stone-200/80 dark:border-stone-800/80 shadow-sm py-4" : "border-b border-stone-100 dark:border-stone-900 py-6"}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8">
                {/* Brand Logo */}
                <div>
                    <Link to="/" className="text-2xl lg:text-3xl font-serif font-normal tracking-[0.25em] uppercase text-stone-950 dark:text-stone-100 cursor-pointer">
                        Zaaish
                    </Link>
                </div>

                {/* Desktop Menu Links */}
                <div className="hidden md:flex space-x-10">
                    <Link to="/collections/Men" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Men</Link>
                    <Link to="/collections/Women" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Women</Link>
                    <Link to="/collections/Top Wear" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Top Wear</Link>
                    <Link to="/collections/Bottom Wear" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Bottom Wear</Link>
                </div>

                {/* Action Icons */}
                <div className="flex items-center space-x-5 sm:space-x-6">
                    <div className="overflow-hidden">
                        <SearchBar />
                    </div>

                    <button onClick={toggleDarkMode} className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer" title="Toggle Theme">
                        {darkMode ? <HiOutlineSun className="h-5 w-5 stroke-[1.5]" /> : <HiOutlineMoon className="h-5 w-5 stroke-[1.5]" />}
                    </button>

                    <button onClick={handleWishlistClick} className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer" title="Wishlist">
                        <HiOutlineHeart className="h-5 w-5 stroke-[1.5]" />
                    </button>

                    <button onClick={handleProfileClick} className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer" title="Profile">
                        <HiOutlineUser className="h-5 w-5 stroke-[1.5]" /> 
                    </button>   

                    <button onClick={toggleCartDrawer} className="relative text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer" title="Cart">
                        <HiOutlineShoppingBag className="h-5 w-5 stroke-[1.5]" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold animate-pulse">
                                {cartItemCount}
                            </span>
                        )}
                    </button> 
 

                    <button onClick={toggleNavDrawer} className="md:hidden text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white p-1 cursor-pointer" title="Open Menu">
                        <HiBars3BottomRight className="h-6 w-6 stroke-[1.5]"/>
                    </button>
                </div>
            </div>
        </nav>

        {/* Cart Drawer Component */}
        <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer}/>

        {/* Mobile Navigation Drawer */}
        <div className={`fixed inset-y-0 left-0 w-4/5 sm:w-1/2 bg-white dark:bg-stone-900 shadow-2xl transform transition-transform duration-300 ease-out z-50 ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex justify-between items-center p-6 border-b border-stone-100 dark:border-stone-800">
                <span className="font-serif tracking-[0.25em] text-base uppercase text-stone-900 dark:text-stone-100 font-medium">Menu</span>
                <button onClick={toggleNavDrawer} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer p-1">
                    <IoMdClose className="h-6 w-6 stroke-[1.5]"/>
                </button>
            </div>
            <div className="p-8">
                <nav className="space-y-6">
                    <Link to="/collections/Men" onClick={toggleNavDrawer} className="block text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Men</Link>
                    <Link to="/collections/Women" onClick={toggleNavDrawer} className="block text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Women</Link>
                    <Link to="/collections/Top Wear" onClick={toggleNavDrawer} className="block text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Top Wear</Link>
                    <Link to="/collections/Bottom Wear" onClick={toggleNavDrawer} className="block text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer">Bottom Wear</Link>
                </nav>
            </div>
        </div>

        {/* Backdrop for Mobile Navigation Drawer */}
        {navDrawerOpen && (
            <div onClick={toggleNavDrawer} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden cursor-pointer transition-opacity"></div>
        )}
    </>
  )
}

export default Navbar;