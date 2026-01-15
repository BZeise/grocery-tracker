import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { PasswordGate } from './components/Auth/PasswordGate';
import { MobileHeader } from './components/Layout/MobileHeader';
import { FilterBar } from './components/Layout/FilterBar';
import { ItemTable } from './components/Items/ItemTable';
import type { SortField, SortDirection } from './types';
import './index.css';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordGate />;
  }

  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}

function Dashboard() {
  const { items, stores, isLoading, error, refreshItems, refreshStores, refreshAll } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStoreId, setFilterStoreId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
        <button
          onClick={refreshAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <MobileHeader />
      <main className="px-4 py-4 pb-20 max-w-2xl mx-auto">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStoreId={filterStoreId}
          onFilterStoreChange={setFilterStoreId}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          stores={stores}
        />
        <div className="mt-4">
          <ItemTable
            items={items}
            stores={stores}
            searchQuery={searchQuery}
            filterStoreId={filterStoreId}
            sortField={sortField}
            sortDirection={sortDirection}
            onUpdate={refreshItems}
            onStoreCreated={refreshStores}
          />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
