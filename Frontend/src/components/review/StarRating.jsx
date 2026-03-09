import { useState } from "react";

const StarRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 text-2xl">

      {[1,2,3,4,5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer ${
            (hover || value) >= star
              ? "text-yellow-500"
              : "text-gray-300"
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}

    </div>
  );
};

export default StarRating;