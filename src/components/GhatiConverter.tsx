import React, { useState, useEffect, ChangeEvent } from 'react';
import { DateTime } from 'luxon';
import { IshtkaalData } from '../utils/types'; // Need IshtkaalData for sunrise
import { convertToGhatiPalVipal, GhatiTime } from '../utils/calculations';
import { FaSyncAlt } from 'react-icons/fa';

interface GhatiConverterProps {
    // ishtkaalData might be null while loading
    ishtkaalData: IshtkaalData | null;
    selectedDate: DateTime;
}

const GhatiConverter: React.FC<GhatiConverterProps> = ({ ishtkaalData, selectedDate }) => {
    const [inputTime, setInputTime] = useState<string>(''); // HH:mm:ss format
    const [ghatiResult, setGhatiResult] = useState<GhatiTime | null>(null);
    const [targetDateTime, setTargetDateTime] = useState<DateTime | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Set default input time to current time on initial load or when date changes
    useEffect(() => {
        setInputTime(DateTime.now().toFormat('HH:mm:ss'));
        setGhatiResult(null); // Clear previous results on date change
        setTargetDateTime(null);
        setError(null);
    }, [selectedDate]);

    const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputTime(event.target.value);
        // Optionally clear results immediately when user types
        // setGhatiResult(null);
        // setTargetDateTime(null);
        // setError(null);
    };

    const handleConvert = () => {
        setError(null);
        setGhatiResult(null);
        setTargetDateTime(null);

        // 1. Validate necessary data (sunrise time must be available)
        if (!ishtkaalData || !ishtkaalData.sunrise || !ishtkaalData.sunrise.start || !ishtkaalData.sunrise.start.isValid) {
            setError("सूर्योदयस्य समयः आवश्यकः। गणनां प्रतीक्ष्यताम्। (Sunrise time required. Please wait for calculation.)");
            return;
        }
        if (!selectedDate || !selectedDate.isValid) {
            setError("मान्यः दिनांकः आवश्यकः। (Valid date is required.)");
            return;
        }

        // 2. Parse the input time string
        const timeParts = inputTime.split(':').map(Number);
        // Allow HH:MM format as well, defaulting seconds to 0
        const hours = timeParts[0];
        const minutes = timeParts[1];
        const seconds = timeParts[2] || 0; // Default seconds to 0 if not provided

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            setError("अमान्यः समयः प्रारूपः (HH:mm अथवा HH:mm:ss)। (Invalid time format (HH:mm or HH:mm:ss).)");
            return;
        }

        try {
            // 3. Create the target DateTime object using the selected date and input time
            const targetDt = selectedDate.set({ hour: hours, minute: minutes, second: seconds, millisecond: 0 });
            if (!targetDt.isValid) {
                setError("निर्मितः समयः अमान्यः। (Constructed time is invalid.)");
                return;
            }
            setTargetDateTime(targetDt); // Store the exact time being converted for display

            // 4. Get the sunrise time for the selected date
            const sunriseTime = ishtkaalData.sunrise.start;

            // 5. Perform the conversion
            const result = convertToGhatiPalVipal(targetDt, sunriseTime);

            // 6. Update state with the result or handle errors
            if (result) {
                setGhatiResult(result);
            } else {
                // convertToGhatiPalVipal returns null on invalid input dates, already handled
                setError("गणनायां त्रुटिः। (Error during conversion.)");
            }

        } catch (err) {
            console.error("Ghati conversion error:", err);
            setError("अज्ञाता त्रुटिः। (Unknown error.)");
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-gradient-to-br from-white/60 to-divine-saffron/30 dark:from-black/40 dark:to-divine-gold/40 backdrop-blur-md rounded-xl shadow-lg animation-fade-in order-1"> {/* Ensure this is first visually */}
            <h2 className="text-xl font-devanagari font-semibold mb-4 text-center text-divine-maroon dark:text-divine-pink">
                समय ➔ घटी-पल-विपल परिवर्तक
            </h2>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
                 (Time to Ghati-Pal-Vipal Converter)
             </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <label htmlFor="ghati-time-input" className="font-medium whitespace-nowrap">
                    समयः (HH:mm:ss):
                </label>
                <input
                    id="ghati-time-input"
                    type="time" // Standard time input
                    step="1" // Allow seconds input
                    value={inputTime}
                    onChange={handleTimeChange}
                    className="p-2 border border-divine-saffron/50 dark:border-divine-gold/50 rounded bg-white/50 dark:bg-black/30 focus:ring-1 focus:ring-divine-saffron dark:focus:ring-divine-gold outline-none w-full sm:w-auto flex-grow"
                />
                <button
                    onClick={handleConvert}
                    // Disable button if sunrise data isn't loaded yet
                    disabled={!ishtkaalData || !ishtkaalData.sunrise?.start?.isValid}
                    className="px-4 py-2 bg-divine-saffron text-white dark:bg-divine-gold dark:text-dark-bg rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title={!ishtkaalData?.sunrise?.start?.isValid ? "सूर्योदयस्य प्रतीक्षा कुरु (Waiting for sunrise data)" : "परिवर्तयतु (Convert)"}
                >
                    <FaSyncAlt /> Convert
                </button>
            </div>

            {error && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center mt-2">{error}</p>
            )}

            {/* Display Result */}
            {ghatiResult && targetDateTime && (
                <div className="mt-4 p-4 border border-dashed border-divine-blue/50 dark:border-divine-lotus/50 rounded-lg text-center bg-white/20 dark:bg-black/10">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {/* Show the time that was converted */}
                        {targetDateTime.toLocaleString(DateTime.TIME_WITH_SECONDS)} =
                    </p>
                    {/* Display Ghati : Pal : Vipal */}
                    <p className="text-2xl font-semibold font-mono text-divine-blue dark:text-divine-lotus tracking-wider">
                        {String(ghatiResult.ghati).padStart(2, '0')}<span className="text-sm font-devanagari font-normal"> घटी</span> : {' '}
                        {String(ghatiResult.pal).padStart(2, '0')}<span className="text-sm font-devanagari font-normal"> पल</span> : {' '}
                        {String(ghatiResult.vipal).padStart(2, '0')}<span className="text-sm font-devanagari font-normal"> विपल</span>
                    </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        (Ghati : Pal : Vipal)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {/* Clarify it's since the sunrise of the selected date */}
                        {`सूर्योदयात् आरभ्य (${ishtkaalData?.sunrise?.start?.toLocaleString(DateTime.TIME_SIMPLE) || '?'})`}
                        <br/>
                        {`(Since Sunrise at ${ishtkaalData?.sunrise?.start?.toLocaleString(DateTime.TIME_SIMPLE) || '?'})`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default GhatiConverter;