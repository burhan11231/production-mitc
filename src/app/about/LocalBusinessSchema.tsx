// src/app/about/LocalBusinessSchema.tsx

export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',

    name: 'MITC – Mateen IT Corp',
    url: 'https://mitck.netlify.app',

    logo:
      'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',

    image:
      'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',

    description:
      "MITC (Mateen IT Corp) is a trusted laptop showroom in Srinagar, Kashmir, offering transparent laptop sales, diagnostics, and upgrades since 2013.",

    telephone: '+91 98765 43210',
    email: 'info@mitc.com',

    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Gaw Kadal, Maisuma, Srinagar, J&K - 190001',
      addressLocality: 'Srinagar',
      addressRegion: 'Jammu and Kashmir',
      addressCountry: 'IN',
    },

    sameAs: [
      'https://instagram.com',
      'https://facebook.com',
      'https://twitter.com',
      'https://linkedin.com',
      'https://youtube.com',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}