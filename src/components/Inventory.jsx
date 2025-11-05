import React, { useMemo, useState } from 'react';
import { Plus, Package, Search, Edit3, Trash2, AlertTriangle } from 'lucide-react';

function ProductRow({ product, onEdit, onDelete }) {
  const low = Number(product.stock) <= Number(product.lowStockThreshold || 0);
  return (
    <tr className={`text-sm ${low ? 'bg-amber-50' : ''}`}>
      <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{product.name}</td>
      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{product.sku}</td>
      <td className="px-3 py-2 text-gray-800">₹{Number(product.price).toFixed(2)}</td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
          <Package size={14} /> {product.stock}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-600">{product.lowStockThreshold || 0}</td>
      <td className="px-3 py-2 flex items-center gap-2">
        {low && (
          <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium">
            <AlertTriangle size={14} /> Low
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button onClick={() => onEdit(product)} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">
          <Edit3 size={14} /> Edit
        </button>
        <button onClick={() => onDelete(product.id)} className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100">
          <Trash2 size={14} /> Delete
        </button>
      </td>
    </tr>
  );
}

export default function Inventory({ products, setProducts }) {
  const empty = { id: '', name: '', sku: '', price: '', stock: '', lowStockThreshold: 5 };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  const resetForm = () => { setForm(empty); setEditingId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price) return;
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...form, id: editingId, price: Number(form.price), stock: Number(form.stock || 0), lowStockThreshold: Number(form.lowStockThreshold || 0) } : p));
    } else {
      const id = crypto.randomUUID();
      setProducts(prev => [{
        id,
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 0)
      }, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ ...p });
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this product?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <section className="bg-white rounded-xl shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-600">Add, update, or remove products. Low stock items are highlighted.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or SKU" className="w-full sm:w-72 pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name" className="col-span-2 md:col-span-2 px-3 py-2 rounded-lg border border-gray-200" />
        <input value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))} placeholder="SKU" className="col-span-1 px-3 py-2 rounded-lg border border-gray-200" />
        <input type="number" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="Price" className="col-span-1 px-3 py-2 rounded-lg border border-gray-200" />
        <input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="Stock" className="col-span-1 px-3 py-2 rounded-lg border border-gray-200" />
        <input type="number" value={form.lowStockThreshold} onChange={e=>setForm(f=>({...f,lowStockThreshold:e.target.value}))} placeholder="Low Stock" className="col-span-1 px-3 py-2 rounded-lg border border-gray-200" />
        <button type="submit" className="col-span-2 md:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus size={18} /> {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="col-span-2 md:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Cancel</button>
        )}
      </form>

      <div className="mt-4 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-gray-500 border-b">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Low</th>
              <th className="px-3 py-2">Alert</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <ProductRow key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
