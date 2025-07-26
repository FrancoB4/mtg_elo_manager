import React from 'react';
import { BsGrid, BsTable } from 'react-icons/bs';

export type ViewType = 'cards' | 'table';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  // Helper function to render icons with proper typing
  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string = "w-4 h-4") => {
    return React.createElement(IconComponent, { className });
  };

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
            onClick={() => onViewChange('table')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentView === 'table'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Vista de tabla"
        >
            {renderIcon(BsTable)}
            <span className="hidden sm:inline">Tabla</span>
        </button>

        <button
            onClick={() => onViewChange('cards')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentView === 'cards'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Vista de tarjetas"
        >
            {renderIcon(BsGrid)}
            <span className="hidden sm:inline">Tarjetas</span>
        </button>
      
      
    </div>
  );
};