import { db } from '@/server'
import { products } from '@/server/schema'
import placeholder from '@/public/placeholder_image.jpg'
import { DataTable } from './data-table'
import { columns } from './columns'

export default async function Products() {
  const products = await db.query.products.findMany({
    with: {
      productVariants: { with: { variantImages: true, variantTags: true } },
    },
    orderBy: (products, { desc }) => [desc(products.id)],
  })
  if (!products) throw new Error('No products found')

  const dataTable = products.map((product) => {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      variants: product.productVariants,
      image: placeholder.src,
    }
  })
  if (!dataTable) throw new Error('No data found')

  return (
    <div>
      <DataTable columns={columns} data={dataTable} />
    </div>
  )
}
