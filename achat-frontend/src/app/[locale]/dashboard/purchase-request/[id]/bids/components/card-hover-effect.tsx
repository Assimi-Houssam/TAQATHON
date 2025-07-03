'use client'

import { motion } from 'framer-motion';

export function CardHoverEffect() {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      initial={false}
      whileHover={{
        opacity: 1,
        transition: { duration: 0.3 }
      }}
    />
  );
} 