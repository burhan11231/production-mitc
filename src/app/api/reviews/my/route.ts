import { auth } from '@/lib/firebase';

const fetchMyReview = async () => {
  if (!auth.currentUser) {
    setMyReview(null);
    return;
  }

  try {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch('/api/reviews/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      setMyReview(null);
      return;
    }

    const data = await res.json();

    // hide soft-deleted reviews
    if (!data || data.status === 'deleted') {
      setMyReview(null);
      return;
    }

    setMyReview(data);
  } catch (err) {
    console.error('[FETCH_MY_REVIEW]', err);
    setMyReview(null);
  }
};