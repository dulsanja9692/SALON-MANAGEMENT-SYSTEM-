"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { Calendar, Clock, User, Scissors, CreditCard, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import StepIndicator from './StepIndicator';
import { SERVICES_DATA, STAFF_DATA, TIME_SLOTS, Service, Staff } from '@/lib/mockData';

interface BookingSelection {
  service: Service | null;
  staff: Staff | null;
  date: string | null;
  time: string | null;
}

export default function BookingWizard() {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Selection State with Type Safety
  const [selection, setSelection] = useState<BookingSelection>({
    service: null,
    staff: null,
    date: null,
    time: null
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 800); // Simulate API latency
  }, []);

  // Generic handler for updating state
  const handleSelection = (field: keyof BookingSelection, value: Service | Staff | string | null) => {
    setSelection(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) return (
    <div className="min-h-100 flex flex-col items-center justify-center text-gray-500">
      <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
      <p>Loading Velora Services...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      
      {/* Top Section */}
      <div className="bg-gray-50 p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">New Appointment</h2>
        <StepIndicator currentStep={step} steps={['Service', 'Professional', 'Date & Time', 'Review']} />
      </div>

      <div className="p-8 min-h-screen">
        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Scissors size={20} className="text-blue-600" /> Select a Treatment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES_DATA.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => handleSelection('service', service)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    selection.service?.id === service.id 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' 
                    : 'border-gray-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900">{service.name}</span>
                    <span className="font-bold text-blue-600">{formatCurrency(service.price)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-xs text-gray-700">{service.category}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {service.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: STAFF */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Choose Professional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {STAFF_DATA.map((staff) => (
                <div 
                  key={staff.id}
                  onClick={() => handleSelection('staff', staff)}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
                    selection.staff?.id === staff.id 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-100 hover:border-blue-300'
                  }`}
                >
                  {/* FIXED IMAGE COMPONENT SECTION */}
                  <div className="relative w-20 h-20 rounded-full bg-gray-200 mb-3 overflow-hidden shadow-sm">
                    {staff.image ? (
                      <Image 
                        src={staff.image} 
                        alt={staff.name} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  {/* END FIXED SECTION */}
                  
                  <p className="font-bold text-gray-900 text-sm">{staff.name}</p>
                  <p className="text-xs text-gray-500 mb-1">{staff.role}</p>
                  {staff.rating && <span className="text-xs font-medium text-amber-500">★ {staff.rating}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> Schedule Appointment
            </h3>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  onChange={(e) => handleSelection('date', e.target.value)}
                  value={selection.date || ''}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleSelection('time', slot)}
                      className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all ${
                        selection.time === slot 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY */}
        {step === 4 && (
          <div className="animate-in fade-in zoom-in duration-300 max-w-md mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Scissors size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Treatment</p>
                  <p className="font-bold text-gray-900">{selection.service?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Professional</p>
                  <p className="font-bold text-gray-900">{selection.staff?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-bold text-gray-900">{selection.date} at {selection.time}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-gray-600">Total Price</span>
                <span className="text-2xl font-black text-blue-600">{selection.service?.price ? formatCurrency(selection.service.price) : '-'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
            step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft size={20} /> Back
        </button>

        {step < 4 ? (
          <button 
            onClick={nextStep}
            disabled={
              (step === 1 && !selection.service) ||
              (step === 2 && !selection.staff) ||
              (step === 3 && (!selection.date || !selection.time))
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Next Step <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            onClick={() => alert("Booking Confirmed!")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition-all"
          >
            Confirm & Pay <CreditCard size={20} />
          </button>
        )}
      </div>
    </div>
  );
}