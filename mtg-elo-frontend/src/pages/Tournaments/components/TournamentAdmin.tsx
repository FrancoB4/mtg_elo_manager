import React, { useState, useEffect } from 'react';
import { BsPersonPlus, BsTrophy, BsX, BsSearch } from 'react-icons/bs';
import tournamentService, { CreateTournamentData } from '../../../services/tournamentService';
import leagueService, { League } from '../../../services/leagueService';
import playersService from '../../../services/playersService';
import { useToast } from '../../../hooks/useToast';
import type { Player } from '../../../types/players';

// Interfaces para el torneo y jugadores
interface TournamentPlayer {
  id: string;
  name: string;
  email?: string;
  playerId: number; // ID del player registrado
}

interface TournamentFormData {
  name: string;
  date: string;
  leagueId: string;
  description: string;
  location: string;
  max_players: number;
  entry_fee: number;
  prize_pool: number;
  format: string;
  start_time: string;
  end_time: string;
}

// Interface para los resultados de búsqueda de jugadores
interface PlayerSearchResult {
  id: number;
  name: string;
  username: string;
  email: string;
}

export const TournamentAdmin: React.FC = () => {
  const { success, error } = useToast();
  
  // Estados para el formulario del torneo
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    date: '',
    leagueId: '',
    description: '',
    location: '',
    max_players: 8,
    entry_fee: 0,
    prize_pool: 0,
    format: 'Standard',
    start_time: '',
    end_time: ''
  });

  // Estados para la gestión de jugadores
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Estados para UI y validación
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  // Cargar ligas al montar el componente
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const leaguesData = await leagueService.getActiveLeagues();
        setLeagues(leaguesData);
      } catch (err) {
        console.error('Error loading leagues:', err);
        error('Error cargando ligas', 'No se pudieron cargar las ligas disponibles');
      } finally {
        setLoadingLeagues(false);
      }
    };

    loadLeagues();
  }, [error]); // Agregar error como dependencia

  // Función de validación
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('El nombre del torneo es requerido');
    }
    
    if (!formData.date) {
      errors.push('La fecha del torneo es requerida');
    }
    
    if (!formData.leagueId) {
      errors.push('Debe seleccionar una liga');
    }
    
    if (formData.max_players < 4) {
      errors.push('El número mínimo de jugadores es 4');
    }
    
    if (formData.max_players > 256) {
      errors.push('El número máximo de jugadores es 256');
    }
    
    if (formData.entry_fee < 0) {
      errors.push('El costo de entrada no puede ser negativo');
    }
    
    if (formData.prize_pool < 0) {
      errors.push('El premio total no puede ser negativo');
    }

    // Validar fecha no sea en el pasado
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('La fecha del torneo no puede ser en el pasado');
    }

    // Validar horarios si ambos están definidos
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        errors.push('La hora de inicio debe ser anterior a la hora de fin');
      }
    }

    if (players.length === 0) {
      errors.push('Debe agregar al menos un jugador al torneo');
    }

    return errors;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos del torneo
      const tournamentData: CreateTournamentData = {
        name: formData.name.trim(),
        date: formData.date,
        league: parseInt(formData.leagueId),
        description: formData.description.trim(),
        location: formData.location.trim(),
        max_players: formData.max_players,
        entry_fee: formData.entry_fee,
        prize_pool: formData.prize_pool,
        format: formData.format,
        start_time: formData.start_time,  
        end_time: formData.end_time,
        players: players.map(p => p.playerId) // Solo IDs de jugadores existentes
      };

      console.log('Creating tournament with data:', tournamentData);
      
      // Crear el torneo
      const createdTournament = await tournamentService.createTournament(tournamentData);
      
      console.log('Tournament created successfully:', createdTournament);
      success('¡Torneo creado exitosamente!', `El torneo "${formData.name}" ha sido creado con ${players.length} jugadores.`);
      
      // Resetear formulario
      setFormData({
        name: '',
        date: '',
        leagueId: '',
        description: '',
        location: '',
        max_players: 8,
        entry_fee: 0,
        prize_pool: 0,
        format: 'Standard',
        start_time: '',
        end_time: ''
      });
      setPlayers([]);
      setErrors([]);
      
    } catch (err) {
      console.error('Error creating tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error('Error al crear el torneo', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para buscar jugadores
  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await playersService.getPlayerRanking({
        type: 'global',
        page: 1,
        pageSize: 10,
        search: query
      });

      const results: PlayerSearchResult[] = response.results.map((player: Player) => ({
        id: player.id || 0,
        name: player.name,
        username: player.name, // Usar name como username
        email: '' // Email vacío ya que no está disponible en el tipo Player
      }));

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (err) {
      console.error('Error searching players:', err);
      error('Error en la búsqueda', 'No se pudieron buscar jugadores. Inténtalo de nuevo.');
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlayers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para agregar un jugador existente
  const addExistingPlayer = (playerResult: PlayerSearchResult) => {
    // Verificar si el jugador ya está agregado
    if (players.some(p => p.playerId === playerResult.id)) {
      error('Jugador duplicado', 'Este jugador ya está agregado al torneo');
      return;
    }

    const newPlayer: TournamentPlayer = {
      id: `existing-${playerResult.id}`,
      name: playerResult.name,
      email: playerResult.email,
      playerId: playerResult.id
    };

    setPlayers(prev => [...prev, newPlayer]);
    setSearchQuery('');
    setShowSearchResults(false);
    success('Jugador agregado', `${playerResult.name} ha sido agregado al torneo`);
  };

  // Función para eliminar un jugador
  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_players' || name === 'entry_fee' || name === 'prize_pool' 
        ? (value === '' ? 0 : parseFloat(value)) 
        : value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BsTrophy className="text-3xl text-yellow-600" />
        <h1 className="text-3xl font-bold text-gray-900">Administrar Torneo</h1>
      </div>

      {/* Mensajes de error */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Errores de validación:</h3>
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica del torneo */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Torneo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Torneo Semanal Standard"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha del Torneo *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700 mb-2">
              Liga *
            </label>
            <select
              id="leagueId"
              name="leagueId"
              value={formData.leagueId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingLeagues}
            >
              <option value="">Seleccionar Liga</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id.toString()}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <select
              id="format"
              name="format"
              value={formData.format}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard">Standard</option>
              <option value="Modern">Modern</option>
              <option value="Pauper">Pauper</option>
              <option value="Pioneer">Pioneer</option>
              <option value="Commander">Commander</option>
              <option value="Draft">Draft</option>
              <option value="Sealed">Sealed</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Local de juegos MTG"
            />
          </div>

          <div>
            <label htmlFor="max_players" className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Jugadores
            </label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              value={formData.max_players}
              onChange={handleInputChange}
              min="4"
              max="256"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="entry_fee" className="block text-sm font-medium text-gray-700 mb-2">
              Costo de Entrada ($)
            </label>
            <input
              type="number"
              id="entry_fee"
              name="entry_fee"
              value={formData.entry_fee}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="prize_pool" className="block text-sm font-medium text-gray-700 mb-2">
              Premio Total ($)
            </label>
            <input
              type="number"
              id="prize_pool"
              name="prize_pool"
              value={formData.prize_pool}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Inicio
            </label>
            <input
              type="time"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Fin
            </label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción adicional del torneo..."
          />
        </div>

        {/* Gestión de Jugadores */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Jugadores del Torneo ({players.length})
          </h3>

          {/* Búsqueda y selección de jugadores */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar jugadores existentes..."
                  />
                </div>
              </div>

              {/* Resultados de búsqueda */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => addExistingPlayer(result)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      disabled={players.some(p => p.playerId === result.id)}
                    >
                      <div className="font-medium text-gray-900">{result.name}</div>
                      <div className="text-sm text-gray-600">@{result.username}</div>
                      {players.some(p => p.playerId === result.id) && (
                        <div className="text-xs text-green-600">Ya agregado</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                  No se encontraron jugadores
                </div>
              )}
            </div>
          </div>

          {/* Lista de jugadores agregados */}
          {players.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Jugadores Agregados:</h4>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <BsPersonPlus className="text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.email && `${player.email} • `}
                          Jugador registrado
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <BsX size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                date: '',
                leagueId: '',
                description: '',
                location: '',
                max_players: 8,
                entry_fee: 0,
                prize_pool: 0,
                format: 'Standard',
                start_time: '',
                end_time: ''
              });
              setPlayers([]);
              setErrors([]);
            }}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creando...' : 'Crear Torneo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentAdmin;
