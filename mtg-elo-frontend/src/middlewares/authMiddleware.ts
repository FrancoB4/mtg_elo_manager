import authService from '../services/authService';

interface EnhancedRequestInit extends RequestInit {
  credentials: RequestCredentials;
}

class AuthMiddleware {
  private originalFetch: typeof fetch;
  private interceptorActive = false;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor() {
    // Guardar referencia al fetch original
    this.originalFetch = window.fetch.bind(window);
  }

  /**
   * Setup global fetch interceptor
   */
  setupInterceptor(): void {
    if (this.interceptorActive) return;
    
    this.interceptorActive = true;
    console.log('🔄 Auth middleware activated');
    
    // Intercept fetch globally
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      return this.fetchWithAuth(input, init);
    };
  }

  /**
   * Remove interceptor (for cleanup)
   */
  removeInterceptor(): void {
    if (!this.interceptorActive) return;
    
    console.log('🔄 Auth middleware deactivated');
    window.fetch = this.originalFetch;
    this.interceptorActive = false;
  }

  private async fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    
    // NO interceptar peticiones OPTIONS (preflight)
    if (method.toUpperCase() === 'OPTIONS') {
      console.log('⏭️ Skipping OPTIONS request:', url);
      return this.originalFetch(input, init);
    }
    
    console.log(`🔍 ${method} request to:`, url);
    
    // Endpoints que NO necesitan interceptación
    if (this.shouldSkipMiddleware(url)) {
      console.log('✅ Skipping middleware for auth endpoint');
      return this.originalFetch(input, {
        ...init,
        credentials: 'include',
      });
    }

    console.log('🔐 Applying auth middleware');

    // Aplicar middleware con cookies
    const requestInit: RequestInit = {
      ...init,
      credentials: 'include',
    };

    let response = await this.originalFetch(input, requestInit);

    // Manejar 401 solo en endpoints protegidos
    if (response.status === 401 && !this.isRefreshEndpoint(url)) {
      console.log('🔄 Unauthorized, attempting token refresh...');
      
      const refreshSuccess = await this.handleTokenRefresh();
      if (refreshSuccess) {
        console.log('✅ Token refreshed, retrying request');
        response = await this.originalFetch(input, requestInit);
      } else {
        console.log('❌ Refresh failed, redirecting to login');
        this.redirectToLogin();
      }
    }

    return response;
  }

  private shouldSkipMiddleware(url: string): boolean {
    const skipPatterns = [
      // Auth endpoints
      '/auth/',
      '/register/',
      '/login/',
      '/signin/',
      '/signup/',
      '/users/register/',
      '/api/auth/',
      '/api/users/register/',
      
      // Static assets
      '/static/',
      '/favicon.ico',
      '.js',
      '.css',
      '.png',
      '.jpg',
      '.ico',
      
      // Frontend dev server
      'localhost:3000',
      '127.0.0.1:3000',
    ];
    
    return skipPatterns.some(pattern => url.includes(pattern));
  }

  private isRefreshEndpoint(url: string): boolean {
    return url.includes('/refresh/') || url.includes('/api/auth/refresh/');
  }

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('⏳ Already refreshing, queuing request...');
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string | null) => {
          resolve(token !== null);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const success = await this.attemptTokenRefresh();
      this.notifySubscribers(success ? 'success' : null);
      return success;
    } finally {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    try {
      const response = await this.originalFetch('/api/auth/refresh/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  private notifySubscribers(token: string | null): void {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  private redirectToLogin(): void {
    console.log('🚪 Redirecting to login');
    
    // Limpiar cookies
    document.cookie = 'access=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    if (window.location.pathname !== '/auth/signin') {
      window.location.href = '/auth/signin';
    }
  }

  // Método helper para verificar si el usuario está autenticado
  public async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await this.originalFetch('/api/auth/me/', {
        method: 'POST',
        credentials: 'include',
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthMiddleware();