import React, { useState, useEffect } from 'react';
import { Customer } from './types/customer';
import {
  loadCustomersFromStorage,
  resetDataToDefault,
  getCustomerById,
} from './services/customerStorage';
import { CustomerList } from './components/CustomerList';
import { CustomerProfile } from './components/CustomerProfile';
import { NewCustomerModal } from './components/modals/NewCustomerModal';
import { Users, ShieldCheck, Database, Landmark } from 'lucide-react';

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Sync state from storage
  const refreshCustomers = () => {
    const loaded = loadCustomersFromStorage();
    setCustomers(loaded);

    // If a customer is currently opened, keep their state updated
    if (selectedCustomer) {
      const current = getCustomerById(selectedCustomer.id);
      if (current) {
        setSelectedCustomer(current);
      }
    }
  };

  useEffect(() => {
    refreshCustomers();

    const handleUpdate = () => {
      refreshCustomers();
    };

    window.addEventListener('customers_updated', handleUpdate);
    return () => {
      window.removeEventListener('customers_updated', handleUpdate);
    };
  }, [selectedCustomer?.id]);

  const handleResetData = () => {
    if (confirm('Bütün verilənləri ilkin nümunə məlumatlarına sıfırlamaq istədiyinizə əminsiniz?')) {
      resetDataToDefault();
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-12">
      {/* Top System Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div
            onClick={() => setSelectedCustomer(null)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-white leading-tight tracking-tight flex items-center gap-2">
                Müştərilər Səhifəsi <span className="text-emerald-400 font-mono text-xs font-normal">v1.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Kreditlər, Borclar və İcra İdarəetmə Portalı
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verilənlər bazası: <strong>Aktiv (Local)</strong></span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Sistem Girişi: <strong>Əməkdaş</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedCustomer ? (
          <CustomerProfile
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
            onCustomerUpdated={(updated) => setSelectedCustomer(updated)}
          />
        ) : (
          <CustomerList
            customers={customers}
            onSelectCustomer={(cust) => setSelectedCustomer(cust)}
            onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Modal for creating a new customer */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSuccess={(newCustomer) => {
          setSelectedCustomer(newCustomer);
        }}
      />
    </div>
  );
}
