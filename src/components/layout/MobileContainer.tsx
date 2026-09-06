import React from 'react';

export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white sm:bg-slate-900 sm:py-6 flex items-center justify-center">
      {/* Mobile Shell */}
      <div className="w-full sm:max-w-md bg-slate-background min-h-screen sm:min-h-[850px] sm:h-[90vh] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  );
};
