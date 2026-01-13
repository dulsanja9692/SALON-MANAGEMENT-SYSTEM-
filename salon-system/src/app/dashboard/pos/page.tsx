'use client';

import { ShoppingCart } from 'lucide-react';

export default function POSPage() {
  return (
    <div className="p-8 h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className="h-20 w-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale (POS)</h1>
        <p className="text-gray-500 mt-2">Cashier Interface goes here.</p>
        <button className="mt-6 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 hover:bg-pink-700 transition">
          Start New Sale
        </button>
      </div>
    </div>
  );
}