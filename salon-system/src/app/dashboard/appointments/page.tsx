'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Calendar, Clock, User, Scissors, 
  Search, XCircle, CheckCircle, RefreshCw 
} from 'lucide-react';

interface Appointment {
  _id: string;
  customerName: string;
  customerMobile: string;
  service: string;
  stylist?: string;
  date: string;
  time: string;
  status: string;
}

interface Service { _id: string; name: string; }

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]); // <--- Added State for Services
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    service: '',
    stylist: '',
    date: '',
    time: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Appointments
      const apptRes = await fetch('/api/appointments', { cache: 'no-store' });
      if (apptRes.ok) setAppointments(await apptRes.json());

      // Fetch Dynamic Services
      const serviceRes = await fetch('/api/services', { cache: 'no-store' });
      if (serviceRes.ok) setServices(await serviceRes.json());

    } catch (error) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Appointment Booked Successfully!");
        setShowModal(false);
        setFormData({ customerName: '', customerMobile: '', service: '', stylist: '', date: '', time: '' });
        fetchData();
      } else {
        alert("Failed to book appointment.");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your bookings</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-sm transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2 bg-white text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 font-bold text-sm shadow-sm transition">
            <Plus size={18} /> New Appointment
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
           <div className="col-span-full py-20 text-center text-gray-500">Loading Appointments...</div>
        ) : appointments.length === 0 ? (
           <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
             <Calendar className="mx-auto mb-2 opacity-20" size={48} />
             No appointments found.
           </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-1 h-full ${appt.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
               <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{appt.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {appt.status}
                  </span>
               </div>
               <h3 className="font-bold text-gray-900 text-lg mb-1">{appt.customerName}</h3>
               <p className="text-sm text-gray-500 mb-4 flex items-center gap-2"><User size={14}/> {appt.customerMobile}</p>
               <div className="space-y-2 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Scissors size={14}/> Service</span><span className="font-medium text-gray-900">{appt.service}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Clock size={14}/> Time</span><span className="font-medium text-gray-900">{appt.time}</span></div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-900">Book Appointment</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition"><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label><input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label><input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500" value={formData.customerMobile} onChange={e => setFormData({...formData, customerMobile: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Date</label><input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Time</label><input required type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
              </div>

              {/* DYNAMIC SERVICE DROPDOWN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Service</label>
                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-pink-500"
                  value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
                    <option value="" disabled>Select Service</option>
                    {services.length > 0 ? (
                        services.map(s => <option key={s._id} value={s.name}>{s.name}</option>)
                    ) : (
                        <option value="" disabled>No services available</option>
                    )}
                </select>
              </div>

              <div><label className="block text-xs font-bold text-gray-700 mb-1">Stylist (Optional)</label><input type="text" placeholder="Staff Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500" value={formData.stylist} onChange={e => setFormData({...formData, stylist: e.target.value})} /></div>

              <div className="flex gap-3 pt-4 border-t border-gray-50 mt-2">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                 <button type="submit" className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg font-bold text-sm hover:bg-pink-700 shadow-sm transition">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}