import React, { useState } from 'react';
import { Customer } from '../../types/customer';
import { createCustomer } from '../../services/customerStorage';
import { X, Plus, UserPlus } from 'lucide-react';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomer: Customer) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [finCode, setFinCode] = useState('');
  const [idSerialNum, setIdSerialNum] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Kişi' | 'Qadın'>('Kişi');
  const [citizenship, setCitizenship] = useState('Azərbaycan');

  const [mobilePhone, setMobilePhone] = useState('');
  const [workCompany, setWorkCompany] = useState('');
  const [workPosition, setWorkPosition] = useState('');
  const [workSalary, setWorkSalary] = useState('');

  const [regAddress, setRegAddress] = useState('');
  const [resAddress, setResAddress] = useState('');
  const [actAddress, setActAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !finCode) {
      alert('Zəhmət olmasa Ad, Soyad və FIN kodu xanalarını doldurun.');
      return;
    }

    if (finCode.trim().length !== 7) {
      alert('FIN kod dəqiq 7 simvoldan ibarət olmalıdır (Məsələn: 7A9K2M1).');
      return;
    }

    const created = createCustomer({
      firstName,
      lastName,
      fatherName,
      motherName,
      finCode: finCode.trim().toUpperCase(),
      idSerialNum,
      birthDate,
      gender,
      citizenship,
      phones: [
        {
          id: `p-${Date.now()}`,
          type: 'Mobil 1',
          number: mobilePhone || '+994 50 000 00 00',
          note: 'Əsas telefon',
        },
      ],
      addresses: {
        registration: regAddress,
        residential: resAddress || regAddress,
        actual: actAddress || regAddress,
      },
      workInfo: {
        company: workCompany,
        position: workPosition,
        salary: Number(workSalary) || 0,
        address: '',
        phone: '',
      },
    });

    onSuccess(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Yeni Müştəri Əlavə Et</h3>
              <p className="text-xs text-slate-400">Şəxsi və əlaqə məlumatlarını daxil edin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Şəxsi Məlumatlar */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Şəxsi Məlumatlar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ad <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Məsələn: Vüqar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Soyad <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Məsələn: Əliyev"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Atasının adı</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Məsələn: Məmməd"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ana adı</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Məsələn: Sevda"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  FIN Kodu (7 simvol) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={finCode}
                  onChange={(e) => setFinCode(e.target.value.toUpperCase())}
                  placeholder="7A9K2M1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ŞV Seriya və Nömrəsi
                </label>
                <input
                  type="text"
                  value={idSerialNum}
                  onChange={(e) => setIdSerialNum(e.target.value)}
                  placeholder="AZE 14829301"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Doğum Tarixi</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cinsi</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Kişi' | 'Qadın')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                >
                  <option value="Kişi">Kişi</option>
                  <option value="Qadın">Qadın</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vətəndaşlıq</label>
                <input
                  type="text"
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Əlaqə və Ünvan */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Əlaqə və Ünvan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mobil Telefon (Əsas)
                </label>
                <input
                  type="text"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="+994 50 123 45 67"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Qeydiyyat Ünvanı</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Bakı ş., Yasamal r.,..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Yaşadığı Ünvan</label>
                <input
                  type="text"
                  value={resAddress}
                  onChange={(e) => setResAddress(e.target.value)}
                  placeholder="Eynidirsə boş buraxın"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Faktiki Ünvan</label>
                <input
                  type="text"
                  value={actAddress}
                  onChange={(e) => setActAddress(e.target.value)}
                  placeholder="Eynidirsə boş buraxın"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* İş məlumatları */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> İş Məlumatları
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">İş Yeri</label>
                <input
                  type="text"
                  value={workCompany}
                  onChange={(e) => setWorkCompany(e.target.value)}
                  placeholder="Şirkət / İdarə adı"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vəzifəsi</label>
                <input
                  type="text"
                  value={workPosition}
                  onChange={(e) => setWorkPosition(e.target.value)}
                  placeholder="Məs: Menecer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Maaşı (AZN)</label>
                <input
                  type="number"
                  value={workSalary}
                  onChange={(e) => setWorkSalary(e.target.value)}
                  placeholder="Məs: 1200"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Müştərini Yadda Saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
