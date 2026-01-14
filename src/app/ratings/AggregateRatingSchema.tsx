import { DEFAULT_SETTINGS } from '@/lib/firestore-models';

interface Props {
  avg: number;
  total: number;
}

export default function AggregateRatingSchema({ avg, total }: Props) {
  if (!total) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: DEFAULT_SETTINGS.businessName,
    url: DEFAULT_SETTINGS.canonicalUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: total.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}