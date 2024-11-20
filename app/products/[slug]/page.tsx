import ProductPick from '@/components/products/product-pick'
import ProductShowCase from '@/components/products/product-show-case'
import ProductType from '@/components/products/product-type'
import Reviews from '@/components/reviews/reviews'
import ReviewsForm from '@/components/reviews/reviews-form'
import Stars from '@/components/reviews/Stars'
import { Separator } from '@/components/ui/separator'
import formatPrice from '@/lib/format-price'
import { getReviewAverage } from '@/lib/review-average'
import { db } from '@/server'
import { productVariants } from '@/server/schema'
import { eq } from 'drizzle-orm'

export async function generateStaticParams() {
  const data = await db.query.productVariants.findMany({
    with: {
      variantImages: true,
      variantTags: true,
      product: true,
    },
    orderBy: (productVariants, { desc }) => [desc(productVariants.id)],
  })

  if (data) {
    const slugId = data.map((variant) => {
      slug: variant.id.toString()
    })
    return slugId
  }

  return []
}

export default async function Page({ params }: { params: { slug: string } }) {
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, Number(params.slug)),
    with: {
      product: {
        with: {
          reviews: true,
          productVariants: { with: { variantImages: true, variantTags: true } },
        },
      },
    },
  })

  if (variant) {
    const reviewAvg = getReviewAverage(
      variant?.product.reviews.map((review) => review.rating),
    )

    return (
      <main>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">
          <div className="flex-1">
            <ProductShowCase variants={variant.product.productVariants} />
          </div>
          <div className="flex flex-col flex-1">
            <h2 className="text-2xl font-bold">{variant?.product.title}</h2>
            <div>
              <ProductType variants={variant.product.productVariants} />
              <Stars
                rating={reviewAvg}
                totalReviews={variant.product.reviews.length}
              />
            </div>
            <Separator className="my-2" />
            <p className="text-2xl py-2    font-medium">
              {formatPrice(variant.product.price)}
            </p>
            <div
              dangerouslySetInnerHTML={{ __html: variant.product.description }}
            ></div>
            <p className="text-secondary-foreground font-medium my-2">
              Available Colors
            </p>
            <div className="flex gap-4">
              {variant.product.productVariants.map((productVariant) => (
                <ProductPick
                  key={productVariant.id}
                  id={productVariant.id}
                  color={productVariant.color}
                  productType={productVariant.productType}
                  title={variant.product.title}
                  price={variant.product.price}
                  productId={variant.product.id}
                  image={productVariant.variantImages[0].url}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <Reviews productId={variant.product.id} />
        </div>
      </main>
    )
  }
}
