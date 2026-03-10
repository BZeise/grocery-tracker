import { useState, useRef, useEffect } from 'react';
import type { ItemSummary, Store, Item, CreatePriceEntryRequest } from '../../types';
import { normalizePrice } from '../../types';
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
  const [confirmingPriceId, setConfirmingPriceId] = useState<number | null>(null);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (confirmingPriceId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirmingPriceId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmingPriceId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmingPriceId]);

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

  const handleMarkUnavailable = async (priceId: number) => {
    setConfirmingPriceId(null);
    await api.markPriceUnavailable(priceId);
    const updatedItem = await api.getItem(item.id);
    setFullItem(updatedItem);
    onUpdate();
  };

  const handleMarkAvailable = async (priceId: number) => {
    setConfirmingPriceId(null);
    await api.markPriceAvailable(priceId);
    const updatedItem = await api.getItem(item.id);
    setFullItem(updatedItem);
    onUpdate();
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

  const normalizedBestPrice = item.bestPrice
    ? normalizePrice(item.bestPrice.pricePerUnit, item.bestPrice.unitType)
    : null;

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
          {normalizedBestPrice ? (
            <span className="text-sm flex items-center gap-1.5">
              <span className="text-green-600 font-semibold">{formatPricePerUnit(normalizedBestPrice.price)}/{normalizedBestPrice.unit}</span>
              {item.bestPrice!.isOnSale && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded font-medium">Sale</span>
              )}
              <span className="text-gray-400 text-xs">· {item.bestPrice!.storeName}</span>
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
                        className={`flex justify-between items-center p-3 rounded-lg border border-gray-200 ${!price.isAvailable ? 'bg-gray-100 opacity-70' : 'bg-white'}`}
                      >
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            {price.storeName}
                            {price.isOnSale && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded font-medium">Sale</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {price.quantity} {price.unitType} for {formatPrice(price.totalPrice)}
                            {price.isOverridden && <span className="text-blue-600 ml-1">(custom)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(price.recordedAt)} · {price.userName}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <p className={`font-bold ${price.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                            {formatPricePerUnit(price.pricePerUnit)}/{price.unitType}
                          </p>
                          {confirmingPriceId === price.id ? (
                            <div ref={confirmRef} className="mt-1 flex text-xs rounded border border-gray-300 overflow-hidden divide-x divide-gray-300">
                              <button
                                type="button"
                                onClick={() => { void (price.isAvailable ? handleMarkUnavailable(price.id) : handleMarkAvailable(price.id)); }}
                                className={`px-2 py-1 ${price.isAvailable ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                              >
                                {price.isAvailable ? '⊘ Unavail' : '✓ Avail'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { void handleDeletePrice(price.id); }}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600"
                              >
                                🗑
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingPriceId(price.id)}
                              className="mt-1 text-xs px-2 py-1 bg-gray-100 border border-gray-300 text-gray-500 rounded hover:bg-gray-200"
                            >
                              🗑?
                            </button>
                          )}
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
