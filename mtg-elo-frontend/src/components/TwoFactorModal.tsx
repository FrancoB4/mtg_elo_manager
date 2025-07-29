import React, { useState } from 'react';
import { BsX, BsShieldCheck, BsGrid, BsExclamationTriangle, BsCheckCircle } from 'react-icons/bs';
import authService from '../services/authService';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigurationChanged: () => void;
  currentStatus: boolean;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onConfigurationChanged,
  currentStatus
}) => {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleClose = () => {
    setStep('initial');
    setQrCodeUrl('');
    setVerificationCode('');
    setPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.enable2FA();
      setQrCodeUrl(response.otpauth_uri);
      setStep('setup');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      setError(error instanceof Error ? error.message : 'Error al habilitar 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    if (!password.trim()) {
      setError('La contraseña es requerida para verificar el código 2FA');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verificando código 2FA:', verificationCode);
      await authService.verify2FASetup(verificationCode, password);
      setSuccess('2FA habilitado correctamente');
      setStep('initial');
      setTimeout(() => {
        onConfigurationChanged();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      let errorMessage = 'Código inválido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Si el error menciona datos obligatorios, mostrar más información
        if (error.message.includes('required') || error.message.includes('obligatorio')) {
          errorMessage = 'Faltan datos obligatorios. Verifica que el código tenga 6 dígitos y la contraseña sea correcta.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      await authService.disable2FA();
      setSuccess('2FA deshabilitado correctamente');
      setTimeout(() => {
        onConfigurationChanged();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setError(error instanceof Error ? error.message : 'Error al deshabilitar 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodeUrl = (otpauthUrl: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BsShieldCheck className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Autenticación de Dos Factores
            </h2>
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
          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <BsCheckCircle className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <BsExclamationTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {step === 'initial' && (
            <div className="space-y-4">
              <div className="text-center">
                <BsShieldCheck className={`mx-auto h-12 w-12 ${currentStatus ? 'text-green-600' : 'text-gray-400'}`} />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Estado Actual: {currentStatus ? 'Habilitado' : 'Deshabilitado'}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {currentStatus 
                    ? 'La autenticación de dos factores está activa en tu cuenta.'
                    : 'Mejora la seguridad de tu cuenta habilitando la autenticación de dos factores.'
                  }
                </p>
              </div>

              <div className="space-y-3">
                {!currentStatus ? (
                  <button
                    onClick={handleEnable2FA}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {isLoading ? 'Habilitando...' : 'Habilitar 2FA'}
                  </button>
                ) : (
                  <button
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {isLoading ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'setup' && (
            <div className="space-y-4">
              <div className="text-center">
                <BsGrid className="mx-auto h-12 w-12 text-indigo-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Escanea el Código QR
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Usa tu aplicación autenticadora (como Google Authenticator o Authy) para escanear este código QR.
                </p>
              </div>

              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img
                    src={generateQRCodeUrl(qrCodeUrl)}
                    alt="QR Code para 2FA"
                    className="w-48 h-48 border border-gray-200 rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('verify');
                    setPassword(''); // Limpiar contraseña al avanzar
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Ya Escaneé el Código
                </button>
                <button
                  onClick={() => {
                    setStep('initial');
                    setPassword(''); // Limpiar contraseña al cancelar
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <BsShieldCheck className="mx-auto h-12 w-12 text-indigo-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Verificar Código
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Ingresa tu contraseña actual y el código de 6 dígitos de tu aplicación autenticadora.
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña Actual *
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ingresa tu contraseña actual"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Código de Verificación *
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-lg font-mono"
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerify2FA}
                  disabled={isLoading || verificationCode.length !== 6 || !password.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {isLoading ? 'Verificando...' : 'Verificar y Habilitar'}
                </button>
                <button
                  onClick={() => {
                    setStep('setup');
                    setPassword(''); // Limpiar contraseña al volver
                  }}
                  disabled={isLoading}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Volver al Código QR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
