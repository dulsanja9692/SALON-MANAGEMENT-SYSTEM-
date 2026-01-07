'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const nicInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nicNumber: '',
    address: '',
    nicImage: '',
  });

  // 1. Fetch Data when Modal Opens
  useEffect(() => {
    if (isOpen) {
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
          }
        } catch  {
          console.error("Failed to load profile");
        }
      };
      fetchProfile();
      setIsEditing(false); // Always start in View mode
    }
  }, [isOpen, session]);

  // 2. Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File too large (Max 2MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, nicImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Save Changes
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Update failed");

      await update({ name: formData.name }); // Update session name
      alert("✅ Profile Updated Successfully!");
      setIsEditing(false); // Go back to View Mode
    } catch  {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <p className="text-xs text-gray-500">Manage your account details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold border-4 border-slate-100">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div>
               {isEditing ? (
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="border p-2 rounded text-sm w-full font-bold text-gray-800"
                   placeholder="Your Name"
                 />
               ) : (
                 <h3 className="text-lg font-bold text-gray-800">{formData.name}</h3>
               )}
               <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            
            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border p-2 rounded mt-1 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="077..."
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-100">
                  {formData.phone || "Not Set"}
                </p>
              )}
            </div>

            {/* NIC */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">NIC Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.nicNumber}
                  onChange={(e) => setFormData({...formData, nicNumber: e.target.value})}
                  className="w-full border p-2 rounded mt-1 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="NIC..."
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-100">
                  {formData.nicNumber || "Not Set"}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
              {isEditing ? (
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border p-2 rounded mt-1 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  rows={2}
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-100">
                  {formData.address || "Not Set"}
                </p>
              )}
            </div>

            {/* NIC Image Upload (Only show in Edit Mode) */}
            {isEditing && (
               <div 
                 onClick={() => nicInputRef.current?.click()}
                 className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${formData.nicImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
               >
                 <input ref={nicInputRef} type="file" hidden onChange={handleFileChange} accept="image/*" />
                 <p className="text-xs font-bold text-gray-600">
                   {formData.nicImage ? "✔ Image Updated" : "Click to Update NIC Image"}
                 </p>
               </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg transition"
            >
              ✎ Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}