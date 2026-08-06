import { Product } from '@/src/types/product'
import ProductListItem from './ProductListItem';
interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            productInfo={product}
          />
        ))}
      </div>
    </div>
  )
}
