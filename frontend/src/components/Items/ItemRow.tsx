import { useState } from 'react';
import type { ItemSummary, Store, Item, CreatePriceEntryRequest } from '../../types';
import { PriceEntryForm } from '../Forms/PriceEntryForm';
import * as api from '../../services/api';

interface ItemRowProps {
  item: ItemSummary;
  stores: Store[];
  onUpdate: () => void;
  onStoreCreated: () => void;
}

export function ItemRow({ item, stores, onUpdate, onStoreCreated }: ItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [fullItem, setFullItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const handleExpand = async () => {
    if (!isExpanded && !fullItem) {
      setIsLoading(true);
      try {
        const data = await api.getItem(item.id);
        setFullItem(data);
      } catch (err) {
        console.error('Failed to load item details:', err);
      }
      setIsLoading(false);
    }
    setIsExpanded(!isExpanded);
  };

  const handleAddPrice = async (data: CreatePriceEntryRequest) => {
    await api.createPriceEntry(data);
    const updatedItem = await api.getItem(item.id);
    setFullItem(updatedItem);
    setIsAddingPrice(false);
    onUpdate();
  };

  const handleUpdateName = async () => {
    if (editName.trim() && editName !== item.name) {
      await api.updateItem(item.id, editName.trim());
      onUpdate();
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${item.name}" and all its price history?`)) {
      await api.deleteItem(item.id);
      onUpdate();
    }
  };

  const handleDeletePrice = async (priceId: number) => {
    if (confirm('Delete this price entry?')) {
      await api.deletePriceEntry(priceId);
      const updatedItem = await api.getItem(item.id);
      setFullItem(updatedItem);
      onUpdate();
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPricePerUnit = (price: number) => {
    if (parseFloat(price.toFixed(2)) > 0) return `$${price.toFixed(2)}`;
    for (let digits = 3; digits <= 8; digits++) {
      if (parseFloat(price.toFixed(digits)) > 0) return `$${price.toFixed(digits)}`;
    }
    return `$${price.toFixed(8)}`;
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${isExpanded ? 'shadow-md border border-blue-200' : 'shadow-sm border border-gray-200'}`}>
      {/* Main row - compact single line */}
      <div
        className="py-2 px-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
        onClick={() => { void handleExpand(); }}
      >
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              title="Item Row"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => { void handleUpdateName(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { void handleUpdateName(); }
                if (e.key === 'Escape') {
                  setEditName(item.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full"
              autoFocus
            />
          ) : (
            <span className="font-medium text-gray-900 text-sm truncate block">{item.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.bestPrice ? (
            <span className="text-sm">
              <span className="text-green-600 font-semibold">{formatPricePerUnit(item.bestPrice.pricePerUnit)}/{item.latestPricesByStore[0]?.unitType ?? 'unit'}</span>
              <span className="text-gray-400 text-xs"> · {item.bestPrice.storeName}</span>
            </span>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
          <span className={`transition-transform text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 bg-gray-50 p-4">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : (
            <>
              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingPrice(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  + Add Price
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                >
                  Edit Name
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete();
                  }}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                >
                  Delete
                </button>
              </div>

              {/* Add price form */}
              {isAddingPrice && (
                <div className="mb-4">
                  <PriceEntryForm
                    itemId={item.id}
                    stores={stores}
                    onSubmit={handleAddPrice}
                    onCancel={() => setIsAddingPrice(false)}
                    onStoreCreated={onStoreCreated}
                  />
                </div>
              )}

              {/* Price history */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 text-sm">Price History</h4>
                {fullItem?.priceEntries && fullItem.priceEntries.length > 0 ? (
                  <div className="space-y-2">
                    {fullItem.priceEntries.map((price) => (
                      <div
                        key={price.id}
                        className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{price.storeName}</p>
                          <p className="text-sm text-gray-500">
                            {price.quantity} {price.unitType} for {formatPrice(price.totalPrice)}
                            {price.isOverridden && <span className="text-blue-600 ml-1">(custom)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(price.recordedAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatPricePerUnit(price.pricePerUnit)}/{price.unitType}
                          </p>
                          <button
                            type="button"
                            onClick={() => { void handleDeletePrice(price.id); }}
                            className="text-xs text-red-600 hover:text-red-800 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No price entries yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
