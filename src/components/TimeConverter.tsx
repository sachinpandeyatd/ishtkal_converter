import React, { useState, useEffect, ChangeEvent } from 'react';
import { DateTime } from 'luxon';
import { IshtkaalData, IshtkaalSegment } from '../utils/types';
import { findCurrentIshtkaal} from '../utils/calculations';
import { formatTime } from '../utils/timeUtils';
import { FaSearch, FaInfoCircle } from 'react-icons/fa';
import {getSegmentInfo}  from './IshtkaalDisplay';

interface TimeConverterProps {
  ishtkaalData: IshtkaalData;
  selectedDate: DateTime; // Changed prop name
}

// Pass selectedDate prop
const TimeConverter: React.FC<TimeConverterProps> = ({ ishtkaalData, selectedDate }) => {
  const [inputTime, setInputTime] = useState<string>('');
  const [dateTimeToCheck, setDateTimeToCheck] = useState<DateTime | null>(null); // Renamed state
  const [resultSegment, setResultSegment] = useState<IshtkaalSegment | null>(null);

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputTime(event.target.value);
  };

  // Effect to check the entered time against the selected date's Ishtkaals
  useEffect(() => {
    if (inputTime && selectedDate && selectedDate.isValid && ishtkaalData) {
      const [hours, minutes] = inputTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        try {
           // Combine the selected time with the date part of selectedDate
          const dt = selectedDate.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
          setDateTimeToCheck(dt); // Store the full DateTime being checked
          const segment = findCurrentIshtkaal(dt, ishtkaalData);
          setResultSegment(segment);
        } catch (error) {
            console.error("Error setting date/time for check:", error);
            setDateTimeToCheck(null);
            setResultSegment(null);
        }
      } else {
        setDateTimeToCheck(null);
        setResultSegment(null);
      }
    } else {
      // Clear results if input/date/data is invalid or missing
      setDateTimeToCheck(null);
      setResultSegment(null);
    }
  }, [inputTime, selectedDate, ishtkaalData]); // Depend on inputTime, selectedDate, and ishtkaalData

  const segmentInfo = resultSegment ? getSegmentInfo(resultSegment.name) : null;

  return (
    <div className="w-full max-w-md p-6 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl shadow-lg animation-fade-in order-1"> {/* Use Tailwind 'order' if needed within flex/grid */}
      <h2 className="text-xl font-devanagari font-semibold mb-4 text-center text-divine-blue dark:text-divine-lotus">
        समय अन्वेषकः (Time Lookup)
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <label htmlFor="time-input" className="font-medium whitespace-nowrap">
          समयः प्रविशतु (Enter Time):
        </label>
        <input
          id="time-input"
          type="time"
          value={inputTime}
          onChange={handleTimeChange}
          className="p-2 border border-divine-saffron/50 dark:border-divine-gold/50 rounded bg-white/50 dark:bg-black/30 focus:ring-1 focus:ring-divine-saffron dark:focus:ring-divine-gold outline-none w-full sm:w-auto"
        />
         <FaSearch className="text-xl text-divine-saffron dark:text-divine-gold hidden sm:block" />
      </div>

      {/* Show results only when a valid time has been processed */}
      {dateTimeToCheck && dateTimeToCheck.isValid && (
        <div className="mt-4 p-4 border border-dashed border-divine-blue/50 dark:border-divine-lotus/50 rounded-lg text-center bg-white/20 dark:bg-black/10">
          {resultSegment ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                 <span className="text-xl">{segmentInfo?.icon || <FaInfoCircle />}</span>
                 <p className="font-semibold font-devanagari">{resultSegment.name}</p>
              </div>
              <p className="text-sm italic text-gray-700 dark:text-gray-300">
                 {segmentInfo?.suggestion || "विशेषसूचना नास्ति। (No specific info.)"}
              </p>
               <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                ({formatTime(resultSegment.start)} - {formatTime(resultSegment.end)})
              </p>
            </>
          ) : (
            // Check if dateTimeToCheck is valid before formatting
            <p className="text-gray-600 dark:text-gray-400">
              {dateTimeToCheck.isValid ? formatTime(dateTimeToCheck) : inputTime} सामान्यसमये पतति। (Falls in General Time.)
            </p>
          )}
        </div>
      )}
       {!dateTimeToCheck && inputTime && (
           <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2">अमान्यः समयः। (Invalid time format.)</p>
       )}
    </div>
  );
};

export default TimeConverter;