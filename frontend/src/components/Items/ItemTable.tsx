import { useMemo } from 'react';
import type { ItemSummary, Store, SortField, SortDirection } from '../../types';
import { ItemRow } from './ItemRow';
import { AddItemRow } from './AddItemRow';

interface ItemTableProps {
  items: ItemSummary[];
  stores: Store[];
  searchQuery: string;
  filterStoreId: number | null;
  sortField: SortField;
  sortDirection: SortDirection;
  onUpdate: () => void;
  onStoreCreated: () => void;
}

export function ItemTable({
  items,
  stores,
  searchQuery,
  filterStoreId,
  sortField,
  sortDirection,
  onUpdate,
  onStoreCreated,
}: ItemTableProps) {
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // Filter by store
    if (filterStoreId) {
      result = result.filter((item) =>
        item.latestPricesByStore.some((sp) => sp.storeId === filterStoreId)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price': {
          const aPrice = a.bestPrice?.pricePerUnit ?? Infinity;
          const bPrice = b.bestPrice?.pricePerUnit ?? Infinity;
          comparison = aPrice - bPrice;
          break;
        }
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, filterStoreId, sortField, sortDirection]);

  return (
    <div className="space-y-3">
      <AddItemRow
        stores={stores}
        onItemCreated={onUpdate}
        onStoreCreated={onStoreCreated}
      />

      {filteredAndSortedItems.length === 0 && items.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No items match your search or filter.
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No items yet. Use the button above to add your first item!
        </div>
      ) : (
        filteredAndSortedItems.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            stores={stores}
            onUpdate={onUpdate}
            onStoreCreated={onStoreCreated}
          />
        ))
      )}
    </div>
  );
}
