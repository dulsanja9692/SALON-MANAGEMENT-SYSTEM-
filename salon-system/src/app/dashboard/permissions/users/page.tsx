'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, Search, RefreshCw, Trash2, Edit, 
  Users, XCircle, Eye, EyeOff, AlertTriangle, CheckCircle, Shield, Store, User as UserIcon
} from 'lucide-react';

interface User {
  _id: string;
  name?: string;
  email: string;
  contactNumber?: string;
  role: string;
  salonId?: string;
  branchId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Salon { _id: string; name: string; email: string; }

// FIX: Handle both formats of IDs to fix empty dropdowns
interface Branch { 
    _id: string; 
    name: string; 
    salonId: string | { _id: string }; 
}

export default function UsersPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isSalonOwner = session?.user?.role === 'SALON_OWNER';

  const [users, setUsers] = useState<User[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]); 
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '', 
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'CASHIER', // Default matched to backend enum
    status: true,
    salonId: '', 
    branchId: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const roleOptions = isSuperAdmin 
    ? [
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
        { label: 'Salon Owner', value: 'SALON_OWNER' },
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Receptionist', value: 'RECEPTIONIST' },
        { label: 'Cashier', value: 'CASHIER' }
      ] 
    : [
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Receptionist', value: 'RECEPTIONIST' },
        { label: 'Cashier', value: 'CASHIER' }
      ];

  const branchRoles = ['MANAGER', 'RECEPTIONIST', 'CASHIER'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/permissions/users', { cache: 'no-store' });
      if (userRes.ok) setUsers(await userRes.json());

      // FIX: Added headers to ensure we get the latest branches immediately
      const branchRes = await fetch('/api/branches', { 
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache' } 
      });
      const branchData = await branchRes.json();
      setAllBranches(branchData);
      
      // If Salon Owner, filter instantly
      if (isSalonOwner && session?.user?.salonId) {
          const ownerBranches = branchData.filter((b: Branch) => {
             const bId = typeof b.salonId === 'object' && b.salonId ? (b.salonId as any)._id : b.salonId;
             return bId === session.user.salonId;
          });
          setFilteredBranches(ownerBranches); 
      }

      if (isSuperAdmin) {
         const salonRes = await fetch('/api/admin/salons/list'); 
         if (salonRes.ok) setSalons(await salonRes.json());
      }
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isSalonOwner, isSuperAdmin, session]);

  useEffect(() => {
    if(session) fetchData();
  }, [session, fetchData]);

  // --- FIX: ROBUST FILTERING ---
  // This logic fixes the empty branch dropdown
  useEffect(() => {
    if (isSuperAdmin && formData.salonId) {
        const relevantBranches = allBranches.filter(b => {
            const bSalonId = typeof b.salonId === 'object' && b.salonId !== null 
                ? (b.salonId as any)._id 
                : b.salonId;
            return bSalonId === formData.salonId;
        });
        setFilteredBranches(relevantBranches);
    } else if (isSuperAdmin && !formData.salonId) {
        setFilteredBranches([]);
    }
  }, [formData.salonId, allBranches, isSuperAdmin]);

  const resetForm = () => {
    setFormData({ 
        username: '', mobile: '', password: '', confirmPassword: '', role: 'CASHIER', status: true,
        salonId: '', branchId: '' 
    });
    setIsEditing(false);
    setIsViewOnly(false);
    setSelectedUserId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.email,
      mobile: user.contactNumber || '',
      password: '', 
      confirmPassword: '',
      role: user.role,
      status: user.status === 'ACTIVE',
      salonId: user.salonId || '',
      branchId: user.branchId || ''
    });
    setIsEditing(true);
    setIsViewOnly(false);
    setSelectedUserId(user._id);
    setShowModal(true);
  };

  const handleView = (user: User) => {
    handleEdit(user);
    setIsViewOnly(true);
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/permissions/users/${selectedUserId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== selectedUserId));
        setShowDeleteModal(false);
        alert("User deleted successfully.");
      } else {
        alert("Failed to delete user.");
      }
    } catch {
      alert("Error deleting user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) { setShowModal(false); return; }
    
    if (!isEditing || formData.password) {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
    }

    if (branchRoles.includes(formData.role)) {
        if (isSuperAdmin && !formData.salonId) {
            alert("Please select a Salon.");
            return;
        }
        if (!formData.branchId) {
            alert("Please assign a Branch to this user.");
            return;
        }
    }

    try {
      const endpoint = isEditing && selectedUserId ? `/api/permissions/users/${selectedUserId}` : '/api/permissions/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(isEditing ? "User Updated Successfully!" : "User Created Successfully!");
        setShowModal(false);
        fetchData();
        resetForm();
      } else {
        alert(data.error || "Operation failed. Check Role validation.");
      }
    } catch {
      alert("Something went wrong.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const inactiveUsers = users.filter(u => u.status !== 'ACTIVE').length;
  const uniqueRoles = new Set(users.map(u => u.role)).size;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          
          <button onClick={handleAddNew} className="flex items-center gap-2 px-5 py-2 bg-white text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition shadow-sm font-bold text-sm">
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Users</p><p className="text-2xl font-bold text-gray-900">{totalUsers}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Active</p><p className="text-2xl font-bold text-gray-900">{activeUsers}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><XCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Inactive</p><p className="text-2xl font-bold text-gray-900">{inactiveUsers}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Shield size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Roles</p><p className="text-2xl font-bold text-gray-900">{uniqueRoles}</p></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
         <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search user..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-sm transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4">Username / Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading Users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-medium text-gray-900">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.contactNumber || "N/A"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.status || 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => handleView(user)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteClick(user._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <Users className="text-pink-600" size={20}/> 
                 {isViewOnly ? "User Details" : isEditing ? "Edit User" : "Add New User"}
               </h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition"><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username (Email)</label>
                <input type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  disabled={isEditing || isViewOnly} 
                />
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Mobile</label>
                 <input type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                   value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                   disabled={isViewOnly}
                 />
              </div>

              {!isViewOnly && (
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Password {isEditing && <span className="font-normal text-gray-400">(Optional)</span>}</label>
                        <div className="relative w-full">
                            <input type={showPassword ? "text" : "password"} required={!isEditing} 
                                className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-600 z-10">
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
                         <div className="relative w-full">
                            <input type={showConfirmPassword ? "text" : "password"} required={!isEditing && formData.password.length > 0} 
                                className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                                value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-600 z-10">
                                {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                      </div>
                  </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value, salonId: '', branchId: ''})}
                    disabled={isViewOnly}
                >
                    <option value="" disabled>Select Role</option>
                    {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {branchRoles.includes(formData.role) && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    
                    {isSuperAdmin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Assign Salon <span className="text-pink-500">*</span></label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                <select required 
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none bg-white transition-all disabled:bg-gray-50"
                                    value={formData.salonId} 
                                    onChange={e => setFormData({...formData, salonId: e.target.value, branchId: ''})} 
                                    disabled={isViewOnly}
                                >
                                    <option value="" disabled>Select Salon Owner</option>
                                    {salons.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Assign Branch <span className="text-pink-500">*</span></label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select required 
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none bg-white transition-all disabled:bg-gray-50"
                                value={formData.branchId} 
                                onChange={e => setFormData({...formData, branchId: e.target.value})} 
                                disabled={isViewOnly || (isSuperAdmin && !formData.salonId)}
                            >
                                <option value="" disabled>
                                    {isSuperAdmin && !formData.salonId ? "Select a Salon first" : "Select Branch"}
                                </option>
                                {filteredBranches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                  </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                 {isViewOnly ? (
                    <button type="button" onClick={() => setShowModal(false)} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-bold">Close Details</button>
                 ) : (
                    <>
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-bold">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2.5 bg-white text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 text-sm font-bold shadow-sm">
                            {isEditing ? "Update User" : "Create User"}
                        </button>
                    </>
                 )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 shadow-md">Delete</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}