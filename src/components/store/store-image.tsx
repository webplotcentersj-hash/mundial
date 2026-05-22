import Image, { type ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src: string
  alt: string
}

/** Imagen del store: WebP local o URL remota (Supabase) vía next/image. */
export function StoreImage({ src, alt, sizes, loading, ...rest }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes ?? '(max-width: 640px) 45vw, 180px'}
      loading={rest.priority ? undefined : loading ?? 'lazy'}
      {...rest}
    />
  )
}
