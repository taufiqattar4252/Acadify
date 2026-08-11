import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white rounded-3xl shadow-lumina p-6 ${className}`}>
      {children}
    </div>
  );
};
