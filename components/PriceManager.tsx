import React, { useState } from 'react';
import { PriceItem } from '../types';
import { Plus, Trash2, Edit2, Save, X, Tag } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Header Action */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-bold text-slate-800">Daily Prices</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-green-600 text-white shadow-green-200 hover:shadow-md'}`}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'New Item'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-green-100 animate-in">
          <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold text-sm">
             <Tag size={16} /> Add New Vegetable
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
                <input 
                  placeholder="Item Name (e.g. Potato)" 
                  className="w-full p-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-green-500 font-medium placeholder:text-slate-400"
                  value={newForm.name || ''}
                  onChange={e => setNewForm({...newForm, name: e.target.value})}
                  autoFocus
                />
            </div>
            <input 
              type="number" 
              placeholder="Price" 
              className="p-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-green-500 font-medium"
              value={newForm.price || ''}
              onChange={e => setNewForm({...newForm, price: parseFloat(e.target.value)})}
            />
             <select 
              className="p-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-green-500 font-medium text-slate-600"
              value={newForm.unit}
              onChange={e => setNewForm({...newForm, unit: e.target.value as any})}
            >
              <option value="kg">Per kg</option>
              <option value="g">Per g</option>
              <option value="pc">Per pc</option>
              <option value="bunch">Per bunch</option>
              <option value="dozen">Per dozen</option>
            </select>
          </div>
          <button onClick={handleAdd} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition">Save Item</button>
        </div>
      )}

      <div className="space-y-2">
        {prices.map(item => (
          <div key={item.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
            {editingId === item.id ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex gap-2">
                   <input 
                    className="p-2 bg-slate-50 border rounded-lg w-full font-bold text-slate-800"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                  <input 
                    type="number"
                    className="p-2 bg-slate-50 border rounded-lg w-24 font-bold text-slate-800"
                    value={editForm.price}
                    onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                  />
                </div>
                 <div className="flex gap-2 justify-end items-center">
                   <select 
                      className="p-2 bg-slate-50 border rounded-lg text-sm text-slate-600"
                      value={editForm.unit}
                      onChange={e => setEditForm({...editForm, unit: e.target.value as any})}
                    >
                      <option value="kg">/kg</option>
                      <option value="g">/g</option>
                      <option value="pc">/pc</option>
                      <option value="bunch">/bunch</option>
                      <option value="dozen">/dozen</option>
                    </select>
                    <div className="flex gap-1 ml-2">
                        <button onClick={handleSaveEdit} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Save size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X size={18} /></button>
                    </div>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-base">{item.name}</div>
                    <div className="text-xs text-slate-500 font-medium">
                         <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">₹{item.price}</span> / {item.unit}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(item)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};