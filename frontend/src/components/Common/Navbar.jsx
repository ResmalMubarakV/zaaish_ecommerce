import { Link, useNavigate } from "react-router-dom"
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from "react-icons/hi2"
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
            setIsScrolled(window.scrollY > 20);
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

  return (
    <>
        <nav className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md ${isScrolled ? "border-b border-stone-200/80 dark:border-stone-800 shadow-sm" : "border-b border-stone-100 dark:border-stone-900"}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-6 lg:px-8">
                <div>
                    <Link to="/" className="text-2xl lg:text-3xl font-serif font-normal tracking-[0.2em] uppercase text-stone-950 dark:text-stone-100 cursor-pointer">
                        Zaaish
                    </Link>
                </div>

                <div className="hidden md:flex space-x-8">
                    <Link to="/collections/Men" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer">Men</Link>
                    <Link to="/collections/Women" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer">Women</Link>
                    <Link to="/collections/Top Wear" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer">Top Wear</Link>
                    <Link to="/collections/Bottom Wear" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer">Bottom Wear</Link>
                </div>

                <div className="flex items-center space-x-5">
                    <div className="overflow-hidden">
                        <SearchBar />
                    </div>

                    <button onClick={toggleDarkMode} className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors p-1 cursor-pointer" title="Toggle Theme">
                        {darkMode ? <HiOutlineSun className="h-5 w-5 stroke-[1.5]" /> : <HiOutlineMoon className="h-5 w-5 stroke-[1.5]" />}
                    </button>

                    <button onClick={handleProfileClick} className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors p-1 cursor-pointer" title="Profile">
                        <HiOutlineUser className="h-5 w-5 stroke-[1.5]" /> 
                    </button>   

                    <button onClick={toggleCartDrawer} className="relative text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors p-1 cursor-pointer" title="Cart">
                        <HiOutlineShoppingBag className="h-5 w-5 stroke-[1.5]" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold cursor-pointer">
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

        <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer}/>

        <div className={`fixed inset-y-0 left-0 w-3/4 sm:w-1/2 bg-white dark:bg-stone-900 shadow-2xl transform transition-transform duration-300 ease-out z-50 ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex justify-between items-center p-6 border-b border-stone-100 dark:border-stone-800">
                <span className="font-serif tracking-widest text-lg uppercase text-stone-900 dark:text-stone-100">Menu</span>
                <button onClick={toggleNavDrawer} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                    <IoMdClose className="h-6 w-6 stroke-[1.5]"/>
                </button>
            </div>
            <div className="p-6">
                <nav className="space-y-5">
                    <Link to="/collections/Men" onClick={toggleNavDrawer} className="block text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-widest font-medium cursor-pointer">Men</Link>
                    <Link to="/collections/Women" onClick={toggleNavDrawer} className="block text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-widest font-medium cursor-pointer">Women</Link>
                    <Link to="/collections/Top Wear" onClick={toggleNavDrawer} className="block text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-widest font-medium cursor-pointer">Top Wear</Link>
                    <Link to="/collections/Bottom Wear" onClick={toggleNavDrawer} className="block text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white text-sm uppercase tracking-widest font-medium cursor-pointer">Bottom Wear</Link>
                </nav>
            </div>
        </div>

        {navDrawerOpen && (
            <div onClick={toggleNavDrawer} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden cursor-pointer"></div>
        )}
    </>
  )
}

export default Navbar;