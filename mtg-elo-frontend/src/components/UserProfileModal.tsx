import React, { useState, useEffect } from 'react';
import { BsX, BsCheckCircle, BsExclamationTriangle, BsLock, BsShieldCheck, BsPersonCircle } from 'react-icons/bs';
import authService, { User, ProfileUpdateData } from '../services/authService';
import { useAuth } from '../hooks/authHook';
import { PasswordChangeModal } from './PasswordChangeModal';
import { TwoFactorModal } from './TwoFactorModal';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface FormErrors {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  general?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const profile = await authService.getUserProfile();
      setUser(profile);
      setFormData({
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error al cargar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData: ProfileUpdateData = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };

      const response = await authService.updateUserProfile(updateData);
      setUser(response.user);
      setSuccessMessage('Perfil actualizado correctamente');
      
      // Actualizar el usuario en el contexto de autenticación
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error al actualizar el perfil' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    setSuccessMessage('Contraseña actualizada correctamente');
  };

  const handle2FAChanged = async () => {
    setShowTwoFactorModal(false);
    // Recargar el perfil para actualizar el estado del 2FA
    await loadUserProfile();
    await refreshUser();
    setSuccessMessage('Configuración de 2FA actualizada correctamente');
  };

  const handleClose = () => {
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
    });
    setErrors({});
    setSuccessMessage('');
    setUser(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BsPersonCircle className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Mi Perfil</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BsX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <BsCheckCircle className="h-5 w-5 text-green-400" />
                    <p className="ml-3 text-sm text-green-600">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <BsExclamationTriangle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-600">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* User ID (read-only) */}
              {user && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Usuario
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                    {user.id}
                  </div>
                </div>
              )}

              {/* 2FA Status */}
              {user && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autenticación de Dos Factores
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <BsShieldCheck className={`h-4 w-4 ${user.is_2fa_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm ${user.is_2fa_enabled ? 'text-green-600' : 'text-gray-600'}`}>
                        {user.is_2fa_enabled ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowTwoFactorModal(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      Configurar
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nombre de Usuario *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu nombre de usuario"
                    disabled={isSubmitting}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu nombre"
                    disabled={isSubmitting}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu apellido"
                    disabled={isSubmitting}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu email"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {/* Password Change Button */}
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <BsLock className="h-4 w-4" />
                    <span>Cambiar Contraseña</span>
                  </button>

                  {/* Form Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSubmitting ? 'Actualizando...' : 'Actualizar Perfil'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={handlePasswordChanged}
        isForced={false}
        title="Cambiar Contraseña"
      />

      {/* Two Factor Modal */}
      <TwoFactorModal
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onConfigurationChanged={handle2FAChanged}
        currentStatus={user?.is_2fa_enabled || false}
      />
    </div>
  );
};
