// NotificationViewMore

"use client";

import clsx from "clsx";

interface NotificationViewMoreProps {
  clickLabel: string;
  handleViewMore: () => void;
}

const NotificationViewMore = ({
  clickLabel,
  handleViewMore,
}: NotificationViewMoreProps) => {
  return (
    <div
      onClick={handleViewMore}
      className={clsx(
        "hover:bg-gray-100 rounded-none cursor-pointer p-3 flex justify-center border-t text-gray-700 select-none text-xs",
        {}
      )}
    >
      <h1>{clickLabel}</h1>
    </div>
  );
};

export default NotificationViewMore;
