'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, Trash2, Store, ExternalLink } from 'lucide-react';

interface SalonOwner {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  createdAt: string;
  status: string;
  salonId?: {
    name: string;
    address: string;
  };
}

export default function ActiveSalonsPage() {
  const [salons, setSalons] = useState<SalonOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch('/api/admin/salons/list'); 
        if (res.ok) {
            const data = await res.json();
            setSalons(data);
        }
      } catch (error) {
        console.error("Failed to load salons", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSalons();
  }, []);

  // 👇 FIX: Added safety checks (|| "") to prevent crashing on missing data
  const filteredSalons = salons.filter(owner => {
    const term = searchTerm.toLowerCase();
    
    // Safely get values, defaulting to empty string if missing
    const ownerName = owner.name?.toLowerCase() || "";
    const ownerEmail = owner.email?.toLowerCase() || "";
    const salonName = owner.salonId?.name?.toLowerCase() || "";

    return ownerName.includes(term) || ownerEmail.includes(term) || salonName.includes(term);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        
        {/* Title */}
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <Store size={24} />
            </div>
            Active Salons
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-1">Manage approved businesses.</p>
        </div>
        
        {/* Search Bar Wrapper */}
        <div className="relative w-full md:w-96">
          
          {/* Input Field */}
          <input 
            type="text" 
            placeholder="Search name or email..." 
            className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Icon - ABSOLUTE POSITIONED TO THE RIGHT */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search size={18} />
          </div>

        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
           <p className="text-gray-500 text-sm font-medium">Loading active salons...</p>
        </div>
      ) : filteredSalons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm text-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Store size={32} className="text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">No Active Salons Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">
            New salons will appear here once you approve them in the &quot;Pending Requests&quot; tab.
          </p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalons.map((owner) => (
            <div key={owner._id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              
              {/* Card Top: Status & Avatar */}
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-slate-200">
                  {/* Safely handle missing name */}
                  {(owner.name || "U").charAt(0).toUpperCase()}
                </div>
                <span className="bg-green-50 text-green-600 border border-green-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
              </div>

              {/* Card Info */}
              <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 truncate">
                    {/* Safely handle missing salon info */}
                    {owner.salonId?.name || owner.name + "'s Salon"}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Owner: {owner.name || "Unknown"}</p>
              </div>

              {/* Details */}
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400 mt-0.5" />
                  <span className="truncate w-full hover:text-pink-600 transition-colors cursor-pointer" title={owner.email}>{owner.email || "No Email"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{owner.contactNumber || "No Phone"}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <span className="truncate w-full text-gray-500">
                    {owner.salonId?.address || owner.address || "No Address"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                 <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition-all duration-200 group-hover:border-transparent">
                    View Profile <ExternalLink size={14} />
                 </button>
                 <button className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100">
                    <Trash2 size={18} />
                 </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}