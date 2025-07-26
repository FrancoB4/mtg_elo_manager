import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Cargando...', 
  size = 'lg',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-indigo-600 mx-auto`}></div>
        {message && (
          <p className={`mt-4 ${textSizeClasses[size]} text-gray-600 font-medium`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// También exportar una versión inline para usar dentro de otros componentes
export const InlineSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-indigo-600`}></div>
  );
};

export default LoadingSpinner;