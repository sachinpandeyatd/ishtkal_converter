// src/components/DateGhatiConverter.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { DateTime } from 'luxon';
import { IshtkaalData } from '../utils/types'; // Need IshtkaalData for sunrise
import { convertToGhatiPalVipal, GhatiTime } from '../utils/calculations';
import { FaSyncAlt, FaCalendarAlt } from 'react-icons/fa';

interface DateGhatiConverterProps {
    selectedDate: DateTime;
    onDateChange: (newDate: DateTime) => void;
    // ishtkaalData might be null while loading
    ishtkaalData: IshtkaalData | null;
}

const DateGhatiConverter: React.FC<DateGhatiConverterProps> = ({
    selectedDate,
    onDateChange,
    ishtkaalData,
}) => {
    // State for the time input and conversion result
    const [inputTime, setInputTime] = useState<string>(''); // HH:mm:ss format
    const [ghatiResult, setGhatiResult] = useState<GhatiTime | null>(null);
    const [targetDateTime, setTargetDateTime] = useState<DateTime | null>(null); // Store the exact time converted
    const [error, setError] = useState<string | null>(null);

    // Set default input time to current time when component mounts or selectedDate changes
    useEffect(() => {
        setInputTime(DateTime.now().toFormat('HH:mm:ss'));
        setGhatiResult(null); // Clear previous results
        setTargetDateTime(null);
        setError(null);
    }, [selectedDate]); // Reset time input when the selected date changes

    // Handle date input change (from the date picker)
    const handleDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const dateString = event.target.value; // YYYY-MM-DD
        if (dateString) {
            const newDate = DateTime.fromISO(dateString); // Parses into local timezone
            if (newDate.isValid) {
                onDateChange(newDate); // Call the callback passed from App.tsx
            } else {
                console.error("Invalid date string received:", dateString);
            }
        }
    };

    // Handle time input change
    const handleTimeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputTime(event.target.value);
    };

    // Handle the conversion logic when the button is clicked
    const handleConvert = () => {
        setError(null);
        setGhatiResult(null);
        setTargetDateTime(null);

        if (!ishtkaalData?.sunrise?.start?.isValid) {
            setError("सूर्योदयस्य समयः आवश्यकः। गणनां प्रतीक्ष्यताम्। (Sunrise time required. Please wait for calculation.)");
            return;
        }
        if (!selectedDate?.isValid) {
            setError("मान्यः दिनांकः आवश्यकः। (Valid date is required.)");
            return;
        }

        const timeParts = inputTime.split(':').map(Number);
        const hours = timeParts[0];
        const minutes = timeParts[1];
        const seconds = timeParts[2] || 0;

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            setError("अमान्यः समयः प्रारूपः (HH:mm अथवा HH:mm:ss)। (Invalid time format (HH:mm or HH:mm:ss).)");
            return;
        }

        try {
            const targetDt = selectedDate.set({ hour: hours, minute: minutes, second: seconds, millisecond: 0 });
            if (!targetDt.isValid) {
                setError("निर्मितः समयः अमान्यः। (Constructed time is invalid.)");
                return;
            }
            setTargetDateTime(targetDt);

            const sunriseTime = ishtkaalData.sunrise.start;
            const result = convertToGhatiPalVipal(targetDt, sunriseTime);

            if (result) {
                setGhatiResult(result);
            } else {
                setError("गणनायां त्रुटिः। (Error during conversion.)");
            }

        } catch (err) {
            console.error("Ghati conversion error:", err);
            setError("अज्ञाता त्रुटिः। (Unknown error.)");
        }
    };

    // Format the date for the date input value
    const formattedDate = selectedDate.toISODate();

    return (
        // Single Card combining Date and Ghati Conversion
        <div className="w-full max-w-lg p-6 bg-gradient-to-br from-white/60 to-divine-saffron/30 dark:from-black/40 dark:to-divine-gold/40 backdrop-blur-md rounded-xl shadow-lg animation-fade-in order-1">
             <h2 className="text-xl font-devanagari font-semibold mb-5 text-center text-divine-maroon dark:text-divine-pink">
                 दिनांक चयन & घटी परिवर्तन
             </h2>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                 (Select Date & Convert Time to Ghati)
            </p>

            {/* Date Selection Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <label htmlFor="date-selector-input" className="font-medium whitespace-nowrap text-divine-blue dark:text-divine-lotus flex items-center gap-2">
                    <FaCalendarAlt />
                    दिनांकः (Date):
                </label>
                <input
                    id="date-selector-input"
                    type="date"
                    value={formattedDate || ''}
                    onChange={handleDateInputChange}
                    className="p-2 border border-divine-saffron/50 dark:border-divine-gold/50 rounded bg-white/50 dark:bg-black/30 focus:ring-1 focus:ring-divine-saffron dark:focus:ring-divine-gold outline-none w-full sm:w-auto text-center"
                />
            </div>

             {/* Divider (Optional) */}
             <hr className="border-divine-saffron/30 dark:border-divine-gold/30 my-4" />

            {/* Time Input and Conversion Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <label htmlFor="ghati-time-input" className="font-medium whitespace-nowrap">
                    समयः (HH:mm:ss):
                </label>
                <input
                    id="ghati-time-input"
                    type="time"
                    step="1"
                    value={inputTime}
                    onChange={handleTimeInputChange}
                    className="p-2 border border-divine-saffron/50 dark:border-divine-gold/50 rounded bg-white/50 dark:bg-black/30 focus:ring-1 focus:ring-divine-saffron dark:focus:ring-divine-gold outline-none w-full sm:w-auto flex-grow"
                />
                <button
                    onClick={handleConvert}
                    disabled={!ishtkaalData?.sunrise?.start?.isValid}
                    className="px-4 py-2 bg-divine-saffron text-white dark:bg-divine-gold dark:text-dark-bg rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title={!ishtkaalData?.sunrise?.start?.isValid ? "सूर्योदयस्य प्रतीक्षा कुरु (Waiting for sunrise data)" : "परिवर्तयतु (Convert)"}
                >
                    <FaSyncAlt /> Convert
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center mt-2">{error}</p>
            )}

            {/* Result Display */}
            {ghatiResult && targetDateTime && (
                <div className="mt-4 p-4 border border-dashed border-divine-blue/50 dark:border-divine-lotus/50 rounded-lg text-center bg-white/20 dark:bg-black/10">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {targetDateTime.toLocaleString(DateTime.TIME_WITH_SECONDS)} =
                    </p>
                    <p className="text-2xl font-semibold font-mono text-divine-blue dark:text-divine-lotus tracking-wider">
                        {String(ghatiResult.ghati).padStart(2, '0')}<span className="text-sm font-devanagari font-normal"> घटी</span> : {' '}
                        {String(ghatiResult.pal).padStart(2, '0')}<span className="text-sm font-devanagari font-normal"> पल</span> : {' '}
                        {String(ghatiResult.vipal).padStart(2, '0')}<span className="text-sm font-devanagari font-normal"> विपल</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        (Ghati : Pal : Vipal)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {`सूर्योदयात् आरभ्य (${ishtkaalData?.sunrise?.start?.toLocaleString(DateTime.TIME_SIMPLE) || '?'})`}
                        <br/>
                        {`(Since Sunrise at ${ishtkaalData?.sunrise?.start?.toLocaleString(DateTime.TIME_SIMPLE) || '?'})`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DateGhatiConverter;