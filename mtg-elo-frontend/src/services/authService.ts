import Environment from '../config/environment';

// Interfaces para tipado
interface AuthResponse {
  username: string;
  require_2fa: boolean;
  must_reset_password?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_2fa_enabled: boolean;
}

interface TwoFAResponse {
  otpauth_uri: string;
}

interface VerifyResponse {
  detail: string;
  success: boolean;
}

interface PasswordChangeResponse {
  message: string;
}

interface DisableTwoFAResponse {
  detail: string;
}

interface ProfileUpdateData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ProfileUpdateResponse {
  message: string;
  user: User;
}

interface Enable2FAResponse {
  otpauth_uri: string;
}

interface Verify2FAResponse {
  detail: string;
}

// interface RequestOptions extends RequestInit {
//   credentials: RequestCredentials;
// }

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface RegisterResponse {
  message: string;
  user_id?: number;
}

class AuthService {
  private baseURL: string;
  private authEndpoint: string;

  constructor() {
    this.baseURL = Environment.apiUrl;
    this.authEndpoint = Environment.authEndpoint;
    
    console.log('AuthService initialized with:', {
      baseURL: this.baseURL,
      authEndpoint: this.authEndpoint
    });
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const endpoint = `${this.baseURL}/users/register/`;
    console.log('Attempting registration at:', endpoint);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para cookies
        body: JSON.stringify(userData),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          
          if (response.status === 400 && errorData) {
            const errorMessages: string[] = [];
            
            if (errorData.username) {
              errorMessages.push(`Usuario: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`);
            }
            if (errorData.email) {
              errorMessages.push(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
            }
            if (errorData.password) {
              errorMessages.push(`Contraseña: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
            }
            if (errorData.non_field_errors) {
              errorMessages.push(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
            }
            
            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join('. '));
            }
          }
          
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Registration successful');
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with username and password
   */
  async authenticateUserAndPassword(username: string, password: string): Promise<AuthResponse> {
    const endpoint = `${this.authEndpoint}/`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para cookies
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Authentication failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Verify 2FA code and get JWT tokens (stored in cookies)
   */
  async verify2FA(username: string, password: string, code: string): Promise<VerifyResponse> {
    const response = await fetch(`${this.authEndpoint}/2fa/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para cookies
      body: JSON.stringify({ username, password, code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || '2FA verification failed');
    }

    // El backend setea las cookies automáticamente
    return await response.json();
  }

  /**
   * Get current user data (uses cookie-based auth)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.authEndpoint}/me/`, {
        method: 'POST',
        credentials: 'include', // Importante para cookies
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout user (clears cookies)
   */
  async logout(): Promise<boolean> {
    try {
      const response = await fetch(`${this.authEndpoint}/logout/`, {
        method: 'POST',
        credentials: 'include', // Importante para cookies
      });

      if (response.ok) {
        // El backend ya limpia las cookies
        console.log('Logout successful');
        return true;
      } else {
        console.error('Logout failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Complete authentication flow
   */
  async authenticateUser(username: string, password: string, twoFactorCode?: string): Promise<User> {
    try {
      console.log('Starting authentication for user:', username);

      // Step 1: Authenticate with username/password
      const authResult = await this.authenticateUserAndPassword(username, password);
      
      // Step 2: Handle 2FA if required
      if (authResult.require_2fa) {
        if (!twoFactorCode) {
          throw new Error('2FA_REQUIRED');
        }
        
        console.log('Verifying 2FA code');
        await this.verify2FA(username, password, twoFactorCode);
      }

      // Step 3: Get user data (now that cookies are set)
      const userData = await this.getCurrentUser();
      if (!userData) {
        throw new Error('Failed to retrieve user data');
      }

      console.log('Authentication successful for user:', userData.username);
      return userData;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<PasswordChangeResponse> {
    try {
      if (Environment.debug) {
        console.log('Attempting password change');
      }

      const response = await fetch(`${this.authEndpoint}/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para usar cookies de autenticación
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Error al cambiar la contraseña');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Password changed successfully');
      }

      return data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Obtener perfil del usuario
  async getUserProfile(): Promise<User> {
    try {
      // Primero obtenemos el usuario actual para obtener su username
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${Environment.apiUrl}/users/profile/${currentUser.username}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Error al obtener el perfil');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Profile retrieved successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateUserProfile(profileData: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      // Primero obtenemos el usuario actual para obtener su username
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${Environment.apiUrl}/users/profile/${currentUser.username}/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Error al actualizar el perfil');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Profile updated successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Habilitar 2FA
  async enable2FA(): Promise<Enable2FAResponse> {
    try {
      const response = await fetch(`${Environment.authEndpoint}/2fa/enable/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Error al habilitar 2FA');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('2FA enabled successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  }

  // Verificar código 2FA durante habilitación
  async verify2FASetup(code: string, password: string): Promise<Verify2FAResponse> {
    try {
      // Obtener usuario actual para username
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${Environment.authEndpoint}/2fa/verify/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser.username,
          password: password,
          code: code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('2FA verification error response:', errorData);
        
        // Proporcionar más detalles sobre el error
        let errorMessage = 'Código 2FA inválido';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.code) {
          errorMessage = `Error en código: ${Array.isArray(errorData.code) ? errorData.code[0] : errorData.code}`;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('2FA verified successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Verify 2FA error:', error);
      throw error;
    }
  }

  // Deshabilitar 2FA
  async disable2FA(): Promise<DisableTwoFAResponse> {
    try {
      const response = await fetch(`${Environment.authEndpoint}/2fa/disable/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Error al deshabilitar 2FA');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('2FA disabled successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
export type { 
  User, 
  AuthResponse, 
  TwoFAResponse, 
  VerifyResponse, 
  PasswordChangeResponse, 
  DisableTwoFAResponse,
  RegisterRequest,
  RegisterResponse,
  ProfileUpdateData,
  ProfileUpdateResponse,
  Enable2FAResponse,
  Verify2FAResponse
};