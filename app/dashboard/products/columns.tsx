'use client'

import { ColumnDef, Row } from '@tanstack/react-table'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, PlusCircle, PlusCircleIcon } from 'lucide-react'
import { deleteProduct } from '@/server/actions/delete-product'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { VariantsWithImagesTags } from '@/lib/infer-type'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ProductVariant } from './product-variant'

export type Product = {
  id: number
  title: string
  price: number
  variants: VariantsWithImagesTags[]
  image: string
}

const ActionCell = ({ row }: { row: Row<Product> }) => {
  const product = row.original

  const { execute, status } = useAction(deleteProduct, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.dismiss()
        toast.success('Product deleted successfully')
      }
      if (data?.error) {
        toast.dismiss()
        toast.error(data.error)
      }
    },
    onError: (error) => {
      console.log(error)
    },
    onExecute: () => {
      toast.loading('Deleting product...')
    },
  })

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer dark:focus:bg-primary focus:bg-primary/50">
          <Link href={`/dashboard/add-product?id=${product.id}`}>
            Edit Product
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => execute({ id: product.id })}
          className="cursor-pointer dark:focus:bg-destructive focus:bg-destructive/50"
        >
          Delete Product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'variants',
    header: 'Variants',
    cell: ({ row }) => {
      const variants = row.original.variants as VariantsWithImagesTags[]
      return (
        <div className="flex gap-2 items-center">
          {variants.map((variant) => (
            <div key={variant.id} className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ProductVariant
                      productId={variant.id}
                      variant={variant}
                      editMode={true}
                    >
                      <div
                        className="w-5 h-5 rounded-full"
                        key={variant.id}
                        style={{
                          backgroundColor: variant.color,
                        }}
                      />
                    </ProductVariant>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{variant.productType}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <ProductVariant editMode={false} productId={row.original.id}>
                    <PlusCircle className="h-5 w-5" />
                  </ProductVariant>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span>Create new product variant</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.original.price
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price)
      return <span className="text-xs font-medium">{formattedPrice}</span>
    },
  },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.original.image
      const cellTitle = row.original.title
      return (
        <Image
          height={50}
          width={50}
          src={image}
          alt={cellTitle}
          className="rounded"
        />
      )
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ActionCell,
  },
]
