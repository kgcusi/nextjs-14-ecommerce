'use client'

import { VariantSchema } from '@/types/variant-schema'
import { useFieldArray, useFormContext } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import * as z from 'zod'
import { UploadDropzone } from '@/app/api/uploadthing/upload'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { useState } from 'react'

export default function VariantImages() {
  const { getValues, control, setError } =
    useFormContext<z.infer<typeof VariantSchema>>()

  const { fields, remove, append, update, move } = useFieldArray({
    control,
    name: 'variantImages',
  })

  const [active, setActive] = useState(1)

  return (
    <div>
      <FormField
        control={control}
        name="variantImages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Variant Images</FormLabel>
            <FormControl>
              <UploadDropzone
                className="ut-allowed-content:text-secondary-foreground ut-label:text-primary ut-upload-icon:text-primary/50 hover:bg-primary/10 transition-all duration-500 ease-in-out border-secondary ut-button:bg-primary/75 ut-button:ut-readying:bg-secondary"
                endpoint="variantUploader"
                onUploadError={(error) => {
                  setError('variantImages', {
                    type: 'validate',
                    message: error.message,
                  })
                  return
                }}
                onBeforeUploadBegin={(files) => {
                  files.map((file) => {
                    append({
                      name: file.name,
                      url: URL.createObjectURL(file),
                      size: file.size,
                    })
                  })
                  return files
                }}
                config={{ mode: 'auto' }}
                onClientUploadComplete={(files) => {
                  const images = getValues('variantImages')
                  images.map((field, imgIDX) => {
                    if (field.url.search('blob:') === 0) {
                      const image = files.find((img) => img.name === field.name)
                      if (image) {
                        update(imgIDX, {
                          url: image.url,
                          name: image.name,
                          size: image.size,
                          key: image.key,
                        })
                      }
                    }
                  })
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Reorder.Group
            as="tbody"
            values={fields}
            onReorder={(e) => {
              const activeElement = fields[active]
              e.map((item, index) => {
                if (item === activeElement) {
                  move(active, index)
                  setActive(index)
                  return
                }
                return
              })
            }}
          >
            {fields.map((field, index) => (
              <Reorder.Item
                as="tr"
                key={field.id}
                id={field.id}
                onDragStart={() => setActive(index)}
                value={field}
                className={cn(
                  field.url.search('blob:') === 0
                    ? 'animate-pulse transition-all'
                    : '',
                  'text-sm font-bold text-muted-foreground hover:text-primary',
                )}
              >
                <TableCell>{index}</TableCell>
                <TableCell>{field.name}</TableCell>
                <TableCell>
                  {(field.size / (1024 * 1024)).toFixed(2)} MB
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Image
                      src={field.url}
                      alt={field.name}
                      className="rounded-md"
                      width={72}
                      height={48}
                      priority
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    className="scale-75"
                    variant={'ghost'}
                    onClick={(e) => {
                      e.preventDefault()
                      remove(index)
                    }}
                  >
                    <TrashIcon className="h-4" />
                  </Button>
                </TableCell>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Table>
      </div>
    </div>
  )
}
