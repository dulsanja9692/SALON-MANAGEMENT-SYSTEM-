'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, Search, RefreshCw, MapPin, Phone, Mail, 
  Store, Trash2, Edit, Eye, XCircle, User
} from 'lucide-react';

interface Branch {
  _id: string;
  name: string;
  type: string;
  address: string;
  contactNumber: string;
  email: string;
  salonId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Salon {
  _id: string;
  name: string;
  email: string;
}

export default function BranchesPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // FIX: Default 'type' set to 'Main Branch' so DB doesn't reject it
  const [formData, setFormData] = useState({
    name: '', 
    type: 'Main Branch', 
    address: '',
    contactNumber: '',
    email: '',
    salonId: '', 
    status: true 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const branchRes = await fetch('/api/branches', { 
        cache: 'no-store', headers: { 'Pragma': 'no-cache' }
      });
      if (branchRes.ok) setBranches(await branchRes.json());

      if (isSuperAdmin) {
         const salonRes = await fetch('/api/admin/salons/list'); 
         if (salonRes.ok) {
            setSalons(await salonRes.json());
         }
      }
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]); 

  const resetForm = () => {
    setFormData({ name: '', type: 'Main Branch', address: '', contactNumber: '', email: '', salonId: '', status: true });
    setIsEditing(false);
    setIsViewOnly(false);
    setSelectedBranchId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      type: branch.type || 'Main Branch',
      address: branch.address,
      contactNumber: branch.contactNumber,
      email: branch.email,
      salonId: branch.salonId || '', 
      status: branch.status === 'ACTIVE'
    });
    setIsEditing(true);
    setIsViewOnly(false);
    setSelectedBranchId(branch._id);
    setShowModal(true);
  };

  const handleView = (branch: Branch) => {
    handleEdit(branch);
    setIsViewOnly(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedBranchId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedBranchId) return;
    try {
      const res = await fetch(`/api/branches/${selectedBranchId}`, { method: 'DELETE' });
      if (res.ok) {
        setBranches(branches.filter(b => b._id !== selectedBranchId));
        setShowDeleteModal(false);
      } else {
        alert("Failed to delete branch");
      }
    } catch {
      alert("Error deleting branch");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) { setShowModal(false); return; }

    try {
      const endpoint = isEditing && selectedBranchId 
        ? `/api/branches/${selectedBranchId}` 
        : '/api/branches';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(isEditing ? "Branch Updated!" : "Branch Created!");
        setShowModal(false);
        fetchData(); 
        resetForm();
      } else {
        alert("Operation Failed: Please check your inputs.");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-5 py-2 bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition shadow-sm font-bold text-sm">
            <Plus size={18} /> Add Branch
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search branch name or address..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            <div className="col-span-3 py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>
        ) : filteredBranches.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Store className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 font-medium">No branches found.</p>
            </div>
        ) : (
            filteredBranches.map((branch) => (
                <div key={branch._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 to-amber-400"></div>
                    <div className="flex justify-between items-start mb-4 mt-2">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm"><Store size={20} /></div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${branch.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{branch.status}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-0.5">{branch.name}</h3>
                    <p className="text-xs text-orange-500 font-medium mb-4">{branch.type}</p>
                    <div className="space-y-3 text-sm text-gray-500 mb-6">
                        <div className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" /><span className="leading-tight">{branch.address}</span></div>
                        <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400 shrink-0" /><span>{branch.contactNumber}</span></div>
                        <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400 shrink-0" /><span className="truncate">{branch.email}</span></div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                        <button onClick={() => handleView(branch)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="View"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(branch)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteClick(branch._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-auto" title="Delete"><Trash2 size={18} /></button>
                    </div>
                </div>
            ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 {isViewOnly ? "Branch Details" : isEditing ? "Edit Branch" : "Add New Branch"}
               </h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition"><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {isSuperAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Select Salon Owner <span className="text-orange-500">*</span></label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <select required 
                            className="w-full border border-gray-300 rounded-lg pl-11 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white transition-all disabled:bg-gray-50"
                            value={formData.salonId} 
                            onChange={e => setFormData({...formData, salonId: e.target.value})} 
                            disabled={isViewOnly}
                        >
                            <option value="" disabled>Select Active Salon</option>
                            {salons.length > 0 ? (
                                salons.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)
                            ) : (
                                <option value="" disabled>Loading Salons...</option>
                            )}
                        </select>
                    </div>
                  </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Branch Name <span className="text-orange-500">*</span></label>
                <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input required type="text" placeholder="eg. Tezlaa-Branch1001" 
                        className="w-full border border-gray-300 rounded-lg pl-11 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly}
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address <span className="text-orange-500">*</span></label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input required type="text" placeholder="eg. No.31/2, Colombo 5" 
                        className="w-full border border-gray-300 rounded-lg pl-11 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50"
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={isViewOnly}
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number <span className="text-orange-500">*</span></label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input required type="text" placeholder="0714457845" 
                        className="w-full border border-gray-300 rounded-lg pl-11 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50"
                        value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} disabled={isViewOnly}
                    />
                </div>
              </div>

               <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email <span className="text-orange-500">*</span></label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input required type="email" placeholder="eg. info@tezlaa.com" 
                        className="w-full border border-gray-300 rounded-lg pl-11 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isViewOnly}
                    />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <span className="text-sm font-bold text-gray-700">Status</span>
                 <button type="button" onClick={() => !isViewOnly && setFormData({...formData, status: !formData.status})}
                    disabled={isViewOnly}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${formData.status ? 'bg-orange-500' : 'bg-gray-300'} ${isViewOnly ? 'opacity-60' : ''}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.status ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-50 mt-4">
                 {isViewOnly ? (
                     <button type="button" onClick={() => setShowModal(false)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm">Close</button>
                 ) : (
                     <>
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 bg-white text-orange-600 border border-orange-600 rounded-lg font-bold text-sm shadow-sm hover:bg-orange-50 transition">
                            {isEditing ? "Update Branch" : "Create Branch"}
                        </button>
                     </>
                 )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Branch?</h3>
                <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this branch? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-sm text-gray-700">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}