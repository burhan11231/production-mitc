interface ReviewSchemaItem {
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: any;
}

interface Props {
  reviews: ReviewSchemaItem[];
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
          return r.createdAt?.toDate
            ? r.createdAt.toDate().toISOString().split('T')[0]
            : new Date(r.createdAt).toISOString().split('T')[0];
        } catch {
          return undefined;
        }
      })(),
      reviewBody: r.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
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