interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      throw error;
    }
  }

  signOut(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token || !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.user;
  }
}

export default AuthService.getInstance(); 