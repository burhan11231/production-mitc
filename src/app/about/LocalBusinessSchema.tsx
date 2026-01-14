import { DEFAULT_SETTINGS } from '@/lib/firestore-models'

export default function LocalBusinessSchema() {
  const s = DEFAULT_SETTINGS

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: s.businessName,
    image: s.featuredImageUrl,
    logo: s.logoUrl,
    description: s.metaDescription,
    url: s.canonicalUrl,
    telephone: s.primaryPhone,
    email: s.primaryEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.addressText,
      addressLocality: 'Srinagar',
      addressRegion: 'Jammu and Kashmir',
      addressCountry: 'IN',
    },
    sameAs: [
      s.instagram,
      s.facebook,
      s.twitter,
      s.linkedin,
      s.youtube,
    ].filter(Boolean),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}