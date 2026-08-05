import React, { useState } from 'react';
import { Customer, PhoneNumber } from '../../types/customer';
import { updateCustomer } from '../../services/customerStorage';
import { X, Save, Edit, Plus, Trash2 } from 'lucide-react';

interface EditProfileModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCustomer: Customer) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState(customer.firstName || '');
  const [lastName, setLastName] = useState(customer.lastName || '');
  const [fatherName, setFatherName] = useState(customer.fatherName || '');
  const [motherName, setMotherName] = useState(customer.motherName || '');
  const [finCode, setFinCode] = useState(customer.finCode || '');
  const [idSerialNum, setIdSerialNum] = useState(customer.idSerialNum || '');
  const [birthDate, setBirthDate] = useState(customer.birthDate || '');
  const [gender, setGender] = useState<'Kişi' | 'Qadın'>(customer.gender || 'Kişi');
  const [citizenship, setCitizenship] = useState(customer.citizenship || 'Azərbaycan');

  // Phones array management
  const [phones, setPhones] = useState<PhoneNumber[]>(customer.phones || []);

  // Addresses
  const [regAddress, setRegAddress] = useState(customer.addresses?.registration || '');
  const [resAddress, setResAddress] = useState(customer.addresses?.residential || '');
  const [actAddress, setActAddress] = useState(customer.addresses?.actual || '');

  // Work Info
  const [workCompany, setWorkCompany] = useState(customer.workInfo?.company || '');
  const [workPosition, setWorkPosition] = useState(customer.workInfo?.position || '');
  const [workSalary, setWorkSalary] = useState(customer.workInfo?.salary?.toString() || '0');
  const [workAddress, setWorkAddress] = useState(customer.workInfo?.address || '');
  const [workPhone, setWorkPhone] = useState(customer.workInfo?.phone || '');

  // Legal Info
  const [resolutionNumber, setResolutionNumber] = useState(customer.legalInfo?.resolutionNumber || '');
  const [resolutionDate, setResolutionDate] = useState(customer.legalInfo?.resolutionDate || '');
  const [enforcementBranch, setEnforcementBranch] = useState(customer.legalInfo?.enforcementBranch || '');
  const [region, setRegion] = useState(customer.legalInfo?.region || '');
  const [bailiff, setBailiff] = useState(customer.legalInfo?.bailiff || '');
  const [enforcementStatus, setEnforcementStatus] = useState(customer.legalInfo?.enforcementStatus || '');

  if (!isOpen) return null;

  const handleAddPhone = () => {
    const newPhone: PhoneNumber = {
      id: `p-${Date.now()}`,
      type: 'Mobil 2',
      number: '+994 50 ',
      note: '',
    };
    setPhones([...phones, newPhone]);
  };

  const handleUpdatePhone = (id: string, field: keyof PhoneNumber, value: string) => {
    setPhones(
      phones.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleDeletePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCustomer: Customer = {
      ...customer,
      firstName,
      lastName,
      fatherName,
      motherName,
      finCode: finCode.toUpperCase(),
      idSerialNum,
      birthDate,
      gender,
      citizenship,
      phones,
      addresses: {
        registration: regAddress,
        residential: resAddress,
        actual: actAddress,
      },
      workInfo: {
        company: workCompany,
        position: workPosition,
        salary: Number(workSalary) || 0,
        address: workAddress,
        phone: workPhone,
      },
      legalInfo: {
        resolutionNumber,
        resolutionDate,
        enforcementBranch,
        region,
        bailiff,
        enforcementStatus,
      },
    };

    updateCustomer(updatedCustomer);
    onSuccess(updatedCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Müştəri Profilini Redaktə Et</h3>
              <p className="text-xs text-slate-400">
                {customer.code} - {customer.lastName} {customer.firstName}
              </p>
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
          {/* 1. Şəxsi məlumatlar */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Şəxsi Məlumatlar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ad</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Soyad</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Atasının adı</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ana adı</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">FIN Kodu</label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={finCode}
                  onChange={(e) => setFinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Doğum Tarixi</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cinsi</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Kişi' | 'Qadın')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 2. Telefon nömrələri idarəetməsi */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Əlaqə Nömrələri
              </h4>
              <button
                type="button"
                onClick={handleAddPhone}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-md"
              >
                <Plus className="w-3.5 h-3.5" /> Nömrə Əlavə Et
              </button>
            </div>

            <div className="space-y-3">
              {phones.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <select
                    value={p.type}
                    onChange={(e) => handleUpdatePhone(p.id, 'type', e.target.value)}
                    className="w-1/4 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Mobil 1">Mobil 1</option>
                    <option value="Mobil 2">Mobil 2</option>
                    <option value="Ev telefonu">Ev telefonu</option>
                    <option value="İş telefonu">İş telefonu</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Qohum nömrəsi">Qohum nömrəsi</option>
                  </select>

                  <input
                    type="text"
                    value={p.number}
                    onChange={(e) => handleUpdatePhone(p.id, 'number', e.target.value)}
                    placeholder="+994 50 000 00 00"
                    className="w-1/3 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                  />

                  <input
                    type="text"
                    value={p.note || ''}
                    onChange={(e) => handleUpdatePhone(p.id, 'note', e.target.value)}
                    placeholder="Qeyd (məs: Əsas)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />

                  <button
                    type="button"
                    onClick={() => handleDeletePhone(p.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Ünvanlar */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ünvan Məlumatları
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Qeydiyyat Ünvanı</label>
                <textarea
                  rows={2}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Yaşadığı Ünvan</label>
                <textarea
                  rows={2}
                  value={resAddress}
                  onChange={(e) => setResAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Faktiki Ünvan</label>
                <textarea
                  rows={2}
                  value={actAddress}
                  onChange={(e) => setActAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. İş Məlumatları */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> İş Məlumatları
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">İş Yeri</label>
                <input
                  type="text"
                  value={workCompany}
                  onChange={(e) => setWorkCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vəzifəsi</label>
                <input
                  type="text"
                  value={workPosition}
                  onChange={(e) => setWorkPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Maaşı (AZN)</label>
                <input
                  type="number"
                  value={workSalary}
                  onChange={(e) => setWorkSalary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  İş Yerinin Ünvanı
                </label>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  İş Telefon Nömrəsi
                </label>
                <input
                  type="text"
                  value={workPhone}
                  onChange={(e) => setWorkPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 5. Hüquqi Məlumatlar */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Hüquqi Məlumatlar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Qətnamə Nömrəsi
                </label>
                <input
                  type="text"
                  value={resolutionNumber}
                  onChange={(e) => setResolutionNumber(e.target.value)}
                  placeholder="2-1(102)-4512/2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Qətnamə Tarixi
                </label>
                <input
                  type="date"
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">İcra Şöbəsi</label>
                <input
                  type="text"
                  value={enforcementBranch}
                  onChange={(e) => setEnforcementBranch(e.target.value)}
                  placeholder="Yasamal İcra Şöbəsi"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bölgə</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Bakı şəhəri"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">İcra Məmuru</label>
                <input
                  type="text"
                  value={bailiff}
                  onChange={(e) => setBailiff(e.target.value)}
                  placeholder="Əli Hacıyev"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">İcra Vəziyyəti</label>
                <input
                  type="text"
                  value={enforcementStatus}
                  onChange={(e) => setEnforcementStatus(e.target.value)}
                  placeholder="İcrada / Maaşdan tutulur"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              <Save className="w-4 h-4" /> Dəyişiklikləri Yadda Saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
