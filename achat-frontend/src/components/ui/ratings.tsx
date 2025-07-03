import { forwardRef } from "react";

type RatingProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: number;
  onChange: (value: number) => void;
};

const Rating = forwardRef<HTMLInputElement, RatingProps>((props, ref) => {
  const { value, onChange, ...rest } = props;

  return (
    <div className="flex">
      <input {...rest} className="hidden" ref={ref} />
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            fill={i < value ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="transparent"
            className={`size-4 ${
              i < value ? "fill-custom-green-900" : "fill-gray-300"
            }`}
            onClick={() => onChange(i === value - 1 ? 0 : i + 1)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        ))}
    </div>
  );
});

Rating.displayName = "Rating";

export default Rating;
