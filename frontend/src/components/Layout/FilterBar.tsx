import type { Store, SortField, SortDirection } from '../../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStoreId: number | null;
  onFilterStoreChange: (storeId: number | null) => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
  stores: Store[];
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  filterStoreId,
  onFilterStoreChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  stores,
}: FilterBarProps) {
  const toggleSortDirection = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-300 p-4 space-y-3">
      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filters and sort */}
      <div className="flex flex-wrap gap-2">
        {/* Store filter */}
        <select
          value={filterStoreId ?? ''}
          onChange={(e) => onFilterStoreChange(e.target.value ? Number(e.target.value) : null)}
          title="Filter by store"
          className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Stores</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        {/* Sort field */}
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          title="Sort by"
          className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="date">Sort by Date</option>
        </select>

        {/* Sort direction */}
        <button
          type="button"
          onClick={toggleSortDirection}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>
    </div>
  );
}
