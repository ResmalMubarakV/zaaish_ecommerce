import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const categories = ["Top Wear", "Bottom Wear", "Outerwear", "Accessories", "Footwear"];
    const genders = ["Men", "Women", "Unisex"];
    const colors = ["Black", "Charcoal", "Cream", "Ivory", "Navy", "Emerald", "Champagne", "Sand", "Olive"];
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "40", "42"];
    const materials = ["Mulberry Silk", "Cashmere Blend", "Egyptian Cotton", "Italian Leather", "Virgin Wool", "Merino Wool", "Irish Linen"];
    const brands = ["Zaaish Reserve", "Zaaish Atelier", "Zaaish Collection"];

    const [filters, setFilters] = useState({
        category: "",
        gender: "",
        color: "",
        size: [],
        material: [],
        brand: [],
        minPrice: 0,
        maxPrice: 1000,
    });

    const [maxPriceInput, setMaxPriceInput] = useState(1000);

    // Sync initial state from URL parameters
    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
    
        const parsedMaxPrice = params.maxPrice ? Number(params.maxPrice) : 1000;

        setFilters({
            category: params.category || "",
            gender: params.gender || "",
            color: params.color || "",
            size: params.size ? params.size.split(",") : [],
            material: params.material ? params.material.split(",") : [],
            brand: params.brand ? params.brand.split(",") : [],
            minPrice: params.minPrice ? Number(params.minPrice) : 0,
            maxPrice: parsedMaxPrice,
        });

        setMaxPriceInput(parsedMaxPrice);
    }, [searchParams]);

    const updateURLParams = (updatedFilters) => {
        const params = new URLSearchParams();

        // Preserve current search and sort queries
        const searchQuery = searchParams.get("search");
        if (searchQuery) params.set("search", searchQuery);

        const sortQuery = searchParams.get("sortBy");
        if (sortQuery) params.set("sortBy", sortQuery);

        // Always reset to page 1 when filters change
        params.set("page", "1");
        params.set("limit", "12");

        if (updatedFilters.category) params.set("category", updatedFilters.category);
        if (updatedFilters.gender) params.set("gender", updatedFilters.gender);
        if (updatedFilters.color) params.set("color", updatedFilters.color);
        
        if (updatedFilters.size.length > 0) params.set("size", updatedFilters.size.join(","));
        if (updatedFilters.material.length > 0) params.set("material", updatedFilters.material.join(","));
        if (updatedFilters.brand.length > 0) params.set("brand", updatedFilters.brand.join(","));

        if (updatedFilters.minPrice > 0) params.set("minPrice", updatedFilters.minPrice.toString());
        if (updatedFilters.maxPrice < 1000) params.set("maxPrice", updatedFilters.maxPrice.toString());

        setSearchParams(params);
    };

    const handleCategoryClick = (category) => {
        const newCategory = filters.category === category ? "" : category;
        const newFilters = { ...filters, category: newCategory };
        setFilters(newFilters);
        updateURLParams(newFilters);
    };

    const handleGenderClick = (gender) => {
        const newGender = filters.gender === gender ? "" : gender;
        const newFilters = { ...filters, gender: newGender };
        setFilters(newFilters);
        updateURLParams(newFilters);
    };

    const handleColorClick = (color) => {
        const newColor = filters.color === color ? "" : color;
        const newFilters = { ...filters, color: newColor };
        setFilters(newFilters);
        updateURLParams(newFilters);
    };

    const handleCheckboxToggle = (field, value) => {
        const currentList = filters[field] || [];
        const newList = currentList.includes(value)
            ? currentList.filter(item => item !== value)
            : [...currentList, value];

        const newFilters = { ...filters, [field]: newList };
        setFilters(newFilters);
        updateURLParams(newFilters);
    };

    const handlePriceSliderChange = (e) => {
        const val = Number(e.target.value);
        setMaxPriceInput(val);
        const newFilters = { ...filters, maxPrice: val };
        setFilters(newFilters);
        updateURLParams(newFilters);
    };

    const handleResetFilters = () => {
        const resetState = {
            category: "",
            gender: "",
            color: "",
            size: [],
            material: [],
            brand: [],
            minPrice: 0,
            maxPrice: 1000
        };
        setFilters(resetState);
        setMaxPriceInput(1000);

        const params = new URLSearchParams();
        const searchQuery = searchParams.get("search");
        if (searchQuery) params.set("search", searchQuery);
        params.set("page", "1");
        params.set("limit", "12");

        setSearchParams(params);
    };

    return (
        <div className='p-6 sm:p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm text-stone-900 dark:text-stone-100 transition-colors'>
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-stone-100 dark:border-stone-800'>
                <h3 className='text-sm font-serif font-medium uppercase tracking-[0.2em] text-stone-900 dark:text-stone-100'>Refine Selection</h3>
                <button 
                    onClick={handleResetFilters}
                    className='text-[10px] uppercase tracking-[0.2em] bg-stone-100 dark:bg-stone-800 hover:bg-stone-950 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-950 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium'
                >
                    Reset All
                </button>
            </div>

            {/* Category filter */}
            <div className='mb-6'>
                <label className='block text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3'>Category</label>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => handleCategoryClick(category)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                                filters.category === category
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 font-medium shadow-sm"
                                    : "hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300"
                            }`}
                        >
                            <span>{category}</span>
                            {filters.category === category && <span className="text-[10px]">✓</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gender filter */}
            <div className='mb-6'>
                <label className='block text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3'>Gender</label>
                <div className="grid grid-cols-3 gap-2">
                    {genders.map((gender) => (
                        <button
                            key={gender}
                            type="button"
                            onClick={() => handleGenderClick(gender)}
                            className={`py-2 rounded-xl text-xs tracking-wider uppercase font-medium transition-all text-center cursor-pointer ${
                                filters.gender === gender
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                            }`}
                        >
                            {gender}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className='mb-6'>
                <div className="flex justify-between items-center mb-2">
                    <label className='text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em]'>Max Price</label>
                    <span className="text-xs font-serif font-medium text-stone-900 dark:text-stone-100">${maxPriceInput}</span>
                </div>
                <input 
                    type="range"
                    min={0}
                    max={1000}
                    step={25}
                    value={maxPriceInput}
                    onChange={handlePriceSliderChange}
                    className='w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-950 dark:accent-stone-100' 
                />
                <div className='flex justify-between text-stone-400 text-[10px] mt-2 font-light'>
                    <span>$0</span>
                    <span>$1000</span>
                </div>
            </div>

            {/* Color filter */}
            <div className='mb-6'>
                <label className='block text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3'>Color Palette</label>
                <div className='flex flex-wrap gap-2'>
                    {colors.map((color) => (
                        <button
                            key={color} 
                            type="button"
                            onClick={() => handleColorClick(color)}
                            className={`px-3 py-1.5 rounded-xl border text-xs tracking-wider transition-all cursor-pointer ${
                                filters.color === color
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 font-medium shadow-sm"
                                    : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                            }`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
            </div>

            {/* Size Filter */}  
            <div className='mb-6'>
                <label className='block text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3'>Size</label>
                <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => handleCheckboxToggle("size", size)}
                            className={`py-2 rounded-xl text-xs font-mono transition-all text-center cursor-pointer ${
                                filters.size.includes(size)
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 font-semibold shadow-sm"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>       

            {/* Material Filter */}  
            <div className='mb-6'>
                <label className='block text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3'>Material Craft</label> 
                <div className="space-y-2">
                    {materials.map((material) => (
                        <label key={material} className='flex items-center space-x-3 cursor-pointer text-xs group'>
                            <input 
                                type="checkbox"
                                checked={filters.material.includes(material)}
                                onChange={() => handleCheckboxToggle("material", material)}
                                className='h-4 w-4 rounded text-stone-950 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 cursor-pointer' 
                            />
                            <span className={`tracking-wide transition-colors ${filters.material.includes(material) ? "text-stone-950 dark:text-stone-100 font-medium" : "text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200"}`}>{material}</span>
                        </label>
                    ))}
                </div>
            </div> 

            {/* Brands Filter */}  
            <div className='mb-2'>
                <label className='block text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3'>Brand Atelier</label> 
                <div className="space-y-2">
                    {brands.map((brand) => (
                        <label key={brand} className='flex items-center space-x-3 cursor-pointer text-xs group'>
                            <input 
                                type="checkbox"
                                checked={filters.brand.includes(brand)}
                                onChange={() => handleCheckboxToggle("brand", brand)}
                                className='h-4 w-4 rounded text-stone-950 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 cursor-pointer' 
                            />
                            <span className={`tracking-wide transition-colors ${filters.brand.includes(brand) ? "text-stone-950 dark:text-stone-100 font-medium" : "text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200"}`}>{brand}</span>
                        </label>
                    ))}
                </div>
            </div> 
        </div>
    );
};

export default FilterSidebar;