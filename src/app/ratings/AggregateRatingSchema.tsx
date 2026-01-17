// src/app/ratings/AggregateRatingSchema.tsx

interface Props {
  avg: number;
  total: number;
}

const BUSINESS_NAME = 'MITC – Mateen IT Corp';
const BUSINESS_URL = 'https://mitck.netlify.app/ratings';

export default function AggregateRatingSchema({ avg, total }: Props) {
  if (!total) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_NAME,
    url: BUSINESS_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: total,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}