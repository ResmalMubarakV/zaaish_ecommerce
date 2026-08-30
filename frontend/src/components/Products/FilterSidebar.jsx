import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const COLOR_MAP = {
    black: '#000000',
    white: '#FFFFFF',
    cream: '#FFFDD0',
    charcoal: '#36454F',
    navy: '#000080',
    gray: '#808080',
    grey: '#808080',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    pink: '#FFC0CB',
    beige: '#F5F5DC',
    olive: '#808000',
    sand: '#C2B280',
    khaki: '#F0E68C',
    champagne: '#F7E7CE',
    ivory: '#FFFFF0',
    bronze: '#CD7F32',
    gold: '#FFD700',
    silver: '#C0C0C0',
    stone: '#877F7D'
};

const EMPTY_FILTERS = {
    category: '',
    gender: '',
    color: '',
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 0
};

const getPriceCeiling = (maxPrice) => {
    const price = Number(maxPrice);
    if (!Number.isFinite(price) || price <= 0) return 1000;
    return Math.ceil(price / 25) * 25;
};

const FilterSidebar = ({ options = {}, onFiltersChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const priceCeiling = useMemo(() => getPriceCeiling(options.priceRange?.max), [options.priceRange?.max]);
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS, maxPrice: priceCeiling });
    const [maxPriceInput, setMaxPriceInput] = useState(priceCeiling);

    useEffect(() => {
        const parsedMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : priceCeiling;
        const maxPrice = Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0 ? Math.min(parsedMaxPrice, priceCeiling) : priceCeiling;

        setFilters({
            category: searchParams.get('category') || '',
            gender: searchParams.get('gender') || '',
            color: searchParams.get('color') || '',
            size: searchParams.get('size')?.split(',').filter(Boolean) || [],
            material: searchParams.get('material')?.split(',').filter(Boolean) || [],
            brand: searchParams.get('brand')?.split(',').filter(Boolean) || [],
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
            maxPrice
        });
        setMaxPriceInput(maxPrice);
    }, [searchParams, priceCeiling]);

    const updateURLParams = (updatedFilters) => {
        const params = new URLSearchParams();
        const searchQuery = searchParams.get('search');
        const sortQuery = searchParams.get('sortBy');

        if (searchQuery) params.set('search', searchQuery);
        if (sortQuery) params.set('sortBy', sortQuery);
        params.set('page', '1');
        params.set('limit', '12');

        if (updatedFilters.category) params.set('category', updatedFilters.category);
        if (updatedFilters.gender) params.set('gender', updatedFilters.gender);
        if (updatedFilters.color) params.set('color', updatedFilters.color);
        if (updatedFilters.size.length) params.set('size', updatedFilters.size.join(','));
        if (updatedFilters.material.length) params.set('material', updatedFilters.material.join(','));
        if (updatedFilters.brand.length) params.set('brand', updatedFilters.brand.join(','));
        if (updatedFilters.minPrice > 0) params.set('minPrice', String(updatedFilters.minPrice));
        if (updatedFilters.maxPrice < priceCeiling) params.set('maxPrice', String(updatedFilters.maxPrice));

        setSearchParams(params);
        onFiltersChange?.();
    };

    const updateFilter = (field, value) => {
        const nextFilters = { ...filters, [field]: filters[field] === value ? '' : value };
        setFilters(nextFilters);
        updateURLParams(nextFilters);
    };

    const toggleListFilter = (field, value) => {
        const currentValues = filters[field] || [];
        const nextValues = currentValues.includes(value)
            ? currentValues.filter((item) => item !== value)
            : [...currentValues, value];
        const nextFilters = { ...filters, [field]: nextValues };
        setFilters(nextFilters);
        updateURLParams(nextFilters);
    };

    const handlePriceChange = (event) => {
        const maxPrice = Number(event.target.value);
        const nextFilters = { ...filters, maxPrice };
        setMaxPriceInput(maxPrice);
        setFilters(nextFilters);
        updateURLParams(nextFilters);
    };

    const handleResetFilters = () => {
        const resetFilters = { ...EMPTY_FILTERS, maxPrice: priceCeiling };
        setFilters(resetFilters);
        setMaxPriceInput(priceCeiling);

        const params = new URLSearchParams();
        const searchQuery = searchParams.get('search');
        if (searchQuery) params.set('search', searchQuery);
        params.set('page', '1');
        params.set('limit', '12');
        setSearchParams(params);
        onFiltersChange?.();
    };

    const renderListFilter = (label, field, values) => {
        if (!values?.length) return null;

        const countSubKey = field === 'material' ? 'materials' : 'brands';

        return (
            <section className="mb-7">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">{label}</p>
                <div className="space-y-2">
                    {values.map((value) => {
                        const count = options.counts?.[countSubKey]?.[value] || 0;
                        return (
                            <label key={value} className="group flex cursor-pointer items-center gap-3 rounded-lg py-1 text-xs">
                                <input type="checkbox" checked={filters[field].includes(value)} onChange={() => toggleListFilter(field, value)} className="h-4 w-4 cursor-pointer rounded border-stone-300 text-stone-950 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                                <span className={`transition-colors flex items-center gap-1.5 ${filters[field].includes(value) ? 'font-medium text-stone-950 dark:text-stone-100' : 'text-stone-600 group-hover:text-stone-900 dark:text-stone-400 dark:group-hover:text-stone-200'}`}>
                                    {value}
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-light">({count})</span>
                                </span>
                            </label>
                        );
                    })}
                </div>
            </section>
        );
    };

    return (
        <div className="rounded-3xl border border-stone-200/80 bg-white p-5 text-stone-900 shadow-sm transition-colors sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
            <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                <div>
                    <h3 className="font-serif text-sm font-medium uppercase tracking-[0.2em]">Refine selection</h3>
                    <p className="mt-1 text-[11px] text-stone-400">Options match the available catalogue.</p>
                </div>
                <button type="button" onClick={handleResetFilters} className="rounded-lg bg-stone-100 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-stone-700 transition hover:bg-stone-950 hover:text-white cursor-pointer dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-100 dark:hover:text-stone-950">
                    Reset
                </button>
            </div>

            {options.categories?.length > 0 && (
                <section className="mb-7">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">Category</p>
                    <div className="space-y-1.5">
                        {options.categories.map((category) => (
                            <button key={category} type="button" onClick={() => updateFilter('category', category)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all cursor-pointer ${filters.category === category ? 'bg-stone-950 font-medium text-white shadow-sm dark:bg-stone-100 dark:text-stone-950' : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800/60'}`}>
                                <span className="flex items-center gap-1.5">
                                    {category}
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-light">({options.counts?.categories?.[category] || 0})</span>
                                </span>
                                {filters.category === category && <span aria-hidden="true">✓</span>}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {options.genders?.length > 0 && (
                <section className="mb-7">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">Gender</p>
                    <div className="grid grid-cols-3 gap-2">
                        {options.genders.map((gender) => (
                            <button key={gender} type="button" onClick={() => updateFilter('gender', gender)} className={`min-h-10 rounded-xl px-2 text-xs font-medium transition-all cursor-pointer flex flex-col justify-center items-center ${filters.gender === gender ? 'bg-stone-950 text-white shadow-sm dark:bg-stone-100 dark:text-stone-950' : 'border border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800'}`}>
                                <span>{gender}</span>
                                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-light">({options.counts?.genders?.[gender] || 0})</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-7">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">Maximum price</p>
                    <span className="font-serif text-xs font-medium text-stone-900 dark:text-stone-100">₹{maxPriceInput}</span>
                </div>
                <input type="range" min="0" max={priceCeiling} step="25" value={maxPriceInput} onChange={handlePriceChange} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-stone-950 dark:bg-stone-800 dark:accent-stone-100" />
                <div className="mt-2 flex justify-between text-[10px] font-light text-stone-400"><span>₹0</span><span>₹{priceCeiling}</span></div>
            </section>

            {options.colors?.length > 0 && (
                <section className="mb-7">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">Colour</p>
                    <div className="flex flex-wrap gap-2.5">
                        {options.colors.map((color) => {
                            const colorKey = color.toLowerCase();
                            const hex = COLOR_MAP[colorKey] || colorKey;
                            const isSelected = filters.color === color;
                            const isWhite = colorKey === 'white' || colorKey === 'cream' || colorKey === 'ivory';
                            const count = options.counts?.colors?.[color] || 0;

                            return (
                                <button 
                                    key={color} 
                                    type="button" 
                                    onClick={() => updateFilter('color', color)} 
                                    className={`w-7 h-7 rounded-full transition-all cursor-pointer relative flex items-center justify-center border shadow-sm ${
                                        isSelected 
                                            ? 'ring-2 ring-stone-950 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900 scale-110' 
                                            : 'hover:scale-105'
                                    } ${isWhite ? 'border-stone-200 dark:border-stone-700' : 'border-transparent'}`}
                                    style={{ backgroundColor: hex }}
                                    title={`${color} (${count})`}
                                >
                                    {isSelected && (
                                        <span className={`text-[10px] font-bold ${isWhite ? 'text-stone-900' : 'text-white mix-blend-difference'}`}>✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {options.sizes?.length > 0 && (
                <section className="mb-7">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">Size</p>
                    <div className="grid grid-cols-4 gap-2">
                        {options.sizes.map((size) => (
                            <button key={size} type="button" onClick={() => toggleListFilter('size', size)} className={`min-h-10 rounded-xl px-1 text-xs font-medium transition-all cursor-pointer flex flex-col justify-center items-center ${filters.size.includes(size) ? 'bg-stone-950 text-white shadow-sm dark:bg-stone-100 dark:text-stone-950' : 'border border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800'}`}>
                                <span>{size}</span>
                                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-light">({options.counts?.sizes?.[size] || 0})</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {renderListFilter('Material', 'material', options.materials)}
            {renderListFilter('Brand', 'brand', options.brands)}
        </div>
    );
};

export default FilterSidebar;
