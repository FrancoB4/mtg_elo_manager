import React from 'react';
// import { Link } from 'react-router-dom';
import { TopPlayersSection } from '../components/TopPlayersSection';
// import { TournamentCard } from '../components/TournamentCard';
import { StatisticsDisplay } from '../components/StatisticsDisplay';
// import { DeckCard } from '../components/DeckCard';
import { useAuth } from '../hooks/authHook';
import { useStatistics } from '../hooks/useStatistics';
// import { mockTournaments, mockDecks } from '../data/mockData';

export const HomePage: React.FC = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const { statistics, loading: statsLoading, error: statsError } = useStatistics();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-xl text-gray-600">Cargando MTG Elo Manager...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Message */}
                {isAuthenticated && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-indigo-900">
                                    ¡Bienvenido de nuevo, {user?.username}!
                                </h3>
                                <p className="text-indigo-700">
                                    Gestiona tus torneos, sigue el ranking de jugadores y mantén el control de tu meta local.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guest Welcome Message */}
                {!isAuthenticated && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-4">Bienvenido a MTG Elo Manager</h2>
                            <p className="text-xl mb-6 opacity-90">
                                La plataforma definitiva para gestionar torneos y rankings de Magic: The Gathering
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="mb-12">
                    <StatisticsDisplay 
                        statistics={statistics}
                        loading={statsLoading}
                        error={statsError}
                    />
                </div>

                {/* Top Players - Componente embebido */}
                <TopPlayersSection />

                {/* Decks
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Mazos Destacados</h2>
                        {isAuthenticated && (
                            <Link
                                to="/decks"
                                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                            >
                                Ver todos →
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockDecks.map(deck => (
                            <DeckCard key={deck.id} deck={deck} />
                        ))}
                    </div>
                </div> */}

                {/* Recent Tournaments
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Torneos Recientes</h2>
                        {isAuthenticated && (
                            <Link
                                to="/tournaments"
                                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                            >
                                Ver todos →
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockTournaments.map(tournament => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                </div> */}

                {/* Call to Action for Non-Authenticated Users
                {!isAuthenticated && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                ¿Listo para empezar?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Únete a nuestra comunidad y comienza a gestionar tus torneos de Magic: The Gathering 
                                con nuestro sistema de ranking ELO profesional.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link
                                    to="/auth/signup"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
                                >
                                    Crear Cuenta Gratis
                                </Link>
                                <Link
                                    to="/rankings"
                                    className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-md font-medium transition-colors"
                                >
                                    Ver Rankings
                                </Link>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Quick Actions for Authenticated Users
                {isAuthenticated && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                to="/tournaments/create"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Crear Torneo</p>
                                    <p className="text-sm text-gray-500">Organiza un nuevo evento</p>
                                </div>
                            </Link>

                            <Link
                                to="/players/register"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Registrar Jugador</p>
                                    <p className="text-sm text-gray-500">Añadir nuevo participante</p>
                                </div>
                            </Link>

                            <Link
                                to="/matches/record"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Registrar Partida</p>
                                    <p className="text-sm text-gray-500">Anotar resultado</p>
                                </div>
                            </Link>

                            <Link
                                to="/rankings"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Ver Rankings</p>
                                    <p className="text-sm text-gray-500">Tabla de posiciones</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};