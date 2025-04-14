import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="mt-4 text-center p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg shadow flex items-center justify-center gap-3">
      <FaExclamationTriangle className="text-xl" />
      <div>
        <p className="font-devanagari font-semibold">त्रुटिः!</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;