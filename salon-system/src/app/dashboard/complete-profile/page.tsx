'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  // Controls the View: 'LOADING' | 'VIEW' | 'EDIT'
  const [viewState, setViewState] = useState('LOADING');
  const [loading, setLoading] = useState(false);
  const nicInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nicNumber: '',
    address: '',
    nicImage: '', 
  });

  // 1. Load Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/complete-profile');
        const data = await res.json();
        
        if (res.ok && data) {
          setFormData({
            name: data.name || session?.user?.name || '',
            phone: data.phone || '',
            nicNumber: data.nicNumber || '',
            address: data.address || '',
            nicImage: data.nicImage || '',
          });

          // Logic: If they have a phone number, show the View Card. Otherwise, show Form.
          if (data.phone) {
            setViewState('VIEW');
          } else {
            setViewState('EDIT');
          }
        } else {
            setViewState('EDIT'); // Fallback to Edit if fetch fails
        }
      } catch  {
        setViewState('EDIT');
      }
    };

    if (session) fetchProfile();
  }, [session]);

  // 2. Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File max size is 2MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, nicImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Save Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Update failed");

      // Update session locally so name changes appear instantly
      await update({ name: formData.name, status: 'ACTIVE' });

      alert("✅ Profile Updated Successfully!");
      
      // 👇 CRITICAL: Stay on this page and switch to View Mode
      setViewState('VIEW'); 

    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (viewState === 'LOADING') return <div className="p-10 text-center text-gray-500">Loading Profile...</div>;

  // ==========================
  // VIEW MODE (Read Only)
  // ==========================
  if (viewState === 'VIEW') {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-slate-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-sm text-gray-500">Manage your account information</p>
                </div>
                <button 
                    onClick={() => setViewState('EDIT')}
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"
                >
                    ✎ Edit Details
                </button>
            </div>

            {/* Content Body */}
            <div className="p-8">
                {/* Identity Section */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-white shadow-md">
                        {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{session?.user?.email}</span>
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {session?.user?.role?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone Number</label>
                        <p className="text-lg font-medium text-gray-800 mt-1">{formData.phone || "Not provided"}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">NIC Number</label>
                        <p className="text-lg font-medium text-gray-800 mt-1">{formData.nicNumber || "Not provided"}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Address</label>
                        <p className="text-lg font-medium text-gray-800 mt-1">{formData.address || "Not provided"}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // ==========================
  // EDIT MODE (Form)
  // ==========================
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="bg-slate-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
                <p className="text-sm text-gray-500">Update your personal details</p>
            </div>
            {/* Show Cancel only if we have data to go back to */}
            {formData.phone && (
                <button 
                    onClick={() => setViewState('VIEW')}
                    className="text-gray-500 hover:text-gray-800 text-sm font-medium transition"
                >
                    Cancel
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                    type="text" required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>

            {/* Phone & NIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                        type="text" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                    <input 
                        type="text" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                        value={formData.nicNumber}
                        onChange={(e) => setFormData({...formData, nicNumber: e.target.value})}
                    />
                </div>
            </div>

            {/* Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
            </div>

            {/* NIC Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIC Document</label>
                <div 
                  onClick={() => nicInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition hover:bg-gray-50 ${formData.nicImage ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                >
                    <input ref={nicInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                    <div className="text-2xl mb-2">🆔</div>
                    <p className="text-sm font-medium text-gray-600">
                        {formData.nicImage ? "✔ Image Selected (Ready to Save)" : "Click to Upload NIC Image"}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-slate-800 transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}