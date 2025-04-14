import React, { useState, useEffect } from 'react';
import { DateTime, Duration } from 'luxon';
import { IshtkaalData, IshtkaalSegment } from '../utils/types';
import {getSegmentInfo}  from './IshtkaalDisplay';
import { findCurrentIshtkaal} from '../utils/calculations'; // Assuming getSegmentInfo is moved here or kept in IshtkaalDisplay and imported
import { formatTime, formatDuration } from '../utils/timeUtils';
import { FaRegClock, FaHourglassHalf } from 'react-icons/fa';

interface LiveDisplayProps {
  ishtkaalData: IshtkaalData;
}

// Make sure getSegmentInfo is accessible, e.g., export it from calculations.ts
// Or redefine it here if preferred
// import { getSegmentInfo } from './IshtkaalDisplay'; // Alternative import

const LiveDisplay: React.FC<LiveDisplayProps> = ({ ishtkaalData }) => {
  const [currentTime, setCurrentTime] = useState(DateTime.now());
  const [currentSegment, setCurrentSegment] = useState<IshtkaalSegment | null>(null);
  const [timeToNext, setTimeToNext] = useState<Duration | null>(null);

  useEffect(() => {
    const updateLiveTime = () => {
      const now = DateTime.now();
      setCurrentTime(now);

      if (!ishtkaalData) return;

      const segment = findCurrentIshtkaal(now, ishtkaalData);
      setCurrentSegment(segment);

      if (segment) {
        const nextEventTime = segment.end; // Time until current segment ends
        if (nextEventTime > now) {
          setTimeToNext(nextEventTime.diff(now));
        } else {
          setTimeToNext(null); // Segment already ended? Or find actual next segment start
        }
      } else {
        // If no specific segment, find time until next sunrise or sunset?
        // This logic can be complex, maybe just show null or time to next major event
        setTimeToNext(null);
      }
    };

    updateLiveTime(); // Initial update
    const intervalId = setInterval(updateLiveTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [ishtkaalData]); // Rerun effect if ishtkaalData changes

  const segmentInfo = currentSegment ? getSegmentInfo(currentSegment.name) : null;
  const segmentName = currentSegment ? currentSegment.name : "सामान्य समय (General Time)";
  const segmentSuggestion = segmentInfo?.suggestion || "शुभमस्तु। (Be well.)";
  const segmentIcon = segmentInfo?.icon || <FaRegClock className="text-gray-500" />;

  // --- Optional Sun Path ---
  // Calculate day progress (simple version)
  let dayProgress = 0;
  if (ishtkaalData.sunrise && ishtkaalData.sunset && ishtkaalData.dayDuration.as('milliseconds') > 0) {
    const timeSinceSunrise = currentTime.diff(ishtkaalData.sunrise.start);
    dayProgress = Math.max(0, Math.min(100, (timeSinceSunrise.as('milliseconds') / ishtkaalData.dayDuration.as('milliseconds')) * 100));
  }
   // More complex: A curved SVG path with a sun icon moving along it based on dayProgress

  return (
    <div className="w-full max-w-md p-6 bg-gradient-to-tr from-white/60 to-divine-saffron/20 dark:from-black/40 dark:to-divine-gold/30 backdrop-blur-md rounded-xl shadow-lg text-center animation-fade-in">
      <h2 className="text-xl font-devanagari font-semibold mb-4 text-divine-maroon dark:text-divine-pink">
        वर्तमान स्थितिः (Current Status)
      </h2>
      <div className="mb-4">
        <p className="text-3xl font-semibold text-divine-blue dark:text-divine-lotus">
          {formatTime(currentTime)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentTime.toLocaleString(DateTime.DATE_FULL)}
        </p>
      </div>

      <div className="my-6 p-4 border border-divine-saffron/50 dark:border-divine-gold/50 rounded-lg bg-white/30 dark:bg-black/20">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">{segmentIcon}</span>
          <p className="text-lg font-medium font-devanagari">{segmentName}</p>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
          {segmentSuggestion}
        </p>
        {timeToNext && timeToNext.as('milliseconds') > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-1">
             <FaHourglassHalf /> समाप्तौ (Ends in): {formatDuration(timeToNext)}
          </p>
        )}
      </div>

       {/* Optional Sun Progress Bar */}
       <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-divine-saffron to-divine-gold h-2.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${dayProgress}%` }}
          ></div>
       </div>
       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">दिनस्य प्रगतिः (Day Progress)</p>

    </div>
  );
};

export default LiveDisplay;