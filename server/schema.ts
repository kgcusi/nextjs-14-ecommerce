import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  serial,
  real,
  index,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

export const RoleEnum = pgEnum('roles', ['user', 'admin'])

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
  twoFactorEnabled: boolean('twoFactorEnabled').default(false),
  role: RoleEnum('role').default('user'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const emailTokens = pgTable(
  'email_token',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    email: text('email').notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.id, verificationToken.token],
    }),
  }),
)

export const passwordResetTokens = pgTable(
  'password_reset_token',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    email: text('email').notNull(),
  },
  (resetToken) => ({
    compositePk: primaryKey({
      columns: [resetToken.id, resetToken.token],
    }),
  }),
)

export const twoFactorTokens = pgTable(
  'two_factor_token',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    email: text('email').notNull(),
    userID: text('userID').references(() => users.id, { onDelete: 'cascade' }),
  },
  (twoFactorToken) => ({
    compositePk: primaryKey({
      columns: [twoFactorToken.id, twoFactorToken.token],
    }),
  }),
)

export const products = pgTable('product', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  image: text('image'),
})

export const productVariants = pgTable('product_variant', {
  id: serial('id').primaryKey(),
  color: text('color').notNull(),
  productType: text('productType').notNull(),
  updated: timestamp('updated').defaultNow(),
  productId: serial('productId')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
})

export const variantImages = pgTable('variant_image', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  size: real('size').notNull(),
  name: text('name').notNull(),
  order: real('order').notNull(),
  variantId: serial('variantId')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
})

export const variantTags = pgTable('variant_tag', {
  id: serial('id').primaryKey(),
  tag: text('tag').notNull(),
  variantId: serial('variantId')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
})

export const productRelations = relations(products, ({ many }) => ({
  productVariants: many(productVariants, { relationName: 'productVariants' }),
  reviews: many(reviews, { relationName: 'reviews' }),
}))

export const productVariantRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
      relationName: 'productVariants',
    }),
    variantImages: many(variantImages, {
      relationName: 'variantImages',
    }),
    variantTags: many(variantTags, {
      relationName: 'variantTags',
    }),
  }),
)

export const variantImagesRelations = relations(variantImages, ({ one }) => ({
  productVariant: one(productVariants, {
    fields: [variantImages.variantId],
    references: [productVariants.id],
    relationName: 'variantImages',
  }),
}))

export const variantTagsRelations = relations(variantTags, ({ one }) => ({
  productVariant: one(productVariants, {
    fields: [variantTags.variantId],
    references: [productVariants.id],
    relationName: 'variantTags',
  }),
}))

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    rating: real('rating').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: serial('productId')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    comment: text('comment').notNull(),
    created: timestamp('created').defaultNow(),
  },
  (table) => {
    return {
      productIdx: index('productIdx').on(table.productId),
      userIdx: index('userIdx').on(table.userId),
    }
  },
)

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
    relationName: 'user_reviews',
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
    relationName: 'reviews',
  }),
}))

export const userRelations = relations(users, ({ many }) => ({
  reviews: many(reviews, {
    relationName: 'user_reviews',
  }),
  orders: many(orders, {
    relationName: 'user_orders',
  }),
}))

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  total: real('total').notNull(),
  status: text('status').notNull(),
  created: timestamp('created').defaultNow(),
  receiptUrl: text('receiptUrl'),
})

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
    relationName: 'user_orders',
  }),
  orderProducts: many(orderProduct, {
    relationName: 'orderProducts',
  }),
}))

export const orderProduct = pgTable('order_product', {
  id: serial('id').primaryKey(),
  quantity: integer('quantity').notNull(),
  productVariantId: serial('productVariantId')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
  productId: serial('productId')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
})
