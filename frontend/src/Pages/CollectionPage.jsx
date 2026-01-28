import { useEffect, useRef, useState } from 'react'
import { FaFilter } from "react-icons/fa";
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';

const CollectionPage = () => {

  const [products, setProducts] = useState([])
  const sidebarRef = useRef(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  }

  // ✅ FIXED EFFECT
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, []) // run once


    useEffect(() => {
        setTimeout(() => {
            const fetchedProducts = [
                {
                  _id: 1,
                  name: "Product 1",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=3" }]
              },
              {
                  _id: 2,
                  name: "Product 2",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=4" }]
              },
              {
                  _id: 3,
                  name: "Product 3",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=5" }]
              },
              {
                  _id: 4,
                  name: "Product 4",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=6" }]
              } , 
                {
                  _id: 5,
                  name: "Product 5",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=7" }]
              },
              {
                  _id: 6,
                  name: "Product 6",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=8" }]
              },
              {
                  _id: 7,
                  name: "Product 7",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=9" }]
              },
              {
                  _id: 8,
                  name: "Product 8",
                  price: 100,
                  images: [{ url: "https://picsum.photos/500/500?random=10" }]
              }  
        ]; setProducts(fetchedProducts)
        }, 1000)
    }, [])


return (
    <div className='flex flex-col lg:flex-row relative'>

      {/* Mobile Filter Button */}
      <button
        onClick={toggleSidebar}
        className='lg:hidden border p-2 flex justify-center items-center'
      >
        <FaFilter className='mr-2' /> Filters
      </button>


      {/* Overlay (click outside closes) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}


      {/* Filter Sidebar */}
      <div
  ref={sidebarRef}
  className={`
    fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto
    lg:translate-x-0 lg:static
    transition-transform duration-300
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
  >
  
        <FilterSidebar />
      </div>
        <div className='flex-roww p-4'>
          <h2 className='text-2xl uppercase mb-4'>All Collection</h2>

          {/* Sort Options */}
          <SortOptions />

           {/* Product Grid */}
           <ProductGrid products={products}/>
        </div>
    </div>
  )
}

export default CollectionPage