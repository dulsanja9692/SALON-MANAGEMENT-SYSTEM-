'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, Scissors, Trash2, Tag, Clock } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: string;
  status: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', duration: '30 mins' });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services', { cache: 'no-store' });
      if (res.ok) setServices(await res.json());
    } catch {
      console.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    setFormData({ name: '', price: '', duration: '30 mins' });
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this service?")) return;
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    fetchServices();
  };

  return (
    <div className="p-8 max-w-screen-2xl mx-auto min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Services Menu</h1>
        <div className="flex gap-3">
            <button onClick={fetchServices} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-sm"><RefreshCw size={16}/> Refresh</button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-bold text-sm"><Plus size={18}/> Add Service</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? <div className="col-span-full text-center py-20">Loading Services...</div> : 
         services.length === 0 ? <div className="col-span-full text-center py-20 text-gray-500">No services added yet.</div> :
         services.map((service) => (
            <div key={service._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center"><Scissors size={20}/></div>
                    <button onClick={() => handleDelete(service._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
                <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Tag size={14}/> LKR {service.price}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {service.duration}</span>
                </div>
            </div>
         ))
        }
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="font-bold text-lg mb-4">Add New Service</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-xs font-bold mb-1">Service Name</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="e.g. Haircut"/></div>
                    <div><label className="block text-xs font-bold mb-1">Price (LKR)</label><input required type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} placeholder="1500"/></div>
                    <div><label className="block text-xs font-bold mb-1">Duration</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})}><option>15 mins</option><option>30 mins</option><option>45 mins</option><option>1 hour</option><option>1.5 hours</option><option>2 hours</option></select></div>
                    <div className="flex gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button type="submit" className="flex-1 py-2 bg-pink-600 text-white rounded-lg">Save</button></div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}