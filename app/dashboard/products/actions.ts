'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function shortId() {
  return crypto.randomUUID().slice(0, 8)
}

/**
 * Sanitize file names to avoid encoding issues in URLs.
 */
function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '')
}

/* -------------------------------------------------------------------------- */
/*                               CREATE PRODUCT                               */
/* -------------------------------------------------------------------------- */
export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  /* ----------------------------- AUTHENTICATION ---------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  /* ----------------------------- GET VENDOR -------------------------------- */
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (vendorError || !vendor) {
    redirect('/dashboard/onboarding/vendor')
  }

  /* ----------------------------- FORM DATA --------------------------------- */
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const price = Number(formData.get('price') || 0)
  const stock = Number(formData.get('stock') || 0)
  const min_order = Math.max(1, Number(formData.get('min_order') || 1))
  const category_id = String(formData.get('category_id') || '').trim()

  if (!name || !category_id) {
    redirect('/dashboard/products/new?message=Name and category are required')
  }

  const slug = `${generateSlug(name)}-${shortId()}`

  /* ----------------------------- INSERT PRODUCT ---------------------------- */
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      vendor_id: vendor.id,
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      min_order,
      status: 'active',
    })
    .select()
    .single()

  if (error || !product) {
    redirect(
      `/dashboard/products/new?message=${encodeURIComponent(
        error?.message || 'Failed to create product'
      )}`
    )
  }

  /* ----------------------------- UPLOAD IMAGES ----------------------------- */
  const images = formData.getAll('images') as File[]
  let isPrimary = true

  for (const image of images) {
    if (image && image.size > 0) {
      const sanitizedName = sanitizeFileName(image.name)
      const filePath = `${product.id}/${shortId()}-${sanitizedName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false,
          contentType: image.type,
        })

      if (!uploadError) {
        // Store only the relative path for consistency
        await supabase.from('product_images').insert({
          product_id: product.id,
          image_url: filePath,
          is_primary: isPrimary,
        })

        isPrimary = false
      }
    }
  }

  redirect('/dashboard/products?message=Product created successfully')
}

/* -------------------------------------------------------------------------- */
/*                               UPDATE PRODUCT                               */
/* -------------------------------------------------------------------------- */
export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const price = Number(formData.get('price') || 0)
  const stock = Number(formData.get('stock') || 0)
  const min_order = Math.max(1, Number(formData.get('min_order') || 1))
  const category_id = String(formData.get('category_id') || '').trim()

  if (!name || !category_id) {
    redirect(
      `/dashboard/products/${id}/edit?message=Name and category are required`
    )
  }

  const slug = `${generateSlug(name)}-${shortId()}`

  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug,
      description,
      price,
      stock,
      min_order,
      category_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    redirect(
      `/dashboard/products/${id}/edit?message=${encodeURIComponent(
        error.message
      )}`
    )
  }

  redirect('/dashboard/products?message=Product updated successfully')
}

/* -------------------------------------------------------------------------- */
/*                               DELETE PRODUCT                               */
/* -------------------------------------------------------------------------- */
export async function deleteProduct(id: string) {
  const supabase = await createClient()

  /* --------------------------- DELETE IMAGES FIRST ------------------------- */
  const { data: images } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id)

  if (images && images.length > 0) {
    const paths = images
      .map((img) => img.image_url)
      .filter((path): path is string => Boolean(path))

    if (paths.length > 0) {
      await supabase.storage.from('products').remove(paths)
    }
  }

  await supabase.from('product_images').delete().eq('product_id', id)

  /* ----------------------------- DELETE PRODUCT ---------------------------- */
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    redirect(
      `/dashboard/products?message=${encodeURIComponent(
        error.message || 'Failed to delete product'
      )}`
    )
  }

  redirect('/dashboard/products?message=Product deleted successfully')
}