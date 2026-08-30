import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${
        isError
          ? 'bg-red-50 border-red-200 text-red-600'
          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
