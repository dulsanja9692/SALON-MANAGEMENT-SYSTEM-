'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, User, MapPin, Phone, Mail, RefreshCw } from 'lucide-react';

interface SalonRequest {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  salonId?: {
    name: string;
    address: string;
  };
  createdAt: string;
  status: string;
}

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<SalonRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH REQUESTS ---
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetches users with status 'PENDING_APPROVAL'
      const res = await fetch('/api/admin/requests'); 
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --- HANDLE APPROVE ---
  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((req) => req._id !== userId));
        alert("Salon Approved Successfully!");
      } else {
        alert("Failed to approve request.");
      }
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  // --- HANDLE REJECT (DELETE) ---
  const handleReject = async (userId: string) => {
    // Confirm deletion
    const isConfirmed = confirm("Are you sure you want to REJECT this salon? \n\nThis will permanently DELETE their account and all data from the system.");
    
    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/admin/requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        // Remove from list immediately
        setRequests((prev) => prev.filter((req) => req._id !== userId));
        alert("Request rejected and deleted.");
      } else {
        alert("Failed to reject request.");
      }
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <Clock size={24} />
            </div>
            Pending Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-1">Review and approve new salon registrations.</p>
        </div>

        <button 
          onClick={fetchRequests} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
        >
          <RefreshCw size={16} /> Refresh List
        </button>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
           <p className="text-gray-500 text-sm font-medium">Checking for new requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm text-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <CheckCircle size={32} className="text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">All Caught Up!</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">
            There are no pending salon requests at the moment.
          </p>
        </div>
      ) : (
        /* GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              
              {/* Decorative Top Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-pink-500 to-rose-400"></div>

              {/* Card Header: Avatar & Date */}
              <div className="flex justify-between items-start mb-5 mt-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-slate-200">
                    {req.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight truncate w-40" title={req.name}>{req.name}</h3>
                    <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                      Waiting Approval
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="font-medium text-gray-800">
                    {req.salonId?.name || "Salon Name Pending"}
                  </span>
                </div>
                
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="truncate" title={req.email}>{req.email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <span>{req.contactNumber || "No Contact"}</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="truncate line-clamp-2 text-xs">
                    {req.salonId?.address || "Address Pending"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleReject(req._id)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-200 font-bold text-xs transition-colors"
                >
                  <XCircle size={16} /> Reject
                </button>
                
                <button 
                  onClick={() => handleApprove(req._id)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-colors shadow-lg shadow-slate-900/20"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </div>

              {/* Timestamp at bottom */}
              <div className="text-center mt-4">
                 <p className="text-[10px] text-gray-400 font-medium">
                   Requested on: {new Date(req.createdAt).toLocaleDateString()}
                 </p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}