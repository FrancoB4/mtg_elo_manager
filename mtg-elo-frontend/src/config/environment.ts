interface EnvironmentConfig {
  apiUrl: string;
  apiBasePath: string;
  authEndpoint: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}

class Environment {
  private config: EnvironmentConfig;
  private hasLogged = false; // Mover ANTES del constructor

  constructor() {
    this.config = {
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      apiBasePath: process.env.REACT_APP_API_BASE_PATH || '',
      authEndpoint: process.env.REACT_APP_AUTH_ENDPOINT || '/auth',
      environment: (process.env.REACT_APP_ENV as 'development' | 'production' | 'test') || 'development',
      debug: process.env.REACT_APP_DEBUG === 'true',
    };

    // Validate required environment variables
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.apiUrl) {
      throw new Error('REACT_APP_API_URL is required');
    }

    // Log configuration in development ONLY ONCE
    if (this.config.debug && !this.hasLogged) {
      console.log('Environment Configuration:', {
        apiUrl: this.config.apiUrl,
        apiBasePath: this.config.apiBasePath,
        authEndpoint: this.getAuthEndpoint(), // Usar método en lugar de getter
        environment: this.config.environment,
        debug: this.config.debug
      });
      this.hasLogged = true;
    }
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get apiBasePath(): string {
    return this.config.apiBasePath;
  }

  // Cambiar a método para evitar recursión
  getAuthEndpoint(): string {
    return `${this.config.apiUrl}${this.config.apiBasePath}${this.config.authEndpoint}`;
  }

  get authEndpoint(): string {
    return this.getAuthEndpoint();
  }

  get fullApiUrl(): string {
    return `${this.config.apiUrl}${this.config.apiBasePath}`;
  }

  get environment(): 'development' | 'production' | 'test' {
    return this.config.environment;
  }

  get debug(): boolean {
    return this.config.debug;
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }
}

export default new Environment();