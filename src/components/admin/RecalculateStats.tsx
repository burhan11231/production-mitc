'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RecalculateStats() {
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
  setLoading(true);
  try {
    await fetch('/api/admin/reviews/recalculate', {
  method: 'POST',
});
    toast.success('Stats recalculated');
    window.location.reload();
  } catch {
    toast.error('Failed to update stats');
  } finally {
    setLoading(false);
  }
};

  return (
    <button
      onClick={handleRecalculate}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {loading ? 'Calculating...' : 'Recalculate Stats'}
    </button>
  );
}