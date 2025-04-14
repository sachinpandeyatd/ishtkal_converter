import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LocationCoords } from '../utils/types';
import { FaSearchLocation, FaSpinner } from 'react-icons/fa';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string; // Note: API returns strings
  lon: string; // Note: API returns strings
}

interface LocationSearchProps {
  onLocationSelect: (coords: LocationCoords) => void;
}

// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 500); // Debounce API calls

  const fetchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 3) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
    }

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    try {
      const response = await axios.get<NominatimResult[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      setResults(response.data);
    } catch (err) {
      console.error("Nominatim API error:", err);
      setError("स्थानं अन्वेष्टुं न शक्नोमि। पुनः प्रयतताम्। (Could not search location. Try again.)");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
      fetchLocations(debouncedQuery);
  }, [debouncedQuery, fetchLocations]);


  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationSelect({ latitude: lat, longitude: lon });
      setQuery(''); // Clear input after selection
      setResults([]);
    } else {
        setError("अमान्याः निर्देशांकाः प्राप्ताः। (Invalid coordinates received.)")
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center border border-divine-saffron/50 dark:border-divine-gold/50 rounded bg-white/50 dark:bg-black/30 pr-2">
           <FaSearchLocation className="text-lg text-gray-500 mx-2"/>
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="नगरस्य नाम लिखतु... (Enter city name...)"
            className="p-2 flex-grow bg-transparent focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
            />
            {loading && <FaSpinner className="animate-spin text-divine-saffron dark:text-divine-gold" />}
      </div>


      {error && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>}

      {results.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="px-4 py-2 hover:bg-divine-saffron/20 dark:hover:bg-divine-gold/20 cursor-pointer text-sm"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;