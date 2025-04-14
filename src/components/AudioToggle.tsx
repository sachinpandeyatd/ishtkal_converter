import React, { useState, useRef, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface AudioToggleProps {
  audioSrc: string;
}

const AudioToggle: React.FC<AudioToggleProps> = ({ audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
         // Autoplay might be blocked by the browser initially
         console.warn("Audio play failed:", error);
         // Maybe show a message asking the user to click again
      });
    }
    // State will be updated by the event listeners below
  };

   // Effect to sync state with actual audio element state
   useEffect(() => {
     const audioElement = audioRef.current;
     if (!audioElement) return;

     const handlePlay = () => setIsPlaying(true);
     const handlePause = () => setIsPlaying(false);

     audioElement.addEventListener('play', handlePlay);
     audioElement.addEventListener('pause', handlePause);
     audioElement.addEventListener('ended', handlePause); // Also pause on end if not looping

     // Initial check in case browser restored state
     setIsPlaying(!audioElement.paused);

     return () => {
       audioElement.removeEventListener('play', handlePlay);
       audioElement.removeEventListener('pause', handlePause);
       audioElement.removeEventListener('ended', handlePause);
     };
   }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="absolute top-4 right-16 z-50"> {/* Adjust positioning as needed */}
      <audio ref={audioRef} src={audioSrc} loop preload="metadata"></audio>
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full text-xl bg-divine-lotus/30 dark:bg-divine-blue/50 text-divine-maroon dark:text-divine-pink hover:bg-divine-lotus/50 dark:hover:bg-divine-blue/70 transition-all duration-300"
        aria-label={isPlaying ? 'Mute background music' : 'Play background music'}
      >
        {isPlaying ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>
    </div>
  );
};

export default AudioToggle;