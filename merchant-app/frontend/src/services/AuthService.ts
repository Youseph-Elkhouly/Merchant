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

  private constructor() {
    // On app load, if token exists, fetch user info
    const token = localStorage.getItem('token');
    if (token) {
      this.token = token;
      this.fetchUserInfo();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      this.token = data.access_token;
      localStorage.setItem('token', data.access_token);
      await this.fetchUserInfo();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string, name: string): Promise<any> {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      this.token = data.access_token;
      localStorage.setItem('token', data.access_token);
      await this.fetchUserInfo();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async fetchUserInfo(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      this.user = data;
      return this.user;
    } catch {
      return null;
    }
  }

  signOut(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.user;
  }

  // Helper to require login (returns true if logged in, otherwise can show modal or redirect)
  requireLogin(onNotLoggedIn?: () => void): boolean {
    if (!this.isAuthenticated()) {
      if (onNotLoggedIn) onNotLoggedIn();
      return false;
    }
    return true;
  }
}

export default AuthService.getInstance(); 