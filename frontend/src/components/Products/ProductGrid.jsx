import { Link } from "react-router-dom"

const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products && products.map((product) => (
            <Link key={product._id} to={`/product/${product._id}`} className="group block">
                <div className="flex flex-col">
                    <div className="w-full h-[420px] mb-4 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 relative shadow-sm">
                        <img 
                            src={product.images && product.images[0] ? product.images[0].url : "https://picsum.photos/500/500"} 
                            alt={product.images?.[0]?.altText || product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                    </div>
                    <h3 className="text-sm font-serif font-normal text-stone-800 dark:text-stone-200 mb-1 truncate tracking-wide group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors">{product.name}</h3>
                    <p className="text-stone-900 dark:text-stone-100 font-medium text-xs tracking-wider">
                        ${product.currentPrice || product.price}
                    </p>
                </div>
            </Link>
        ))}
    </div>
  )
}

export default ProductGrid;