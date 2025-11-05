import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative h-[420px] w-full overflow-hidden rounded-xl shadow-lg">
      <Spline scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
      <div className="absolute inset-0 flex items-end justify-between p-6 sm:p-10">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
            Invento
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-700/90">
            A lightweight, offline-first inventory and billing app — manage products, create invoices, and track revenue directly in your browser.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-3 rounded-lg shadow">
          <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-800">Offline Ready</span>
        </div>
      </div>
    </section>
  );
}
