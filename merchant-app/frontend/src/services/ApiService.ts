import AuthService from './AuthService';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  merchant: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const ApiService = {
  async getListings(): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/listings`);
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    return response.json();
  },

  async getListing(id: string): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }
    return response.json();
  },

  async createListing(listing: Omit<Listing, 'id'>): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    });
    if (!response.ok) {
      throw new Error('Failed to create listing');
    }
    return response.json();
  },

  async updateListing(id: string, listing: Partial<Listing>): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    });
    if (!response.ok) {
      throw new Error('Failed to update listing');
    }
    return response.json();
  },

  async deleteListing(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete listing');
    }
  },

  async getFavourites(): Promise<Listing[]> {
    const token = AuthService.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch('http://127.0.0.1:5001/api/listings/favourites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch favourites');
    const data = await response.json();
    return data.favourites || [];
  },

  async addFavourite(listingId: string): Promise<void> {
    const token = AuthService.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch('http://127.0.0.1:5001/api/listings/favourites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ listing_id: listingId })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Favourites API error:', errorText);
      throw new Error('Failed to add favourite');
    }
  },

  async removeFavourite(listingId: string): Promise<void> {
    const token = AuthService.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`http://127.0.0.1:5001/api/listings/favourites/${listingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to remove favourite');
  },
};

export type { Listing };
export default ApiService;
