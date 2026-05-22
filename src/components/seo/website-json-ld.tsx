import { buildWebsiteJsonLd } from '@/lib/seo/site'

export function WebsiteJsonLd() {
  const data = buildWebsiteJsonLd()
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
