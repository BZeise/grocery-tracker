export interface Item {
  id: number;
  name: string;
  createdAt: string;
  isActive: boolean;
  priceEntries: PriceEntry[];
}

export interface ItemSummary {
  id: number;
  name: string;
  createdAt: string;
  bestPrice: PriceEntry | null;
  latestPricesByStore: StorePrice[];
}

export interface StorePrice {
  storeId: number;
  storeName: string;
  pricePerUnit: number;
  totalPrice: number;
  quantity: number;
  unitType: string;
  recordedAt: string;
}

export interface PriceEntry {
  id: number;
  itemId: number;
  storeId: number;
  storeName: string;
  quantity: number;
  unitType: string;
  totalPrice: number;
  pricePerUnit: number;
  isOverridden: boolean;
  recordedAt: string;
  createdAt: string;
}

export interface Store {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateItemRequest {
  name: string;
}

export interface CreatePriceEntryRequest {
  itemId: number;
  storeId: number;
  quantity: number;
  unitType: string;
  totalPrice: number;
  pricePerUnit?: number;
  recordedAt?: string;
}

export interface UpdatePriceEntryRequest {
  quantity: number;
  unitType: string;
  totalPrice: number;
  pricePerUnit?: number;
  recordedAt?: string;
}

export interface CreateStoreRequest {
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}

export type SortField = 'name' | 'price' | 'date';
export type SortDirection = 'asc' | 'desc';

export const UNIT_TYPES = ['oz', 'lbs', 'count', 'fl oz', 'gal', 'ml', 'L', 'g', 'kg', 'pack'] as const;
export type UnitType = typeof UNIT_TYPES[number];
