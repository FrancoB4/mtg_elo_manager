import React from 'react';

interface ErrorMessageProps {
  message: string;
  title?: string;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  title,
  variant = 'error',
  onRetry,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: '⚠️',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'ℹ️',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'error':
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: '❌',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}>
      <div className={`max-w-md w-full rounded-lg border p-6 ${styles.container}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`text-2xl ${styles.iconColor}`}>
              {styles.icon}
            </span>
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-lg font-medium ${styles.titleColor} mb-2`}>
                {title}
              </h3>
            )}
            <p className={`text-sm ${styles.textColor} leading-relaxed`}>
              {message}
            </p>
            {onRetry && (
              <div className="mt-4">
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${styles.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 transition-colors duration-200`}
                >
                  🔄 Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Versión inline para usar dentro de otros componentes
export const InlineErrorMessage: React.FC<Omit<ErrorMessageProps, 'className'> & { className?: string }> = ({ 
  message, 
  title,
  variant = 'error',
  onRetry,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: '⚠️',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'ℹ️',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'error':
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: '❌',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className={`text-lg ${styles.iconColor}`}>
            {styles.icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className={`text-sm font-medium ${styles.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${styles.textColor}`}>
            {message}
          </p>
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded ${styles.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 transition-colors duration-200`}
              >
                🔄 Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;