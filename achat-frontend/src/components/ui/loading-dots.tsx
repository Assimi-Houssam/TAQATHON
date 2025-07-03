import { motion } from "framer-motion";

export const LoadingDots = () => (
  <motion.span
    animate={{ opacity: [0, 1, 0] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
  >
    ...
  </motion.span>
);
