import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ItemSummary, Store } from '../types';
import * as api from '../services/api';

interface DataContextType {
  items: ItemSummary[];
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  refreshStores: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const refreshItems = useCallback(async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      console.error('Background refresh failed for items:', err);
    }
  }, []);

  const refreshStores = useCallback(async () => {
    try {
      const data = await api.getStores();
      setStores(data);
    } catch (err) {
      console.error('Background refresh failed for stores:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refreshItems(), refreshStores()]);
    setIsLoading(false);
  }, [refreshItems, refreshStores]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  return (
    <DataContext.Provider
      value={{
        items,
        stores,
        isLoading,
        error,
        refreshItems,
        refreshStores,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
