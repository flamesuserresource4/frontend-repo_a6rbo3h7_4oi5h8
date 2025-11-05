import React, { useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Analytics from './components/Analytics';

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [products, setProducts] = useLocalState('invento_products', []);
  const [sales, setSales] = useLocalState('invento_sales', []);
  const [shopInfo, setShopInfo] = useLocalState('invento_shop', { name: 'Invento Store', tagline: 'Smart inventory & billing', contact: '' });

  // Derive revenue for quick glance in header
  const revenue = useMemo(() => sales.reduce((s, x) => s + (x.total || 0), 0), [sales]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HeroCover />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Inventory products={products} setProducts={setProducts} />
            <Billing products={products} setProducts={setProducts} sales={sales} setSales={setSales} shopInfo={shopInfo} />
          </div>
          <div className="lg:col-span-1">
            <Analytics products={products} sales={sales} shopInfo={shopInfo} setShopInfo={setShopInfo} setProducts={setProducts} />
          </div>
        </div>

        <footer className="pt-4 text-center text-sm text-gray-500">
          <div>Total Revenue Tracked: <span className="font-semibold text-gray-800">₹{revenue.toFixed(2)}</span></div>
          <div className="mt-1">Invento — offline-first. Data is stored locally in your browser.</div>
        </footer>
      </div>
    </div>
  );
}
