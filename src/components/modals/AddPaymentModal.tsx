import React, { useState } from 'react';
import { Customer, Loan } from '../../types/customer';
import { addPaymentToCustomer } from '../../services/customerStorage';
import { formatAZN } from '../../utils/customerUtils';
import { X, DollarSign, CheckCircle } from 'lucide-react';

interface AddPaymentModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCustomer: Customer) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    customer.loans?.[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [principal, setPrincipal] = useState<string>('');
  const [interest, setInterest] = useState<string>('');
  const [commission, setCommission] = useState<string>('0');
  const [penalty, setPenalty] = useState<string>('0');
  const [fee, setFee] = useState<string>('0');
  const [employee, setEmployee] = useState<string>('Elmir Həsənov');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedLoan = customer.loans?.find((l) => l.id === selectedLoanId);

  // Auto distribute logic if total amount is typed
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      // Default auto breakdown: 70% principal, 30% interest
      setPrincipal((num * 0.7).toFixed(2));
      setInterest((num * 0.3).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Zəhmət olmasa keçərli ödəniş məbləği daxil edin.');
      return;
    }

    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('az-AZ', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const updated = addPaymentToCustomer(customer.id, {
      loanId: selectedLoanId,
      loanCode: selectedLoan?.code || 'Ümumi',
      date: dateStr,
      amount: numAmount,
      principal: Number(principal) || 0,
      interest: Number(interest) || 0,
      commission: Number(commission) || 0,
      penalty: Number(penalty) || 0,
      fee: Number(fee) || 0,
      receiverEmployee: employee || 'Əməkdaş',
      notes,
    });

    if (updated) {
      onSuccess(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Yeni Ödəniş Qəbul Et</h3>
              <p className="text-xs text-emerald-100">
                {customer.lastName} {customer.firstName} ({customer.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {customer.loans && customer.loans.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kredit Seçin
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                {customer.loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    Kredit: {l.code} ({formatAZN(l.amount)}) - Status: {l.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Yekun Ödənilən Məbləğ (AZN) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold text-slate-900"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Ödəniş Paylarının Bölgüsü (Avto / Düzəliş)
            </p>
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
                  Faiz Payı
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
                  Cərimə Payı
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Qəbul Edən Əməkdaş
              </label>
              <input
                type="text"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                placeholder="Əməkdaşın adı"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Qeyd (İstəyə görə)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ödəniş vasitəsi və s."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
            >
              <CheckCircle className="w-4 h-4" /> Ödənişi Təsdiqlə
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
