'use client';

import { useState, useEffect } from 'react';

// Define the User Type to match your DB
interface RequestUser {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  nicNumber: string;
  address: string;
  verification: {
    nicFront: string;
    businessReg: string;
  };
  createdAt: string;
}

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<RequestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<RequestUser | null>(null); // For "View Details" Modal

  // 1. Fetch Requests from API
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Handle Approve/Reject Actions
  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    const confirmMsg = action === 'APPROVE' 
      ? "Are you sure you want to APPROVE this salon?" 
      : "Are you sure you want to REJECT this application?";

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (res.ok) {
        alert(`Successfully ${action}D!`);
        fetchRequests(); // Refresh the list immediately
        setSelectedUser(null); // Close modal if open
      }
    } catch (error) {
      alert("Action failed. Please try again.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Requests...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending Salon Requests</h1>

      {requests.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg shadow border text-gray-500">
          No pending requests found. ✅
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* TABLE HEADER - Matches your Screenshot Fields */}
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4">Salon Owner</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Date Applied</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            
            {/* TABLE BODY */}
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {requests.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition">
                  
                  {/* Column 1: Salon Owner (Name & Email) */}
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  
                  {/* Column 2: Contact (Phone & Address) */}
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{user.contactNumber || "N/A"}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{user.address}</div>
                  </td>
                  
                  {/* Column 3: Date Applied */}
                  <td className="p-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  
                  {/* Column 4: Actions (Buttons) */}
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-medium text-xs transition border border-blue-200"
                    >
                      View Details
                    </button>
                    
                    <button 
                      onClick={() => handleAction(user._id, 'APPROVE')}
                      className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium text-xs transition shadow-sm"
                    >
                      Approve
                    </button>

                    <button 
                      onClick={() => handleAction(user._id, 'REJECT')}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 font-medium text-xs transition border border-red-200"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- "VIEW DETAILS" POPUP MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg text-gray-800">Application Details</h3>
               <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                    <p className="font-medium text-gray-800">{selectedUser.name}</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                    <p className="font-medium text-gray-800">{selectedUser.email}</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                    <p className="font-medium text-gray-800">{selectedUser.contactNumber}</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">NIC Number</label>
                    <p className="font-medium text-gray-800">{selectedUser.nicNumber}</p>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                    <p className="font-medium text-gray-800">{selectedUser.address}</p>
                </div>

                {/* Documents Section */}
                <div className="col-span-2 border-t pt-4">
                    <h4 className="font-bold text-sm text-gray-800 mb-3">Submitted Documents</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {/* NIC Image */}
                        <div className="border rounded p-3 text-center bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2 font-bold">NIC Document</p>
                            {selectedUser.verification?.nicFront ? (
                                <img src={selectedUser.verification.nicFront} alt="NIC" className="h-32 mx-auto object-cover rounded shadow-sm"/>
                            ) : (
                                <span className="text-red-400 text-xs italic">Not Uploaded</span>
                            )}
                        </div>

                        {/* Business Registration Image */}
                        <div className="border rounded p-3 text-center bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2 font-bold">Business Registration</p>
                            {selectedUser.verification?.businessReg ? (
                                <img src={selectedUser.verification.businessReg} alt="BR" className="h-32 mx-auto object-cover rounded shadow-sm"/>
                            ) : (
                                <span className="text-red-400 text-xs italic">Not Uploaded</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button 
                  onClick={() => handleAction(selectedUser._id, 'REJECT')}
                  className="px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 font-medium text-sm transition"
                >
                    Reject Application
                </button>
                <button 
                  onClick={() => handleAction(selectedUser._id, 'APPROVE')}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm transition shadow-lg"
                >
                    Approve Salon
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}