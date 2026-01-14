import { DEFAULT_SETTINGS } from '@/lib/firestore-models';

interface Props {
  ratingValue: number;
  reviewCount: number;
}

export default function ReviewAggregateSchema({
  ratingValue,
  reviewCount,
}: Props) {
  if (!reviewCount) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: DEFAULT_SETTINGS.businessName,
    url: DEFAULT_SETTINGS.canonicalUrl,
    image: DEFAULT_SETTINGS.featuredImageUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
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