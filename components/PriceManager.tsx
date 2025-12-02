import React, { useState } from 'react';
import { PriceItem } from '../types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Props {
  prices: PriceItem[];
  setPrices: (prices: PriceItem[]) => void;
}

export const PriceManager: React.FC<Props> = ({ prices, setPrices }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PriceItem>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<Partial<PriceItem>>({ unit: 'kg' });

  const handleEditClick = (item: PriceItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingId && editForm.name && editForm.price) {
      setPrices(prices.map(p => p.id === editingId ? { ...p, ...editForm } as PriceItem : p));
      setEditingId(null);
    }
  };

  const handleAdd = () => {
    if (newForm.name && newForm.price) {
      const newItem: PriceItem = {
        id: Date.now().toString(),
        name: newForm.name,
        price: Number(newForm.price),
        unit: newForm.unit as any || 'kg',
      };
      setPrices([newItem, ...prices]);
      setIsAdding(false);
      setNewForm({ unit: 'kg' });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this item?")) {
      setPrices(prices.filter(p => p.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Daily Prices</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-700 transition"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-green-50 p-3 rounded-lg mb-4 border border-green-200">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input 
              placeholder="Item Name" 
              className="p-2 border rounded"
              value={newForm.name || ''}
              onChange={e => setNewForm({...newForm, name: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Price" 
              className="p-2 border rounded"
              value={newForm.price || ''}
              onChange={e => setNewForm({...newForm, price: parseFloat(e.target.value)})}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="p-2 border rounded flex-1"
              value={newForm.unit}
              onChange={e => setNewForm({...newForm, unit: e.target.value as any})}
            >
              <option value="kg">Per kg</option>
              <option value="g">Per g</option>
              <option value="pc">Per pc</option>
              <option value="bunch">Per bunch</option>
              <option value="dozen">Per dozen</option>
            </select>
            <button onClick={handleAdd} className="bg-green-600 text-white px-4 rounded font-medium">Save</button>
            <button onClick={() => setIsAdding(false)} className="text-gray-500 px-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="divide-y">
        {prices.map(item => (
          <div key={item.id} className="py-3 flex items-center justify-between">
            {editingId === item.id ? (
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex gap-2">
                   <input 
                    className="p-1 border rounded w-full font-bold"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                  <input 
                    type="number"
                    className="p-1 border rounded w-20"
                    value={editForm.price}
                    onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                  />
                </div>
                 <div className="flex gap-2 justify-end">
                   <select 
                      className="p-1 border rounded text-sm"
                      value={editForm.unit}
                      onChange={e => setEditForm({...editForm, unit: e.target.value as any})}
                    >
                      <option value="kg">/kg</option>
                      <option value="g">/g</option>
                      <option value="pc">/pc</option>
                      <option value="bunch">/bunch</option>
                      <option value="dozen">/dozen</option>
                    </select>
                    <button onClick={handleSaveEdit} className="text-green-600"><Save size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500"><X size={18} /></button>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-500">₹{item.price} / {item.unit}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEditClick(item)} className="text-gray-400 hover:text-blue-500"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
