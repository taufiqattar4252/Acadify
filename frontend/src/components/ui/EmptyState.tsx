import React from 'react';

export const EmptyState = ({ title, description, icon: Icon, action }: { title: string; description?: string; icon?: React.ElementType; action?: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-xl bg-muted">
      {Icon && <div className="p-3 bg-white rounded-full shadow-sm mb-4"><Icon className="w-8 h-8 text-muted-foreground" /></div>}
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
