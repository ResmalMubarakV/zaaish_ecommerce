import { useState } from "react"
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearchToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/collections?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    return (
        <div className="flex items-center justify-center">
            {isOpen ? (
                <div className="absolute inset-x-0 top-0 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md h-24 z-50 shadow-sm border-b border-stone-200 dark:border-stone-800 px-6 flex items-center justify-center transition-all">
                    <form onSubmit={handleSearch} className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                        <div className="relative w-full">
                            <input 
                                type="text" 
                                placeholder="Search collections or apparel..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 w-full placeholder:text-stone-400 text-sm tracking-wide text-stone-900 dark:text-stone-100 transition-colors" 
                                autoFocus
                            />
                            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                                <HiMagnifyingGlass className="h-5 w-5 stroke-[1.5]" />
                            </button>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleSearchToggle}
                            className="ml-6 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white p-2 cursor-pointer"> 
                            <HiMiniXMark className="h-6 w-6 stroke-[1.5]" />
                        </button>
                    </form>
                </div>
            ) : (
                <button onClick={handleSearchToggle} className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors p-1 cursor-pointer" title="Search">
                    <HiMagnifyingGlass className="h-5 w-5 stroke-[1.5]"/>
                </button>
            )}
        </div>
    );
};

export default SearchBar;