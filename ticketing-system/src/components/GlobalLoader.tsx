import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { setLoadingRef } from '@/utils/loadingRef'; // ✅ Use correct path

const ticketVariants = {
  initial: { x: '-100vw', rotate: 0, opacity: 0 },
  animate: {
    x: '100vw',
    rotate: [0, 20, -20, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const GlobalLoader = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setLoadingRef({
      start: () => setVisible(true),
      stop: () => setVisible(false),
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <motion.div
        className="relative flex items-center justify-center w-28 h-16 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-yellow-300 dark:to-red-400 shadow-xl rounded-sm border-2 border-white dark:border-gray-900 text-white font-bold text-sm rotate-[-8deg]"
        variants={ticketVariants}
        initial="initial"
        animate="animate"
      >
        🎟️ Ticket
      </motion.div>
    </div>
  );
};

export default GlobalLoader;
