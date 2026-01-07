'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSalonPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    password: '',
    salonName: '',
    address: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/salons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('✅ Salon & Owner Created Successfully!');
      setTimeout(() => router.push('/dashboard'), 2000); // Redirect after success
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Salon Owner</h2>
      
      {message && <div className="p-3 mb-4 text-sm font-bold bg-gray-100 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Owner Details */}
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" placeholder="Owner Name" required 
            className="p-2 border rounded"
            onChange={e => setFormData({...formData, ownerName: e.target.value})}
          />
          <input 
            type="email" placeholder="Owner Email" required 
            className="p-2 border rounded"
            onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
          />
        </div>
        
        <input 
          type="password" placeholder="Temporary Password" required 
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <hr className="my-4" />

        {/* Salon Details */}
        <input 
          type="text" placeholder="Salon Name" required 
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, salonName: e.target.value})}
        />
        <input 
          type="text" placeholder="Address" 
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, address: e.target.value})}
        />
         <input 
          type="text" placeholder="Contact Number" 
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, contactNumber: e.target.value})}
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
        >
          {loading ? 'Creating...' : 'Create Salon Owner'}
        </button>
      </form>
    </div>
  );
}