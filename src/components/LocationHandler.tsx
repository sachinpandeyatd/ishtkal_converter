// src/components/LocationHandler.tsx
import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import LocationSearch from './LocationSearch';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage'; // Ensure this is imported
import { LocationCoords } from '../utils/types';
import { FaSearch } from 'react-icons/fa';

interface LocationHandlerProps {
    onLocationFound: (coords: LocationCoords) => void;
    onLocationError: (message: string) => void;
    isLoading: boolean; // This is the parent's isLoading state
}

const LocationHandler: React.FC<LocationHandlerProps> = ({
    onLocationFound,
    onLocationError,
    isLoading, // Received from parent App.tsx
}) => {
    // Use state to track if manual selection succeeded to prevent duplicate errors
    const [manualLocationFound, setManualLocationFound] = useState(false);
    const { coordinates, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
    const [showManual, setShowManual] = useState(false);

    // Auto-request location on mount
    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    // Handle successful auto-geolocation
    useEffect(() => {
        if (coordinates) {
            console.log("LocationHandler: Auto coords found", coordinates);
            onLocationFound(coordinates);
            setShowManual(false); // Hide manual search if auto works
            setManualLocationFound(true); // Mark success
        }
    }, [coordinates, onLocationFound]);

    // Handle initial geolocation error ONLY if manual hasn't already succeeded
    useEffect(() => {
        if (geoError && !manualLocationFound && !coordinates) {
            console.warn("LocationHandler: Initial geoError received:", geoError);
            setShowManual(true); // Show manual input options
            // Only call the parent error handler if we haven't already succeeded manually
            onLocationError("स्वस्थानं न ज्ञातम्। कृपया मानवरूपेण निवेशयन्तु। (Location permission denied or failed. Please enter manually.)");
        }
    }, [geoError, onLocationError, manualLocationFound, coordinates]);

    // Handle successful manual selection
    const handleManualLocationSelect = (coords: LocationCoords) => {
        console.log("LocationHandler: Manual selection successful");
        setManualLocationFound(true); // Mark manual success
        onLocationFound(coords); // Pass coords to App (App will clear locationError)
        setShowManual(false); // Hide manual search input
    }

    return (
        <div className="w-full max-w-md p-6 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-devanagari font-semibold mb-4 text-divine-blue dark:text-divine-lotus">स्थानम् (Location)</h2>

            {/* Show parent's loading indicator OR internal geoLoading */}
            {(isLoading || geoLoading) && !coordinates && !manualLocationFound && <LoadingSpinner message="स्थानं प्राप्नुमः... (Fetching location...)" />}

            {/* Show internal error message ONLY if auto failed and manual hasn't succeeded yet */}
            {geoError && !manualLocationFound && !coordinates && (
                <div className="mb-4">
                    <ErrorMessage message={geoError} />
                    {!showManual && ( /* Button might not be needed if showManual is set above */
                        <button
                            onClick={() => setShowManual(true)}
                            className="mt-2 px-4 py-2 bg-divine-saffron text-white dark:bg-divine-gold dark:text-dark-bg rounded hover:opacity-90 transition flex items-center gap-2 mx-auto"
                        >
                            <FaSearch /> मानवरूपेण अन्वेषणं कुरु (Search Manually)
                        </button>
                    )}
                </div>
            )}

            {/* Show manual search input */}
            {showManual && !manualLocationFound && !coordinates && (
                <LocationSearch onLocationSelect={handleManualLocationSelect} />
            )}

            {/* Show success message once App has coordinates */}
            {/* We rely on App's 'location' state for the final success display */}
            {/* You might not need this block if App handles the display logic */}
            {/* { (coordinates || manualLocationFound) && !showManual && ( ... ) } */}

        </div>
    );
};

export default LocationHandler;