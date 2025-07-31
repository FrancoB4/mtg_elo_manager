import React from 'react';
import { BsCheckCircle, BsExclamationTriangle, BsX } from 'react-icons/bs';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../services/toastService';

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <BsCheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <BsExclamationTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <BsExclamationTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <BsCheckCircle className="h-5 w-5 text-blue-400" />;
      default:
        return <BsCheckCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${getToastStyles()}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-400"
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Cerrar</span>
              <BsX className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={remove}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
