import type {
  ItemSummary,
  Item,
  Store,
  PriceEntry,
  CreateItemRequest,
  CreatePriceEntryRequest,
  UpdatePriceEntryRequest,
  CreateStoreRequest,
  AuthResponse,
} from '../types';

// In development, Vite proxy handles /api requests
// In production, set VITE_API_URL to your backend URL
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// Auth
export const verifyPassword = (password: string): Promise<AuthResponse> =>
  fetchApi('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

// Items
export const getItems = (): Promise<ItemSummary[]> =>
  fetchApi('/items');

export const getItem = (id: number): Promise<Item> =>
  fetchApi(`/items/${id}`);

export const createItem = (request: CreateItemRequest): Promise<Item> =>
  fetchApi('/items', {
    method: 'POST',
    body: JSON.stringify(request),
  });

export const updateItem = (id: number, name: string): Promise<Item> =>
  fetchApi(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

export const deleteItem = (id: number): Promise<void> =>
  fetchApi(`/items/${id}`, {
    method: 'DELETE',
  });

// Prices
export const createPriceEntry = (request: CreatePriceEntryRequest): Promise<PriceEntry> =>
  fetchApi('/prices', {
    method: 'POST',
    body: JSON.stringify(request),
  });

export const updatePriceEntry = (id: number, request: UpdatePriceEntryRequest): Promise<PriceEntry> =>
  fetchApi(`/prices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });

export const deletePriceEntry = (id: number): Promise<void> =>
  fetchApi(`/prices/${id}`, {
    method: 'DELETE',
  });

// Stores
export const getStores = (): Promise<Store[]> =>
  fetchApi('/stores');

export const createStore = (request: CreateStoreRequest): Promise<Store> =>
  fetchApi('/stores', {
    method: 'POST',
    body: JSON.stringify(request),
  });
