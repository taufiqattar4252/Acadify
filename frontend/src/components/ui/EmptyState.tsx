import React from 'react';

export const EmptyState = ({ title, description, icon: Icon, action }: { title: string; description?: string; icon?: React.ElementType; action?: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
      {Icon && <div className="p-3 bg-white rounded-full shadow-sm mb-4"><Icon className="w-8 h-8 text-gray-400" /></div>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
