import { useState, useEffect } from 'react';
import type { Store, CreatePriceEntryRequest } from '../../types';
import { UNIT_TYPES } from '../../types';
import { StoreSelect } from './StoreSelect';

interface PriceEntryFormProps {
  itemId: number;
  stores: Store[];
  onSubmit: (data: CreatePriceEntryRequest) => Promise<void>;
  onCancel: () => void;
  onStoreCreated: () => void;
}

export function PriceEntryForm({
  itemId,
  stores,
  onSubmit,
  onCancel,
  onStoreCreated,
}: PriceEntryFormProps) {
  const [storeId, setStoreId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unitType, setUnitType] = useState<string>('count');
  const [totalPrice, setTotalPrice] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [isOverridden, setIsOverridden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate price per unit when quantity or total price changes
  useEffect(() => {
    if (!isOverridden && quantity && totalPrice) {
      const q = parseFloat(quantity);
      const p = parseFloat(totalPrice);
      if (q > 0 && p > 0) {
        setPricePerUnit((p / q).toFixed(4));
      }
    }
  }, [quantity, totalPrice, isOverridden]);

  const handlePricePerUnitChange = (value: string) => {
    setPricePerUnit(value);
    setIsOverridden(true);
  };

  const handleSubmit = async () => {
    if (!storeId || !quantity || !totalPrice) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        itemId,
        storeId,
        quantity: parseFloat(quantity),
        unitType,
        totalPrice: parseFloat(totalPrice),
        pricePerUnit: isOverridden ? parseFloat(pricePerUnit) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = storeId && quantity && parseFloat(quantity) > 0 && totalPrice && parseFloat(totalPrice) > 0;

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
        <StoreSelect
          stores={stores}
          selectedStoreId={storeId}
          onSelect={setStoreId}
          onStoreCreated={onStoreCreated}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 16"
            step="any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            title="Unit type"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {UNIT_TYPES.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            placeholder="e.g., 4.99"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price/Unit {isOverridden && <span className="text-blue-600">(custom)</span>}
          </label>
          <input
            type="number"
            value={pricePerUnit}
            onChange={(e) => handlePricePerUnitChange(e.target.value)}
            placeholder="Auto-calculated"
            step="any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => { void handleSubmit(); }}
          disabled={!isValid || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Price'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
