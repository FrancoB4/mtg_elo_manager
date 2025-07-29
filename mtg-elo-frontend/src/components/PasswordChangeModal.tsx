import React, { useState } from 'react';
import { BsEye, BsEyeSlash, BsLock, BsCheckCircle, BsX } from 'react-icons/bs';
import authService from '../services/authService';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
  isForced?: boolean; // Si es true, es un reset obligatorio y no se puede cerrar
  title?: string;
}

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string, oldPassword?: string) => boolean;
  met: boolean;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onPasswordChanged,
  isForced = false,
  title = 'Cambiar Contraseña'
}) => {
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Validaciones de contraseña
  const passwordRequirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'Al menos 8 caracteres',
      validator: (password) => password.length >= 8,
      met: formData.newPassword.length >= 8
    },
    {
      id: 'lowercase',
      label: 'Una letra minúscula (a-z)',
      validator: (password) => /[a-z]/.test(password),
      met: /[a-z]/.test(formData.newPassword)
    },
    {
      id: 'uppercase',
      label: 'Una letra mayúscula (A-Z)',
      validator: (password) => /[A-Z]/.test(password),
      met: /[A-Z]/.test(formData.newPassword)
    },
    {
      id: 'number',
      label: 'Un número (0-9)',
      validator: (password) => /\d/.test(password),
      met: /\d/.test(formData.newPassword)
    },
    {
      id: 'special',
      label: 'Un carácter especial (!@#$%^&*)',
      validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
    },
    {
      id: 'different',
      label: 'Diferente de la contraseña anterior',
      validator: (password, oldPassword) => oldPassword ? password !== oldPassword : true,
      met: formData.oldPassword ? formData.newPassword !== formData.oldPassword : true
    },
    {
      id: 'match',
      label: 'Las contraseñas coinciden',
      validator: (password) => formData.confirmPassword ? password === formData.confirmPassword : true,
      met: formData.confirmPassword ? formData.newPassword === formData.confirmPassword : true
    }
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet) {
      setError('Por favor cumple todos los requisitos de contraseña');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Llamar al servicio de cambio de contraseña
      await authService.changePassword(formData.oldPassword, formData.newPassword);
      
      onPasswordChanged();
      
      // Reset form
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isForced && !isSubmitting) {
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {!isForced && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <BsX className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Forced reset message */}
          {isForced && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Cambio de contraseña requerido:</strong> Debes cambiar tu contraseña antes de continuar.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password */}
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <BsLock className="inline w-4 h-4 mr-1" />
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ingresa tu contraseña actual"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? (
                    <BsEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <BsEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <BsLock className="inline w-4 h-4 mr-1" />
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ingresa tu nueva contraseña"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <BsEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <BsEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <BsLock className="inline w-4 h-4 mr-1" />
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirma tu nueva contraseña"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <BsEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <BsEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</h4>
              <div className="space-y-1">
                {passwordRequirements.map((requirement) => (
                  <div key={requirement.id} className="flex items-center text-sm">
                    {requirement.met ? (
                      <BsCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <BsX className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={requirement.met ? 'text-green-700' : 'text-gray-600'}>
                      {requirement.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!allRequirementsMet || isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                  !allRequirementsMet || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
              </button>
            </div>

            {/* Cancel Button (only if not forced) */}
            {!isForced && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
