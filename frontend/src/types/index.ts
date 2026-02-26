export interface User {
  id: number;
  name: string;
  createdAt: string;
}

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
  userId: number;
  userName: string;
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
  userId: number;
  quantity: number;
  unitType: string;
  totalPrice: number;
  pricePerUnit?: number;
  recordedAt?: string;
}

export interface UpdatePriceEntryRequest {
  userId: number;
  quantity: number;
  unitType: string;
  totalPrice: number;
  pricePerUnit?: number;
  recordedAt?: string;
}

export interface CreateStoreRequest {
  name: string;
}

export type SortField = 'name' | 'price' | 'date';
export type SortDirection = 'asc' | 'desc';

export const UNIT_TYPES = ['oz', 'lbs', 'count', 'fl oz', 'gal', 'ml', 'L', 'g', 'kg', 'pack'] as const;
export type UnitType = typeof UNIT_TYPES[number];

// Units that convert to a canonical unit within the same measurement system.
// Units not listed here are already canonical (oz, g, fl oz, ml, count, pack).
const UNIT_CONVERSIONS: Partial<Record<string, { canonical: string; factor: number }>> = {
  lbs: { canonical: 'oz',    factor: 16 },
  kg:  { canonical: 'g',     factor: 1000 },
  gal: { canonical: 'fl oz', factor: 128 },
  L:   { canonical: 'ml',    factor: 1000 },
};

export function normalizePrice(pricePerUnit: number, unitType: string): { price: number; unit: string } {
  const conv = UNIT_CONVERSIONS[unitType];
  if (!conv) return { price: pricePerUnit, unit: unitType };
  return { price: pricePerUnit / conv.factor, unit: conv.canonical };
}
