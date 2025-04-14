import React from 'react';
import { DateTime } from 'luxon';
import { IshtkaalData, IshtkaalSegment } from '../utils/types';
import { formatTime } from '../utils/timeUtils'; // Create this helper
import { FaSun, FaMoon, FaStar, FaRegClock, FaBan } from 'react-icons/fa'; // Example icons

interface IshtkaalDisplayProps {
  ishtkaalData: IshtkaalData;
  selectedDate: DateTime;
}

// Helper to determine icon and suggestion
export const getSegmentInfo = (name: string): { icon: React.ReactNode; suggestion?: string; auspicious?: boolean } => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rahukaal')) return { icon: <FaBan className="text-red-500" />, suggestion: "महत्वपूर्णकार्याणि परिहरन्तु। (Avoid important tasks.)", auspicious: false };
    if (lowerName.includes('yamaganda')) return { icon: <FaBan className="text-orange-500" />, suggestion: "प्रायः अशुभः। (Generally inauspicious.)", auspicious: false };
    if (lowerName.includes('gulika')) return { icon: <FaRegClock className="text-yellow-600" />, suggestion: "मध्यमः, पुनरावृत्तिः सम्भवति। (Average, repetition possible.)", auspicious: undefined }; // Neutral or debated
    if (lowerName.includes('abhijit')) return { icon: <FaStar className="text-divine-gold" />, suggestion: "अत्यन्तं शुभः मुहूर्तः। (Very auspicious muhurta.)", auspicious: true };
    if (lowerName.includes('brahma')) return { icon: <FaSun className="text-divine-pink" />, suggestion: "ध्यानार्थं, आध्यात्मिकसाधनायै च उत्तमः। (Excellent for meditation and spiritual practices.)", auspicious: true };
    if (lowerName.includes('pradosh')) return { icon: <FaMoon className="text-divine-blue dark:text-indigo-300" />, suggestion: "शिवपूजनार्थं शुभः। (Auspicious for Shiva worship.)", auspicious: true };
    return { icon: <FaRegClock className="text-gray-500" />, auspicious: undefined }; // Default
}

const IshtkaalDisplay: React.FC<IshtkaalDisplayProps> = ({ ishtkaalData, selectedDate }) => {
  const segments = [
    ishtkaalData.brahmaMuhurat,
    ishtkaalData.sunrise, // Display sunrise time itself
    ishtkaalData.rahukaal,
    ishtkaalData.yamaganda,
    ishtkaalData.gulikaKaal,
    ishtkaalData.abhijitMuhurat,
    ishtkaalData.sunset, // Display sunset time itself
    ishtkaalData.pradoshKaal,
    // Add other calculated segments here
  ].filter(Boolean) as IshtkaalSegment[]; // Filter out potentially null segments


  // Sort segments by start time for display order
  segments.sort((a, b) => a.start.toMillis() - b.start.toMillis());
  const displayDate = selectedDate.toLocaleString(DateTime.DATE_FULL);
  
  return (
    <div className="w-full p-6 bg-gradient-to-br from-white/50 to-divine-pink/20 dark:from-black/30 dark:to-divine-blue/30 backdrop-blur-md rounded-xl shadow-lg order-3"> {/* Use Tailwind 'order' if needed */}
       {/* Make title dynamic */}
      <h2 className="text-xl font-devanagari font-semibold mb-1 text-center text-divine-maroon dark:text-divine-lotus">
        इष्टकालः ({displayDate})
      </h2>
       <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
        Ishtkaals for {displayDate}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-divine-saffron/50 dark:border-divine-gold/50">
              <th className="p-3 text-left font-semibold font-devanagari">कालः/मुहूर्तः</th>
              <th className="p-3 text-center font-semibold font-devanagari">आरम्भः</th>
              <th className="p-3 text-center font-semibold font-devanagari">अन्तः</th>
              <th className="p-3 text-left font-semibold font-devanagari">स्थितिः</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => {
              const info = getSegmentInfo(segment.name);
              let rowClass = "border-b border-divine-saffron/20 dark:border-divine-gold/20";
              if (info.auspicious === true) rowClass += " bg-green-500/10 dark:bg-green-400/10";
              if (info.auspicious === false) rowClass += " bg-red-500/10 dark:bg-red-400/10";

              return (
                <tr key={segment.name} className={rowClass}>
                  <td className="p-3 flex items-center gap-2">
                    {info.icon}
                    <span className="font-medium">{segment.name}</span>
                  </td>
                  <td className="p-3 text-center">{formatTime(segment.start)}</td>
                  <td className="p-3 text-center">{formatTime(segment.end)}</td>
                  <td className={`p-3 text-xs ${info.auspicious === true ? 'text-green-600 dark:text-green-300' : info.auspicious === false ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {info.suggestion || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">सर्वे समयाः भवदीयक्षेत्रीयानुसारं सन्ति। (All times are based on your local time.)</p>
    </div>
  );
};

export default IshtkaalDisplay;