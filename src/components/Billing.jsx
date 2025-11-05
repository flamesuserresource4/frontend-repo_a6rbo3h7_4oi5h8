import React, { useMemo, useRef, useState } from 'react';
import { Search, PlusCircle, MinusCircle, Printer, Receipt } from 'lucide-react';

function InvoiceView({ shopInfo, cart, total, onPrint }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
          <p className="text-xs text-gray-500">Clean, printable layout</p>
        </div>
        <button onClick={onPrint} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black">
          <Printer size={16} /> Print
        </button>
      </div>
      <div id="invoice-area" className="mt-4 text-sm">
        <div className="text-center">
          <h2 className="text-xl font-bold">{shopInfo?.name || 'Your Shop Name'}</h2>
          <p className="text-gray-600">{shopInfo?.tagline || 'Tagline goes here'}</p>
          <p className="text-gray-500">{shopInfo?.contact || ''}</p>
        </div>
        <div className="mt-4 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-right">{c.qty}</td>
                  <td className="py-2 text-right">₹{c.price.toFixed(2)}</td>
                  <td className="py-2 text-right">₹{(c.qty * c.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Billing({ products, setProducts, sales, setSales, shopInfo }) {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 10);
    return products.filter(p => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)).slice(0, 20);
  }, [products, query]);

  const addToCart = (p) => {
    setCart(prev => {
      const found = prev.find(i => i.id === p.id);
      if (found) {
        if (found.qty < p.stock) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
        return prev; // don't exceed stock
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const total = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // Reduce stock
    const updated = products.map(p => {
      const inCart = cart.find(c => c.id === p.id);
      if (!inCart) return p;
      const newStock = Math.max(0, Number(p.stock) - inCart.qty);
      return { ...p, stock: newStock };
    });
    setProducts(updated);

    const sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cart.map(c => ({ productId: c.id, name: c.name, qty: c.qty, price: c.price, subtotal: c.qty * c.price })),
      total
    };
    setSales(prev => [...prev, sale]);
    setCart([]);
    setQuery('');
    alert('Sale recorded! You can print the invoice.');
  };

  const printInvoice = () => {
    const content = document.getElementById('invoice-area');
    if (!content) return;
    const w = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Invoice</title><style>
      body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji","Segoe UI Emoji"; padding: 24px;}
      table{width:100%; border-collapse: collapse}
      th,td{padding:8px; border-bottom:1px solid #eee; text-align:right}
      th:first-child, td:first-child{text-align:left}
      .title{text-align:center; margin-bottom:16px}
      .total{font-weight:700; font-size:20px}
    </style></head><body>`);
    w.document.write(content.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <section className="bg-white rounded-xl shadow p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Billing</h2>
          <p className="text-sm text-gray-600">Search products, add to cart, and generate printable invoices.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Cart Total</div>
          <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search inventory by name or SKU" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} className="text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{p.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Stock: {p.stock}</div>
                  </div>
                </div>
              </button>
            ))}
            {result.length === 0 && (
              <div className="text-gray-500 text-sm p-3">No matches found.</div>
            )}
          </div>
        </div>
        <div className="md:col-span-1 space-y-3">
          <div className="bg-gray-50 rounded-lg border p-3">
            <div className="flex items-center gap-2 font-semibold text-gray-800"><Receipt size={18}/> Cart</div>
            <div className="mt-2 space-y-2 max-h-72 overflow-auto pr-1">
              {cart.map(i => (
                <div key={i.id} className="flex items-center justify-between bg-white rounded p-2 border">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{i.name}</div>
                    <div className="text-xs text-gray-500">₹{i.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(i.id, -1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200"><MinusCircle size={16}/></button>
                    <div className="w-8 text-center font-medium">{i.qty}</div>
                    <button onClick={() => changeQty(i.id, 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200"><PlusCircle size={16}/></button>
                    <button onClick={() => removeItem(i.id)} className="ml-2 text-xs text-rose-600 hover:underline">Remove</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="text-xs text-gray-500">Cart is empty.</div>}
            </div>
            <button onClick={handleCheckout} disabled={cart.length===0} className="w-full mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700">Checkout & Save</button>
          </div>
          <InvoiceView shopInfo={shopInfo} cart={cart} total={total} onPrint={printInvoice} />
        </div>
      </div>
    </section>
  );
}
