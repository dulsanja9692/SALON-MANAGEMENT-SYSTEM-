'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import ProfileModal from './ProfileModal'; // 👈 Import the new modal

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 👇 NEW: State for Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "GUEST";
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: '/login', redirect: true });
  };

  return (
    <>
      {/* 👇 1. The Modal Component is rendered here */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center relative z-40">
        <h2 className="text-xl font-semibold text-gray-800">Velora Dashboard</h2>
        
        <div className="flex items-center gap-6" ref={menuRef}>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{userName}</p>
                <p className="text-xs text-gray-500 font-medium">{userRole.replace('_', ' ')}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg border-2 border-slate-200">
                {userName.charAt(0).toUpperCase()}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs text-gray-500 uppercase font-bold">Account</p>
                </div>

                {/* 👇 2. BUTTON TRIGGERS MODAL */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsProfileModalOpen(true); // Open the popup
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2"
                >
                  👤 My Profile
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition flex items-center gap-2"
                >
                  🚪 Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}