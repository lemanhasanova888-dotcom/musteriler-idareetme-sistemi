import React, { useState } from 'react';
import { Customer } from '../types/customer';
import {
  calculateCustomerTotalDebt,
  calculateDebtBreakdown,
  getLatestPayment,
  formatAZN,
  formatDate,
  getFullName,
} from '../utils/customerUtils';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  DollarSign,
  MessageSquare,
  ShieldAlert,
  FileText,
  Edit,
  Plus,
  Download,
  Trash2,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AddPaymentModal } from './modals/AddPaymentModal';
import { AddLoanModal } from './modals/AddLoanModal';
import { AddNoteModal } from './modals/AddNoteModal';
import { AddDocumentModal } from './modals/AddDocumentModal';
import { EditProfileModal } from './modals/EditProfileModal';
import { deleteCustomer } from '../services/customerStorage';

interface CustomerProfileProps {
  customer: Customer;
  onBack: () => void;
  onCustomerUpdated: (updatedCustomer: Customer) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  onBack,
  onCustomerUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    'personal' | 'address_work' | 'loans' | 'notes' | 'legal' | 'documents'
  >('personal');

  // Modal control states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Quick inline note input for notes tab
  const [inlineNoteText, setInlineNoteText] = useState('');

  const fullName = getFullName(customer);
  const totalDebt = calculateCustomerTotalDebt(customer);
  const debtBreakdown = calculateDebtBreakdown(customer.loans);
  const lastPayment = getLatestPayment(customer.payments);
  const isOverdue = customer.loans?.some((l) => l.status === 'Gecikmədə' || l.overdueDays > 0);
  const maxOverdueDays = Math.max(...(customer.loans?.map((l) => l.overdueDays) || [0]));

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteCustomer = () => {
    if (
      confirm(
        `Diqqət! "${fullName}" (${customer.code}) adlı müştərini sistemdən həmişəlik silmək istədiyinizə əminsiniz?`
      )
    ) {
      deleteCustomer(customer.id);
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar & Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" /> Müştərilər Siyahısına Qayıt
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
          >
            <DollarSign className="w-4 h-4" /> Ödəniş Qəbul Et
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center gap-2 transition"
          >
            <Edit className="w-4 h-4" /> Redaktə Et
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
            title="Profili Çap Et (PDF)"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleDeleteCustomer}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
            title="Müştərini Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl font-bold shadow-md uppercase">
              {customer.firstName?.[0]}
              {customer.lastName?.[0]}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                  {customer.code}
                </span>

                {isOverdue ? (
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200">
                    Gecikmədə ({maxOverdueDays} gün)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    Normal Status
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 flex-wrap">
                <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  FIN: <strong>{customer.finCode}</strong>
                </span>
                <span>ŞV: {customer.idSerialNum || '-'}</span>
                <span>Cinsi: {customer.gender}</span>
                <span>Doğum tarixi: {formatDate(customer.birthDate)}</span>
              </div>
            </div>
          </div>

          {/* Debt Summary Badge Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-6 self-stretch md:self-auto justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Ümumi Yekun Borc</p>
              <p className={`text-2xl font-black ${totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatAZN(totalDebt)}
              </p>
            </div>

            <div className="h-10 w-px bg-slate-200"></div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Son Ödəniş</p>
              {lastPayment ? (
                <div>
                  <p className="text-base font-bold text-emerald-700">{formatAZN(lastPayment.amount)}</p>
                  <p className="text-[11px] text-slate-400">{formatDate(lastPayment.date)}</p>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-500">Ödəniş yoxdur</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" /> Şəxsi və Əlaqə
        </button>

        <button
          onClick={() => setActiveTab('address_work')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'address_work'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" /> Ünvan və İş Məlumatları
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'loans'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Kreditlər və Ödənişlər ({customer.loans?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Qeydlər ({customer.notes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'legal'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Hüquqi Məlumatlar
          {customer.legalInfo?.resolutionNumber && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Əlavə Sənədlər ({customer.documents?.length || 0})
        </button>
      </div>

      {/* Tab 1: Şəxsi və Əlaqə Məlumatları */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Şəxsi Məlumatlar Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Şəxsi Məlumatlar
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Düzəliş et
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Müştəri Kodu</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{customer.code}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">FIN Kodu</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{customer.finCode}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Ad</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.firstName}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Soyad</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.lastName}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Atasının adı</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.fatherName || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Ana adı</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.motherName || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">ŞV Seriya və Nömrəsi</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.idSerialNum || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Doğum Tarixi</p>
                <p className="font-semibold text-slate-900 mt-0.5">{formatDate(customer.birthDate)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Cinsi</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.gender}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Vətəndaşlıq</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.citizenship}</p>
              </div>
            </div>
          </div>

          {/* Əlaqə Məlumatları Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" /> Əlaqə Telefonları
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nömrə idarə et
              </button>
            </div>

            <div className="space-y-3">
              {customer.phones && customer.phones.length > 0 ? (
                customer.phones.map((phone) => (
                  <div
                    key={phone.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mr-2">
                        {phone.type}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">{phone.number}</span>
                      {phone.note && (
                        <p className="text-xs text-slate-500 mt-0.5">{phone.note}</p>
                      )}
                    </div>
                    <a
                      href={`tel:${phone.number}`}
                      className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                      title="Zəng et"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Əlaqə nömrəsi daxil edilməyib.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ünvan və İş Məlumatları */}
      {activeTab === 'address_work' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ünvanlar Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" /> Ünvan Məlumatları
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Redaktə et
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Qeydiyyat Ünvanı
                </p>
                <p className="text-slate-900 font-medium">{customer.addresses?.registration || '-'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Yaşadığı Ünvan
                </p>
                <p className="text-slate-900 font-medium">{customer.addresses?.residential || '-'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Faktiki Ünvan
                </p>
                <p className="text-slate-900 font-medium">{customer.addresses?.actual || '-'}</p>
              </div>
            </div>
          </div>

          {/* İş Məlumatları Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" /> İş Məlumatları
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Redaktə et
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">İş Yeri</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.workInfo?.company || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Vəzifəsi</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.workInfo?.position || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Maaşı</p>
                <p className="font-bold text-emerald-700 mt-0.5">
                  {formatAZN(customer.workInfo?.salary || 0)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">İş Telefon Nömrəsi</p>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.workInfo?.phone || '-'}</p>
              </div>

              <div className="col-span-2">
                <p className="text-xs text-slate-500">İş Yerinin Ünvanı</p>
                <p className="font-medium text-slate-900 mt-0.5">{customer.workInfo?.address || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kreditlər və Ödəniş Tarixçəsi */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Kreditlər Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Kreditlər Siyahısı
              </h3>
              <button
                onClick={() => setIsLoanModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Yeni Kredit Əlavə Et
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="py-3 px-4">Kredit Kodu</th>
                    <th className="py-3 px-4">Verilmə Tarixi</th>
                    <th className="py-3 px-4">Məbləğ</th>
                    <th className="py-3 px-4">Müddət</th>
                    <th className="py-3 px-4">Faiz</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Qalıq Borc (Təfərrüat)</th>
                    <th className="py-3 px-4 text-center">Gecikmə</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {customer.loans && customer.loans.length > 0 ? (
                    customer.loans.map((loan) => {
                      const rem = loan.remainingDebt || {
                        principal: 0,
                        interest: 0,
                        commission: 0,
                        penalty: 0,
                        fee: 0,
                      };
                      const totalRem =
                        rem.principal + rem.interest + rem.commission + rem.penalty + rem.fee;

                      return (
                        <tr key={loan.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {loan.code}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">{formatDate(loan.issueDate)}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {formatAZN(loan.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">{loan.termMonths} ay</td>
                          <td className="py-3.5 px-4 text-slate-700">{loan.interestRate}%</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                loan.status === 'Aktiv'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : loan.status === 'Gecikmədə'
                                  ? 'bg-amber-100 text-amber-800'
                                  : loan.status === 'Məhkəmədə'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-bold text-slate-900">{formatAZN(totalRem)}</p>
                            <p className="text-[11px] text-slate-500">
                              Əsas: {formatAZN(rem.principal)} | F: {formatAZN(rem.interest)} | C: {formatAZN(rem.penalty)}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {loan.overdueDays > 0 ? (
                              <span className="font-bold text-rose-600">{loan.overdueDays} gün</span>
                            ) : (
                              <span className="text-slate-400">0 gün</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Kredit qeydi tapılmadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ödəniş Tarixçəsi Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Ödəniş Tarixçəsi (Tarix Sırası ilə)
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Ödəniş Qəbul Et
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="py-3 px-4">Tarix</th>
                    <th className="py-3 px-4">Məbləğ</th>
                    <th className="py-3 px-4">Əsas borc</th>
                    <th className="py-3 px-4">Faiz</th>
                    <th className="py-3 px-4">Komissiya</th>
                    <th className="py-3 px-4">Cərimə</th>
                    <th className="py-3 px-4">Rüsum</th>
                    <th className="py-3 px-4">Qəbul edən əməkdaş</th>
                    <th className="py-3 px-4">Qeydlər</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {customer.payments && customer.payments.length > 0 ? (
                    customer.payments.map((pm) => (
                      <tr key={pm.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                          {formatDate(pm.date)}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700 whitespace-nowrap">
                          {formatAZN(pm.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{formatAZN(pm.principal)}</td>
                        <td className="py-3 px-4 text-slate-700">{formatAZN(pm.interest)}</td>
                        <td className="py-3 px-4 text-slate-700">{formatAZN(pm.commission)}</td>
                        <td className="py-3 px-4 text-slate-700">{formatAZN(pm.penalty)}</td>
                        <td className="py-3 px-4 text-slate-700">{formatAZN(pm.fee)}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                          {pm.receiverEmployee}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs">{pm.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Bu müştəri üzrə hələ ödəniş edilməyib.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Qeydlər */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" /> Müştəri Qeydləri (Ən son yuxarıda)
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Yeni Qeyd Yaz
              </button>
            </div>

            {/* Timeline Notes list */}
            <div className="space-y-4">
              {customer.notes && customer.notes.length > 0 ? (
                customer.notes.map((note, index) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition relative pl-5 border-l-4 border-l-amber-500"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{note.employee}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Ən son qeyd
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(note.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {note.time}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed font-medium mt-1">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-slate-400 italic">Hələ qeyd yazılmayıb.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Hüquqi Məlumatlar */}
      {activeTab === 'legal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Hüquqi Məlumatlar
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Məlumatları Yenilə
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">Qətnamə Nömrəsi</p>
              <p className="font-mono font-bold text-slate-900 text-base mt-1">
                {customer.legalInfo?.resolutionNumber || 'Mövcud deyil'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">Qətnamə Tarixi</p>
              <p className="font-bold text-slate-900 text-base mt-1">
                {formatDate(customer.legalInfo?.resolutionDate || '')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">İcra Şöbəsi</p>
              <p className="font-bold text-slate-900 text-base mt-1">
                {customer.legalInfo?.enforcementBranch || '-'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">Bölgə</p>
              <p className="font-bold text-slate-900 text-base mt-1">
                {customer.legalInfo?.region || '-'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">İcra Məmuru</p>
              <p className="font-bold text-slate-900 text-base mt-1">
                {customer.legalInfo?.bailiff || '-'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">İcra Vəziyyəti</p>
              <p className="font-bold text-rose-600 text-base mt-1">
                {customer.legalInfo?.enforcementStatus || 'Status yoxdur'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Əlavə Sənədlər */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Müştəriyə Aid Sənədlər
            </h3>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Sənəd Yüklə (PDF, JPG, PNG, DOC)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.documents && customer.documents.length > 0 ? (
              customer.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-300 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {doc.fileType}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 block w-max mb-1">
                        {doc.type}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-sm truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.fileSize} • {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    {doc.dataUrl ? (
                      <a
                        href={doc.dataUrl}
                        download={doc.title}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs flex items-center justify-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Yüklə
                      </a>
                    ) : (
                      <button
                        onClick={() => alert(`"${doc.title}" sənədinin simulyasiya nümayişi.`)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium text-xs flex items-center justify-center gap-1 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Bax
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400">
                Sənəd yüklənilməyib.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPaymentModal
        customer={customer}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={onCustomerUpdated}
      />

      <AddLoanModal
        customer={customer}
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSuccess={onCustomerUpdated}
      />

      <AddNoteModal
        customer={customer}
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={onCustomerUpdated}
      />

      <AddDocumentModal
        customer={customer}
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSuccess={onCustomerUpdated}
      />

      <EditProfileModal
        customer={customer}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onCustomerUpdated}
      />
    </div>
  );
};
