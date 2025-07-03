"use client";

import { motion } from "framer-motion";

export interface ExpandedRowContent {
  description: string;
  delivery_date: string;
  delivery_address: string;
  biding_date: string;
  biding_address: string;
}

export function ExpandedRow({ content }: { content: ExpandedRowContent }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="p-6 bg-gray-50 space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Description
          </h3>
          <p className="text-gray-600">{content.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Delivery Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Date:</span>
                <span className="text-gray-700">
                  {formatDate(content.delivery_date)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Address:</span>
                <span className="text-gray-700">{content.delivery_address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Bidding Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Date:</span>
                <span className="text-gray-700">
                  {formatDate(content.biding_date)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Address:</span>
                <span className="text-gray-700">{content.biding_address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 