import React, { useState } from 'react';
import { Customer } from '../../types/customer';
import { addNoteToCustomer } from '../../services/customerStorage';
import { X, MessageSquare, Plus } from 'lucide-react';

interface AddNoteModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCustomer: Customer) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [employee, setEmployee] = useState('Cavid Əsgərov');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Zəhmət olmasa qeyd mətni daxil edin.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });

    const updated = addNoteToCustomer(customer.id, {
      date: dateStr,
      time: timeStr,
      employee: employee || 'Əməkdaş',
      content: content.trim(),
    });

    if (updated) {
      setContent('');
      onSuccess(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Yeni Qeyd Əlavə Et</h3>
              <p className="text-xs text-amber-100">
                {customer.lastName} {customer.firstName} ({customer.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-amber-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Qeydi Yazan Əməkdaş <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              placeholder="Ad və Vəzifə"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Qeyd Mətni <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Müştəri ilə danışıq, vəd edilən tarix, zəng məlumatı və s."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Qeydi Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
