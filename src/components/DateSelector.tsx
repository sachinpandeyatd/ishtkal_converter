import React, { ChangeEvent } from 'react';
import { DateTime } from 'luxon';
import { FaCalendarAlt } from 'react-icons/fa';

interface DateSelectorProps {
  selectedDate: DateTime;
  onDateChange: (newDate: DateTime) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {

  const handleDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const dateString = event.target.value; // YYYY-MM-DD
    if (dateString) {
      const newDate = DateTime.fromISO(dateString); // Parses into local timezone
      if (newDate.isValid) {
        onDateChange(newDate);
      } else {
         console.error("Invalid date string received:", dateString);
      }
    }
  };

  // Format the Luxon DateTime object into YYYY-MM-DD for the input value
  const formattedDate = selectedDate.toISODate();

  return (
    <div className="w-full max-w-md p-4 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-center gap-4">
       <label htmlFor="date-selector-input" className="font-medium whitespace-nowrap font-devanagari text-lg text-divine-blue dark:text-divine-lotus flex items-center gap-2">
          <FaCalendarAlt />
          दिनांकः (Date):
       </label>
       <input
        id="date-selector-input"
        type="date"
        value={formattedDate || ''} // Handle potential null on initial load if needed
        onChange={handleDateInputChange}
        className="p-2 border border-divine-saffron/50 dark:border-divine-gold/50 rounded bg-white/50 dark:bg-black/30 focus:ring-1 focus:ring-divine-saffron dark:focus:ring-divine-gold outline-none w-full sm:w-auto text-center"
      />
    </div>
  );
};

export default DateSelector;