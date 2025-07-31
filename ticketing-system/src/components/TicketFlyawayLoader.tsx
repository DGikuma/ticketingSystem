import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import ticketLoader from '../assets/ticket-loader.json';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm">
      <Player
        autoplay
        loop
        src={ticketLoader}
        style={{ height: '400px', width: '400px' }}
        speed={1}
        keepLastFrame={false}
      />

      <div className="flex items-center space-x-2 mt-6">
        <span className="w-4 h-4 rounded-full animate-bounce [animation-delay:0s] 
          ring-2 ring-red-400 bg-white/20 backdrop-blur-sm" />
        <span className="w-4 h-4 rounded-full animate-bounce [animation-delay:0.1s] 
          ring-2 ring-orange-400 bg-white/20 backdrop-blur-sm" />
        <span className="w-4 h-4 rounded-full animate-bounce [animation-delay:0.2s] 
          ring-2 ring-yellow-400 bg-white/20 backdrop-blur-sm" />
        <span className="w-4 h-4 rounded-full animate-bounce [animation-delay:0.3s] 
          ring-2 ring-green-400 bg-white/20 backdrop-blur-sm" />
        <span className="w-4 h-4 rounded-full animate-bounce [animation-delay:0.4s] 
          ring-2 ring-sky-400 bg-white/20 backdrop-blur-sm" />
      </div>
    </div>
  );
};

export default Loader;
