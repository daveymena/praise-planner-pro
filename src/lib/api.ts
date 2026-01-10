const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Members API
  async getMembers() {
    return this.request('/members');
  }

  async getMember(id: string) {
    return this.request(`/members/${id}`);
  }

  async createMember(data: any) {
    return this.request('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: string, data: any) {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string) {
    return this.request(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Songs API
  async getSongs(filters?: { type?: string; favorite?: boolean; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.favorite) params.append('favorite', 'true');
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/songs${query}`);
  }

  async getSong(id: string) {
    return this.request(`/songs/${id}`);
  }

  async createSong(data: any) {
    return this.request('/songs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSong(id: string, data: any) {
    return this.request(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleSongFavorite(id: string, is_favorite: boolean) {
    return this.request(`/songs/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ is_favorite }),
    });
  }

  async deleteSong(id: string) {
    return this.request(`/songs/${id}`, {
      method: 'DELETE',
    });
  }

  // Rehearsals API
  async getRehearsals() {
    return this.request('/rehearsals');
  }

  async getUpcomingRehearsals() {
    return this.request('/rehearsals/upcoming');
  }

  async getRehearsal(id: string) {
    return this.request(`/rehearsals/${id}`);
  }

  async createRehearsal(data: any) {
    return this.request('/rehearsals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRehearsal(id: string, data: any) {
    return this.request(`/rehearsals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRehearsal(id: string) {
    return this.request(`/rehearsals/${id}`, {
      method: 'DELETE',
    });
  }

  // Rehearsal attendance
  async updateRehearsalAttendance(rehearsalId: string, memberId: string, status: string) {
    return this.request(`/rehearsals/${rehearsalId}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ memberId, status }),
    });
  }

  // Services API
  async getServices() {
    return this.request('/services');
  }

  async getUpcomingServices() {
    return this.request('/services/upcoming');
  }

  async createService(data: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Rules API
  async getRules() {
    return this.request('/rules');
  }

  async createRule(data: any) {
    return this.request('/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRule(id: string) {
    return this.request(`/rules/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    const url = `${this.baseURL.replace('/api', '')}/health`;
    const response = await fetch(url);
    return await response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;