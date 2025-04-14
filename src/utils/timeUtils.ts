import { DateTime, Duration } from 'luxon';

export const formatTime = (date: DateTime): string => {
  if (!date || !date.isValid) return 'N/A';
  // Adjust formatting as needed (e.g., include seconds, AM/PM)
  return date.toLocaleString(DateTime.TIME_SIMPLE); // e.g., 1:30 PM
};

export const formatDuration = (duration: Duration): string => {
    if (!duration || !duration.isValid || duration.as('milliseconds') <= 0) return '00:00:00';
    // Format as HH:MM:SS
    return duration.toFormat('hh:mm:ss');
}