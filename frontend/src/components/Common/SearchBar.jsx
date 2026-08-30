import { useState, useEffect } from "react";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";

const SearchBar = ({ buttonClassName = "", showLabel = false }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const navigate = useNavigate();

    const handleSearchToggle = () => {
        setIsOpen(!isOpen);
        setSearchTerm("");
        setSuggestions([]);
    };

    // Fetch real-time matching suggestions from database
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedSearchTerm.trim()) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedSearchTerm.trim())}&limit=5`);
                const data = await response.json();
                if (response.ok && data.products) {
                    setSuggestions(data.products);
                }
            } catch (error) {
                console.error("Suggestions fetch error:", error);
            }
        };
        fetchSuggestions();
    }, [debouncedSearchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/collections?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsOpen(false);
            setSearchTerm("");
            setSuggestions([]);
        }
    };

    return (
        <div className="flex items-center justify-center">
            {isOpen ? (
                <div className="fixed inset-x-0 top-0 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl min-h-24 z-[80] shadow-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 flex items-center justify-center transition-all duration-300">
                    <div className="relative w-full max-w-3xl mx-auto py-5">
                        <form onSubmit={handleSearch} className="relative flex items-center justify-between w-full">
                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    placeholder="Search luxury apparel, categories, and styles..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-3.5 pl-4 pr-12 rounded-xl focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 w-full placeholder:text-stone-400 text-xs sm:text-sm tracking-wide text-stone-900 dark:text-stone-100 transition-colors shadow-inner" 
                                    autoFocus
                                />
                                <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                                    <HiMagnifyingGlass className="h-5 w-5 stroke-[1.5]" />
                                </button>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleSearchToggle}
                                className="ml-5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white p-2 cursor-pointer transition-transform hover:scale-110"> 
                                <HiMiniXMark className="h-6 w-6 stroke-[1.5]" />
                            </button>
                        </form>

                        {/* Suggestions Dropdown */}
                        {searchTerm.trim().length > 0 && (
                            <div className="absolute top-[80px] left-0 right-0 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-[90] overflow-hidden max-h-96 overflow-y-auto mt-2">
                                {suggestions.length > 0 ? (
                                    <div className="p-4 divide-y divide-stone-100 dark:divide-stone-800">
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2 font-medium">Matching Products</p>
                                        {suggestions.map((product) => (
                                            <button 
                                                key={product._id} 
                                                onClick={() => {
                                                    navigate(`/product/${product._id}`);
                                                    setIsOpen(false);
                                                    setSearchTerm("");
                                                    setSuggestions([]);
                                                }}
                                                className="w-full text-left py-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 px-2 rounded-xl transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center">
                                                    <img 
                                                        src={product.images?.[0]?.url || "https://placehold.co/300x380"} 
                                                        alt={product.name} 
                                                        className="w-10 h-12 object-cover mr-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm flex-shrink-0"
                                                    />
                                                    <div>
                                                        <h4 className="font-serif text-sm text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors leading-snug">{product.name}</h4>
                                                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 uppercase tracking-wide">{product.category} &bull; {product.brand}</p>
                                                    </div>
                                                </div>
                                                <p className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100">₹{(product.currentPrice || product.price || 0).toLocaleString()}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-6 text-stone-400 dark:text-stone-500 text-xs font-light">
                                        No product matches found. Press Enter to view all search results.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <button onClick={handleSearchToggle} className={buttonClassName || "text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-transform hover:scale-110 p-1 cursor-pointer"} title="Search" aria-label="Search products">
                    <HiMagnifyingGlass className="h-5 w-5 stroke-[1.5]"/>
                    {showLabel && <span>Search the collection</span>}
                </button>
            )}
        </div>
    );
};

export default SearchBar;
