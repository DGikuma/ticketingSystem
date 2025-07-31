import React from 'react';
import {
  CogIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface Props {
  theme: 'light' | 'dark';
}

const icons = [
  CogIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
];

// 🌞 Light Mode Palette
const lightPalette = [
  'text-blue-500',
  'text-pink-500',
  'text-yellow-400',
  'text-green-500',
  'text-purple-500',
  'text-cyan-500',
  'text-orange-400',
];


// 🌙 Dark Mode Palette (more vibrant & opaque)
const darkPalette = [
  'text-blue-300/50',
  'text-pink-300/50',
  'text-yellow-200/50',
  'text-green-300/50',
  'text-purple-300/50',
  'text-cyan-300/50',
  'text-orange-200/50',
];

const AnimatedBackground: React.FC<Props> = ({ theme }) => {
  const bubbles = Array.from({ length: 18 }).map((_, i) => {
    const Icon = icons[i % icons.length];
    const size = Math.floor(Math.random() * 20) + 28; // 28–48px
    const duration = Math.random() * 8 + 6; // 6–14s
    const delay = Math.random() * 4;
    const startX = Math.random() * 100;
    const endY = -20;

    const colorClass =
      theme === 'dark'
        ? darkPalette[i % darkPalette.length]
        : lightPalette[i % lightPalette.length];

    return (
      <motion.div
        key={i}
        initial={{ y: '100vh', x: `${startX}%`, opacity: 0.5 }}
        animate={{ y: `${endY}vh`, opacity: 0 }}
        whileHover={{ scale: 1.2 }} // Optional hover effect
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
        className="absolute group"
        style={{ left: `${startX}%` }}
      >
        <Icon
          className={`${colorClass} transition-transform duration-300`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            filter: theme === 'dark' ? 'blur(0.5px)' : 'none',
          }}
        />
      </motion.div>
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {bubbles}
    </div>
  );
};

export default AnimatedBackground;
