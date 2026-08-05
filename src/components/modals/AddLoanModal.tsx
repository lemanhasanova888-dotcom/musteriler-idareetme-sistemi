import React, { useState } from 'react';
import { Customer } from '../../types/customer';
import { addLoanToCustomer } from '../../services/customerStorage';
import { X, Plus, CreditCard } from 'lucide-react';

interface AddLoanModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCustomer: Customer) => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loanCode, setLoanCode] = useState(`KR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [interestRate, setInterestRate] = useState('18');
  const [status, setStatus] = useState<'Aktiv' | 'Gecikmədə' | 'Məhkəmədə' | 'Bağlanıb'>('Aktiv');
  
  const [principal, setPrincipal] = useState('');
  const [interest, setInterest] = useState('');
  const [commission, setCommission] = useState('0');
  const [penalty, setPenalty] = useState('0');
  const [fee, setFee] = useState('0');
  const [overdueDays, setOverdueDays] = useState('0');

  if (!isOpen) return null;

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setPrincipal(val);
      const rate = Number(interestRate) || 18;
      const calculatedInterest = (num * (rate / 100)).toFixed(2);
      setInterest(calculatedInterest);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Zəhmət olmasa kredit məbləğini daxil edin.');
      return;
    }

    const updated = addLoanToCustomer(customer.id, {
      code: loanCode || `KR-${Date.now().toString().slice(-4)}`,
      issueDate,
      amount: numAmount,
      termMonths: Number(termMonths) || 12,
      interestRate: Number(interestRate) || 18,
      status,
      overdueDays: Number(overdueDays) || 0,
      remainingDebt: {
        principal: Number(principal) || numAmount,
        interest: Number(interest) || 0,
        commission: Number(commission) || 0,
        penalty: Number(penalty) || 0,
        fee: Number(fee) || 0,
      },
    });

    if (updated) {
      onSuccess(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Yeni Kredit Əlavə Et</h3>
              <p className="text-xs text-slate-400">Müştəri: {customer.lastName} {customer.firstName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kredit Kodu
              </label>
              <input
                type="text"
                required
                value={loanCode}
                onChange={(e) => setLoanCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Verilmə Tarixi
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kredit Məbləği (AZN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Müddət (Aylarla)
              </label>
              <input
                type="number"
                required
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                İllik Faiz (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Aktiv' | 'Gecikmədə' | 'Məhkəmədə' | 'Bağlanıb')
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
              >
                <option value="Aktiv">Aktiv</option>
                <option value="Gecikmədə">Gecikmədə</option>
                <option value="Məhkəmədə">Məhkəmədə</option>
                <option value="Bağlanıb">Bağlanıb</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Qalıq Borc Məlumatları
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Əsas Borc
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Faiz Borcu
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Komissiya
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Cərimə
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Rüsum
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Gecikmə (Gün)
                </label>
                <input
                  type="number"
                  value={overdueDays}
                  onChange={(e) => setOverdueDays(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>
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
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Kredit Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
