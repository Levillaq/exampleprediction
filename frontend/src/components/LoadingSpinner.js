import React from 'react';

const LoadingSpinner = ({ size = "medium", message = "Загрузка..." }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div 
        className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`}
      />
      <p className="text-purple-200 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 