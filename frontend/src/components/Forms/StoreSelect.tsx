import { useState, useRef, useEffect } from 'react';
import type { Store } from '../../types';
import * as api from '../../services/api';

interface StoreSelectProps {
  stores: Store[];
  selectedStoreId: number | null;
  onSelect: (storeId: number) => void;
  onStoreCreated: () => void;
}

export function StoreSelect({ stores, selectedStoreId, onSelect, onStoreCreated }: StoreSelectProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddStore = async () => {
    if (!newStoreName.trim()) return;

    setIsSubmitting(true);
    try {
      const newStore = await api.createStore({ name: newStoreName.trim() });
      onStoreCreated();
      onSelect(newStore.id);
      setNewStoreName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create store:', err);
    }
    setIsSubmitting(false);
  };

  if (isAdding) {
    return (
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
          placeholder="Store name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddStore();
            if (e.key === 'Escape') setIsAdding(false);
          }}
        />
        <button
          onClick={handleAddStore}
          disabled={isSubmitting || !newStoreName.trim()}
          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
        >
          Add
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={selectedStoreId ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select store...</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => setIsAdding(true)}
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
        title="Add new store"
      >
        + New
      </button>
    </div>
  );
}
