import { useState, useCallback } from 'react';
import { LocationCoords } from '../utils/types';

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCoordinates(null); // Clear previous coordinates

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        let message = 'Unknown error occurred.';
        switch (err.code) {
            case err.PERMISSION_DENIED:
                message = "स्थानस्य अनुमतिः न दत्ता। (Location permission denied.)";
                break;
            case err.POSITION_UNAVAILABLE:
                message = "स्थानसूचना अनुपलब्धा। (Location information is unavailable.)";
                break;
            case err.TIMEOUT:
                message = "स्थानं प्राप्तुं समयः अतीतः। (The request to get user location timed out.)";
                break;
        }
        setError(message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 } // Options
    );
  }, []);


  return { coordinates, error, loading, requestLocation };
};