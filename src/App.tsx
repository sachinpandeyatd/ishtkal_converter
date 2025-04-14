import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import LocationHandler from './components/LocationHandler';
// import DateSelector from './components/DateSelector'; // Import DateSelector
import IshtkaalDisplay from './components/IshtkaalDisplay';
// import TimeConverter from './components/TimeConverter';
// import GhatiConverter from './components/GhatiConverter';
import LiveDisplay from './components/LiveDisplay';
import AudioToggle from './components/AudioToggle';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { IshtkaalData, LocationCoords } from './utils/types';
import { calculateAllIshtkaals} from './utils/calculations';
import { DateTime } from 'luxon';
import DateGhatiConverter from './components/DateGhatiConverter';

function App() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  // Rename currentDate to selectedDate
  const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now());
  const [ishtkaalData, setIshtkaalData] = useState<IshtkaalData | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const previousLocationRef = useRef<LocationCoords | null>(null);

  // Handler for date changes
  const handleDateChange = (newDate: DateTime) => {
      console.log(">>> New Date Selected:", newDate.toISODate());
      setSelectedDate(newDate);
      // Calculation will be triggered by useEffect dependency change
  };

  const handleLocationFound = (coords: LocationCoords) => {
    const isNewReference = previousLocationRef.current !== coords;
    const areValuesDifferent = !previousLocationRef.current ||
                               previousLocationRef.current.latitude !== coords.latitude ||
                               previousLocationRef.current.longitude !== coords.longitude;
    console.log(`>>> handleLocationFound called. Coords: (${coords.latitude}, ${coords.longitude}). Is New Reference: ${isNewReference}. Are Values Different: ${areValuesDifferent}.`);

    if (areValuesDifferent) {
        setLocationError(null); // <<< CLEAR locationError HERE
        setLocation(coords);
        setIsLocationLoading(false);
    } else {
        console.log(">>> handleLocationFound: Coordinates received are same as previous. Skipping state update.");
        // Still clear error even if coords are same, because we *have* a location now
        setLocationError(null); // <<< CLEAR locationError HERE TOO
        setIsLocationLoading(false); // Still finish loading state
    }
    previousLocationRef.current = coords;
};

  const handleLocationError = (message: string) => {
      setLocationError(message);
      setLocation(null);
      setIshtkaalData(null);
      setIsLocationLoading(false);
      setIsCalculating(false);
  };

  // Main calculation effect
  useEffect(() => {
      // Effect depends on location AND selectedDate now
      if (location) {
          console.log(`>>> EFFECT START: Location/Date change detected. Setting isCalculating=true. Clearing appError. Date: ${selectedDate.toISODate()}`);
          setIsCalculating(true);
          setAppError(null);
          setIshtkaalData(null); // Clear previous data before calculating new

          const calculationTimeout = setTimeout(() => {
              console.log('>>> setTimeout: Entering TRY block for calculation.');
              try {
                  // Use selectedDate for calculations
                  const data = calculateAllIshtkaals(selectedDate, location.latitude, location.longitude);
                  console.log('>>> TRY block: Calculation successful. Result data:', data);
                  setIshtkaalData(data);
              } catch (err: any) {
                  console.error('>>> CATCH BLOCK ENTERED! Error:', err);
                  setAppError(`क्षम्यताम्, गणनायां त्रुटिः अभवत्। (${err.message || 'Calculation failed.'})`);
                  setIshtkaalData(null);
              } finally {
                  console.log('>>> FINALLY block: Setting isCalculating=false.');
                  setIsCalculating(false);
              }
          }, 50); // Small delay

          return () => {
              console.log('>>> EFFECT CLEANUP: Clearing timeout.');
              clearTimeout(calculationTimeout);
          };
      } else {
          console.log('>>> EFFECT START: Location is null. Clearing data/state.');
          setIshtkaalData(null);
          setIsCalculating(false);
          setAppError(null);
      }
      // Update dependency array
  }, [location, selectedDate]);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-500 font-sans relative overflow-x-hidden">
        <Header />
        <AudioToggle audioSrc="/audio/sitar.mp3" />

        <main className="w-full max-w-4xl mt-8 flex flex-col gap-8 items-center z-10">

            {/* --- Location Handling --- */}
            <LocationHandler
                onLocationFound={handleLocationFound}
                onLocationError={handleLocationError}
                isLoading={isLocationLoading}
            />
            {/* Display location error ONLY if location is null AND locationError is set */}
            {locationError && !location && (
              <ErrorMessage message={locationError} />
            )}

            {/* --- Date Selector (Only if location is available and no location error) --- */}
            {location && !locationError && (
              <DateGhatiConverter
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  ishtkaalData={ishtkaalData} // Pass data needed for conversion
              />
            )}

            {/* --- Calculation Status Display (Only if we have a location) --- */}
            {location && isCalculating && ( // Condition changed: only show if location exists
              <LoadingSpinner message="इष्टकालः गण्यते... (Calculating Ishtkaals...)" />
            )}
            {/* Show app (calculation) error only if NOT calculating */}
            {appError && !isCalculating && (
              <ErrorMessage message={appError} />
            )}

            {/* --- Main Content Area --- */}
            {/* Render ONLY when location exists, no errors exist, and not loading/calculating */}
            {location && !locationError && !appError && !isLocationLoading && !isCalculating && ishtkaalData && (
              <>
                <LiveDisplay ishtkaalData={ishtkaalData} />
                <IshtkaalDisplay ishtkaalData={ishtkaalData} selectedDate={selectedDate} />
              </>
            )}
        </main>

        <footer className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400 z-10">
          <p>© {new Date().getFullYear()} Time to Ishtkaal Converter.</p>
          <p className="font-devanagari mt-1">शुभं भवतु।</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;