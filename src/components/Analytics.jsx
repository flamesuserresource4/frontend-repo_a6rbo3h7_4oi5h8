import React, { useMemo, useRef, useState } from 'react';
import { BarChart3, Download, Upload, Info, TrendingUp, TrendingDown, Settings } from 'lucide-react';

function Stat({ label, value, hint, positive }) {
  return (
    <div className="bg-gray-50 rounded-lg border p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {hint && (
        <div className={`mt-1 inline-flex items-center gap-1 text-xs ${positive ? 'text-emerald-700' : 'text-amber-700'}`}>
          {positive ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {hint}
        </div>
      )}
    </div>
  );
}

export default function Analytics({ products, sales, shopInfo, setShopInfo, setProducts }) {
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef(null);

  // Revenue totals
  const totalRevenue = useMemo(() => sales.reduce((s, x) => s + (x.total || 0), 0), [sales]);

  // Month and Year breakdown
  const now = new Date();
  const monthRevenue = useMemo(() => {
    const m = now.getMonth();
    const y = now.getFullYear();
    return sales.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === m && d.getFullYear() === y;
    }).reduce((a, b) => a + b.total, 0);
  }, [sales]);

  const yearRevenue = useMemo(() => {
    const y = now.getFullYear();
    return sales.filter(s => new Date(s.date).getFullYear() === y).reduce((a, b) => a + b.total, 0);
  }, [sales]);

  // Revenue comparison with last sale
  const last = sales[sales.length - 1];
  const prev = sales[sales.length - 2];
  const diffHint = last && prev ? `${((last.total - prev.total) >= 0 ? '+' : '')}${(last.total - prev.total).toFixed(2)} vs last` : '';
  const diffPositive = !last || !prev ? true : (last.total - prev.total) >= 0;

  const lowStock = useMemo(() => products.filter(p => Number(p.stock) <= Number(p.lowStockThreshold || 0)), [products]);

  const exportBackup = () => {
    const data = { products, sales, shopInfo, version: 1, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invento-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.products || !data.sales) throw new Error('Invalid backup file');
        // Merge or replace? We'll replace for simplicity
        localStorage.setItem('invento_products', JSON.stringify(data.products));
        localStorage.setItem('invento_sales', JSON.stringify(data.sales));
        localStorage.setItem('invento_shop', JSON.stringify(data.shopInfo || {}));
        // Force hard reload to propagate state
        window.location.reload();
      } catch (err) {
        alert('Failed to restore backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleShopSave = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setShopInfo({
      name: form.get('name')?.toString() || '',
      tagline: form.get('tagline')?.toString() || '',
      contact: form.get('contact')?.toString() || ''
    });
    setShowSettings(false);
  };

  const addSampleData = () => {
    // Only if no products
    if (products.length > 0) return;
    const sample = [
      { id: crypto.randomUUID(), name: 'Notebook (A5)', sku: 'NB-A5', price: 89, stock: 50, lowStockThreshold: 10 },
      { id: crypto.randomUUID(), name: 'Gel Pen (Blue)', sku: 'GP-BLUE', price: 15, stock: 200, lowStockThreshold: 30 },
      { id: crypto.randomUUID(), name: 'Stapler', sku: 'ST-01', price: 149, stock: 18, lowStockThreshold: 5 },
      { id: crypto.randomUUID(), name: 'Marker (Black)', sku: 'MK-BLK', price: 25, stock: 100, lowStockThreshold: 20 }
    ];
    setProducts(sample);
  };

  return (
    <section className="bg-white rounded-xl shadow p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Settings</h2>
          <p className="text-sm text-gray-600">Track performance, handle backups, and manage shop details.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black"><Settings size={16}/> Shop Info</button>
          <button onClick={exportBackup} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"><Download size={16}/> Backup</button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"><Upload size={16}/> Restore</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e)=>{if(e.target.files?.[0]) importBackup(e.target.files[0]);}} />
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} />
        <Stat label="This Month" value={`₹${monthRevenue.toFixed(2)}`} />
        <Stat label="This Year" value={`₹${yearRevenue.toFixed(2)}`} />
        <Stat label="Last Sale" value={sales.length ? `₹${(sales[sales.length-1].total).toFixed(2)}` : '—'} hint={diffHint} positive={diffPositive} />
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="flex items-center gap-2 font-semibold text-gray-800"><BarChart3 size={18}/> Recent Sales</div>
          <div className="mt-3 max-h-64 overflow-auto divide-y">
            {sales.slice().reverse().map(s => (
              <div key={s.id} className="py-2 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{new Date(s.date).toLocaleString()}</div>
                  <div className="text-gray-500">{s.items.length} items</div>
                </div>
                <div className="font-semibold">₹{s.total.toFixed(2)}</div>
              </div>
            ))}
            {sales.length === 0 && <div className="text-sm text-gray-500">No sales yet.</div>}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="flex items-center gap-2 font-semibold text-gray-800"><Info size={18}/> Low Stock Alerts</div>
          <div className="mt-3 max-h-64 overflow-auto divide-y">
            {lowStock.map(p => (
              <div key={p.id} className="py-2 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-gray-500">SKU: {p.sku}</div>
                </div>
                <div className="text-amber-700 font-semibold">{p.stock} left</div>
              </div>
            ))}
            {lowStock.length === 0 && <div className="text-sm text-gray-500">All good — no low stock items.</div>}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Shop Information</div>
                <div className="text-sm text-gray-500">Shown on every invoice</div>
              </div>
              <button onClick={() => setShowSettings(false)} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">Close</button>
            </div>
            <form onSubmit={handleShopSave} className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-700">Shop Name</label>
                <input name="name" defaultValue={shopInfo?.name || ''} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Tagline</label>
                <input name="tagline" defaultValue={shopInfo?.tagline || ''} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Contact</label>
                <input name="contact" defaultValue={shopInfo?.contact || ''} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <button type="submit" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
                <button type="button" onClick={addSampleData} className="text-sm text-gray-600 hover:underline">Load sample data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
