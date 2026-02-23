import { useState } from 'react';
import type { Store, CreatePriceEntryRequest } from '../../types';
import { UNIT_TYPES } from '../../types';
import { StoreSelect } from '../Forms/StoreSelect';
import * as api from '../../services/api';

interface AddItemRowProps {
  stores: Store[];
  onItemCreated: () => void;
  onStoreCreated: () => void;
}

export function AddItemRow({ stores, onItemCreated, onStoreCreated }: AddItemRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [storeId, setStoreId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unitType, setUnitType] = useState<string>('count');
  const [totalPrice, setTotalPrice] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [isOverridden, setIsOverridden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setStoreId(null);
    setQuantity('');
    setUnitType('count');
    setTotalPrice('');
    setPricePerUnit('');
    setIsOverridden(false);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !storeId || !quantity || !totalPrice) return;

    setIsSubmitting(true);
    try {
      // Create the item first
      const newItem = await api.createItem({ name: name.trim() });

      // Then create the price entry
      const priceRequest: CreatePriceEntryRequest = {
        itemId: newItem.id,
        storeId,
        quantity: parseFloat(quantity),
        unitType,
        totalPrice: parseFloat(totalPrice),
        pricePerUnit: isOverridden ? parseFloat(pricePerUnit) : undefined,
      };

      await api.createPriceEntry(priceRequest);
      onItemCreated();
      resetForm();
    } catch (err) {
      console.error('Failed to create item:', err);
    }
    setIsSubmitting(false);
  };

  // Calculate price per unit
  const handleQuantityOrPriceChange = (newQuantity: string, newPrice: string) => {
    if (!isOverridden) {
      const q = parseFloat(newQuantity);
      const p = parseFloat(newPrice);
      if (q > 0 && p > 0) {
        setPricePerUnit((p / q).toFixed(4));
      }
    }
  };

  const handlePricePerUnitChange = (value: string) => {
    setPricePerUnit(value);
    setIsOverridden(true);
  };

  const isValid =
    name.trim() &&
    storeId &&
    quantity &&
    parseFloat(quantity) > 0 &&
    totalPrice &&
    parseFloat(totalPrice) > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add New Item
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Add New Item</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Milk, Paper Towels"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>

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
            onChange={(e) => {
              setQuantity(e.target.value);
              handleQuantityOrPriceChange(e.target.value, totalPrice);
            }}
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
            onChange={(e) => {
              setTotalPrice(e.target.value);
              handleQuantityOrPriceChange(quantity, e.target.value);
            }}
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
            placeholder="Auto"
            step="any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => { void handleSubmit(); }}
          disabled={!isValid || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
