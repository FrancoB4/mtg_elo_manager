import React, { useState } from 'react';
import { BsTrophy, BsGrid, BsShieldCheck, BsPersonPlus, BsCheckCircle } from 'react-icons/bs';
import { TournamentsList } from './TournamentsList';
import { AvailableTournaments } from './components/AvailableTournaments';
import { PendingMatches } from './components/PendingMatches';
import { TournamentAdmin } from './components/TournamentAdmin';
import { useRole } from '../../hooks/useRole';

export const TournamentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const { canCreateTournaments } = useRole();

  const tabs = [
    {
      id: 'list',
      name: 'Torneos',
      icon: BsTrophy,
      description: 'Ver todos los torneos disponibles',
    },
    {
      id: 'registration',
      name: 'Inscripciones',
      icon: BsCheckCircle,
      description: 'Anotarse a torneos y cargar resultados',
    },
    {
      id: 'calendar',
      name: 'Calendario',
      icon: BsGrid,
      description: 'Vista de calendario de torneos',
    },
    {
      id: 'statistics',
      name: 'Estadísticas',
      icon: BsShieldCheck,
      description: 'Estadísticas de torneos',
    },
    ...(canCreateTournaments() ? [{
      id: 'admin',
      name: 'Administración',
      icon: BsPersonPlus,
      description: 'Crear y gestionar torneos',
    }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'list':
        return <TournamentsList />;
      case 'registration':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <BsCheckCircle className="mx-auto h-12 w-12 text-blue-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Inscripciones a Torneos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Aquí podrás anotarte a torneos disponibles y cargar resultados de tus partidas.
              </p>
            </div>
            
            {/* Grid con dos columnas */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Torneos disponibles */}
              <div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <BsTrophy className="h-5 w-5 mr-2 text-blue-500" />
                    Torneos Disponibles
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Torneos abiertos para inscripciones
                  </p>
                  <AvailableTournaments />
                </div>
              </div>
              
              {/* Partidas pendientes */}
              <div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <BsCheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Mis Partidas
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Cargar resultados de partidas pendientes
                  </p>
                  <PendingMatches />
                </div>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-12">
            <BsGrid className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Vista de calendario próximamente
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              La vista de calendario de torneos estará disponible pronto.
            </p>
          </div>
        );
      case 'admin':
        return <TournamentAdmin />;
      case 'statistics':
        return (
          <div className="text-center py-12">
            <BsShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Estadísticas próximamente
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Las estadísticas de torneos estarán disponibles pronto.
            </p>
          </div>
        );
      default:
        return <TournamentsList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                    title={tab.description}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
