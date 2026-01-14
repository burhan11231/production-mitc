import { Review } from './types'; // or inline type

interface Props {
  reviews: Review[];
}

export default function ReviewSchema({ reviews }: Props) {
  if (!reviews.length) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MITC – Mateen IT Corp',
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.userName || 'Verified Customer',
      },
      datePublished: (() => {
        try {
          // @ts-ignore
          return r.createdAt?.toDate
            ? r.createdAt.toDate().toISOString().split('T')[0]
            : new Date(r.createdAt as any).toISOString().split('T')[0];
        } catch {
          return undefined;
        }
      })(),
      reviewBody: r.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}