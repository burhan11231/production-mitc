import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number; // e.g., 4.3, 4.8, 5
  size?: number;  // Icon size in px
}

export default function StarRating({ rating, size = 20 }: StarRatingProps) {
  // Ensure rating is valid
  const safeRating = Math.max(0, Math.min(5, rating));
  
  return (
    <div 
      className="flex gap-1" 
      role="img" 
      aria-label={`${safeRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        // Calculate fill percentage for this specific star
        // Example: rating 4.3
        // star 4: (4.3 >= 4) -> 100%
        // star 5: (4.3 >= 4) is true, but we need partial.
        // Logic:
        // If rating >= starIndex : 100% full
        // If rating < starIndex - 1 : 0% full
        // If rating is between (starIndex - 1) and starIndex : Calculate decimal
        
        let percent = 0;
        
        if (safeRating >= starIndex) {
          percent = 100;
        } else if (safeRating > starIndex - 1) {
          percent = (safeRating - (starIndex - 1)) * 100;
        }

        return (
          <div key={starIndex} className="relative inline-block">
            {/* 1. Background (Empty/Gray) Star */}
            <FaStar className="text-gray-200" size={size} />

            {/* 2. Foreground (Filled/Yellow) Star - Clipped via Width */}
            <div
              className="absolute top-0 left-0 overflow-hidden text-yellow-400"
              style={{ width: `${percent}%` }}
            >
              <FaStar size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
}