"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Rating from "@/components/ui/ratings";

interface FeedbackData {
  id: number;
  image: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
}

interface FeedbackProps {
  feedback: FeedbackData;
}

const Feedback = ({ feedback }: FeedbackProps) => {
  return (
    <Link
      href={`/feedbaks/${feedback.id}`}
      key={feedback.id}
      className="flex 2xl:p-4 p-3 py-4 items-start 2xl:gap-4 gap-2 group hover:bg-gray-50 *:transition-all *:duration-200 *:ease-in-out"
    >
      <Avatar className="2xl:size-14 size-12">
        <AvatarImage src={feedback.image} alt="user avatar" />
        <AvatarFallback>
          {feedback.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold text-sm line-clamp-1">
          {feedback.name}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-gray-500 text-sm line-clamp-1">{feedback.role}</p>
          <Rating value={feedback.rating} onChange={() => {}} />
        </div>
        <div className="text-gray-400 text-xs line-clamp-2">
          {feedback.comment}
        </div>
      </div>
    </Link>
  );
};

export { Feedback };
export type { FeedbackData };