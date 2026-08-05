import React, { useState, useMemo } from 'react';
import { Customer } from '../types/customer';
import {
  calculateCustomerTotalDebt,
  calculateDebtBreakdown,
  getLatestNote,
  getLatestPayment,
  formatAZN,
  formatDate,
  getFullName,
} from '../utils/customerUtils';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Users,
  Building2,
  PhoneCall,
  Calendar,
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onOpenNewCustomerModal: () => void;
  onResetData: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
  onOpenNewCustomerModal,
  onResetData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debtFilter, setDebtFilter] = useState<'all' | 'has_debt' | 'overdue' | 'no_debt'>('all');
  const [legalFilter, setLegalFilter] = useState<'all' | 'legal' | 'normal'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Kişi' | 'Qadın'>('all');
  
  // Sort state
  const [sortField, setSortField] = useState<'code' | 'name' | 'fin' | 'debt' | 'lastPayment' | 'overdue'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Expanded debt breakdown popover state
  const [popoverCustomerId, setPopoverCustomerId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalDebt = 0;
    let overdueCount = 0;
    let legalCount = 0;

    customers.forEach((c) => {
      const debt = calculateCustomerTotalDebt(c);
      totalDebt += debt;

      const hasOverdueLoan = c.loans?.some((l) => l.status === 'Gecikmədə' || l.overdueDays > 0);
      if (hasOverdueLoan) overdueCount++;

      if (c.legalInfo?.resolutionNumber || c.loans?.some((l) => l.status === 'Məhkəmədə')) {
        legalCount++;
      }
    });

    return {
      totalCustomers: customers.length,
      totalDebt,
      overdueCount,
      legalCount,
    };
  }, [customers]);

  // Filtering logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const fullName = getFullName(c).toLowerCase();
      const code = (c.code || '').toLowerCase();
      const fin = (c.finCode || '').toLowerCase();
      const idSerial = (c.idSerialNum || '').toLowerCase();
      const resNum = (c.legalInfo?.resolutionNumber || '').toLowerCase();
      const term = searchTerm.trim().toLowerCase();

      // Check phone numbers
      const phoneMatch = c.phones?.some((p) => p.number.replace(/\s+/g, '').includes(term.replace(/\s+/g, '')));

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        code.includes(term) ||
        fin.includes(term) ||
        idSerial.includes(term) ||
        resNum.includes(term) ||
        phoneMatch;

      if (!matchesSearch) return false;

      // Debt filter
      const totalDebt = calculateCustomerTotalDebt(c);
      const isOverdue = c.loans?.some((l) => l.status === 'Gecikmədə' || l.overdueDays > 0);

      if (debtFilter === 'has_debt' && totalDebt <= 0) return false;
      if (debtFilter === 'no_debt' && totalDebt > 0) return false;
      if (debtFilter === 'overdue' && !isOverdue) return false;

      // Legal filter
      const hasLegal = !!c.legalInfo?.resolutionNumber || c.loans?.some((l) => l.status === 'Məhkəmədə');
      if (legalFilter === 'legal' && !hasLegal) return false;
      if (legalFilter === 'normal' && hasLegal) return false;

      // Gender filter
      if (genderFilter !== 'all' && c.gender !== genderFilter) return false;

      return true;
    });
  }, [customers, searchTerm, debtFilter, legalFilter, genderFilter]);

  // Sorting logic
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'code') {
        valA = a.code;
        valB = b.code;
      } else if (sortField === 'name') {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (sortField === 'fin') {
        valA = a.finCode;
        valB = b.finCode;
      } else if (sortField === 'debt') {
        valA = calculateCustomerTotalDebt(a);
        valB = calculateCustomerTotalDebt(b);
      } else if (sortField === 'lastPayment') {
        const lastA = getLatestPayment(a.payments);
        const lastB = getLatestPayment(b.payments);
        valA = lastA ? new Date(lastA.date).getTime() : 0;
        valB = lastB ? new Date(lastB.date).getTime() : 0;
      } else if (sortField === 'overdue') {
        valA = Math.max(...(a.loans?.map((l) => l.overdueDays) || [0]));
        valB = Math.max(...(b.loans?.map((l) => l.overdueDays) || [0]));
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(start, start + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Müştəri kodu',
      'Ad Soyad Ata adı',
      'FIN Kodu',
      'ŞV Seriya',
      'Əlaqə Telefonu',
      'Ümumi Borc (AZN)',
      'Əsas Borc',
      'Faiz Borcu',
      'Cərimə',
      'Son Ödəniş Tarixi',
      'Son Ödənilən Məbləğ',
      'Sonuncu Qeyd',
      'Qətnamə №',
    ];

    const rows = sortedCustomers.map((c) => {
      const breakdown = calculateDebtBreakdown(c.loans);
      const totalDebt = calculateCustomerTotalDebt(c);
      const lastPay = getLatestPayment(c.payments);
      const lastNote = getLatestNote(c.notes);
      const phone = c.phones?.[0]?.number || '-';

      return [
        `"${c.code}"`,
        `"${getFullName(c)}"`,
        `"${c.finCode}"`,
        `"${c.idSerialNum || '-'}"`,
        `"${phone}"`,
        `"${totalDebt.toFixed(2)}"`,
        `"${breakdown.principal.toFixed(2)}"`,
        `"${breakdown.interest.toFixed(2)}"`,
        `"${breakdown.penalty.toFixed(2)}"`,
        `"${lastPay ? formatDate(lastPay.date) : 'Ödəniş yoxdur'}"`,
        `"${lastPay ? lastPay.amount.toFixed(2) : '0'}"`,
        `"${lastNote ? lastNote.content.replace(/"/g, '""') : '-'}"`,
        `"${c.legalInfo?.resolutionNumber || '-'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `musteriler_siyahisi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Ümumi Müştərilər</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalCustomers}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Sistemdə aktiv qeydlər</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Ümumi Portfel Borcu</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatAZN(stats.totalDebt)}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Əsas + Faiz + Cərimə</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Gecikmədə Olanlar</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.overdueCount} müştəri</h3>
            <span className="text-[11px] text-amber-600 font-medium">Gecikməsi 1+ gün olanlar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Məhkəmə / İcrada</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.legalCount} müştəri</h3>
            <span className="text-[11px] text-rose-600 font-medium">Qətnaməsi olan işlər</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Action buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Main Multi-field Search input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Axtarış: Müştəri kodu, Ad, Soyad, FIN, Tel, ŞV seriyası, Qətnamə №..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenNewCustomerModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" /> Yeni Müştəri
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium flex items-center gap-2 transition"
              title="CSV şəklində yüklə"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
            </button>

            <button
              onClick={onResetData}
              className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Nümunə Məlumatları Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filtrlər:
          </div>

          {/* Debt Status Filter */}
          <select
            value={debtFilter}
            onChange={(e) => {
              setDebtFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Borc Statusu: Hamısı</option>
            <option value="has_debt">Borcu olanlar</option>
            <option value="overdue">Gecikmədə olanlar</option>
            <option value="no_debt">Borcu olmayanlar</option>
          </select>

          {/* Legal Status Filter */}
          <select
            value={legalFilter}
            onChange={(e) => {
              setLegalFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Hüquqi Status: Hamısı</option>
            <option value="legal">Məhkəmədə / İcrada olanlar</option>
            <option value="normal">Normal profil</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Cins: Hamısı</option>
            <option value="Kişi">Kişi</option>
            <option value="Qadın">Qadın</option>
          </select>

          {(searchTerm || debtFilter !== 'all' || legalFilter !== 'all' || genderFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDebtFilter('all');
                setLegalFilter('all');
                setGenderFilter('all');
                setCurrentPage(1);
              }}
              className="text-rose-600 hover:text-rose-700 font-medium underline ml-auto"
            >
              Filtrləri sıfırla
            </button>
          )}
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('code')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Müştəri Kodu
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    Ad, Soyad, Ata adı
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('fin')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    FIN Kodu
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>

                <th className="py-3.5 px-4 min-w-[200px]">Sonuncu Qeyd</th>

                <th
                  onClick={() => handleSort('debt')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Müştərinin Ümumi Borcu
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('lastPayment')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Müştərinin Son Ödənişi
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>

                <th className="py-3.5 px-4 text-center whitespace-nowrap">Ətraflı Bax</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-sm">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Axtarış tələblərinizə uyğun heç bir müştəri tapılmadı.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => {
                  const fullName = getFullName(customer);
                  const totalDebt = calculateCustomerTotalDebt(customer);
                  const debtBreakdown = calculateDebtBreakdown(customer.loans);
                  const lastPayment = getLatestPayment(customer.payments);
                  const lastNote = getLatestNote(customer.notes);

                  const mainPhone = customer.phones?.[0]?.number || '-';
                  const isOverdue = customer.loans?.some((l) => l.status === 'Gecikmədə' || l.overdueDays > 0);
                  const isCourt = customer.loans?.some((l) => l.status === 'Məhkəmədə') || !!customer.legalInfo?.resolutionNumber;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/90 transition group border-b border-slate-100"
                    >
                      {/* Müştəri Kodu */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{customer.code}</span>
                          {isCourt && (
                            <span
                              className="w-2 h-2 rounded-full bg-rose-500"
                              title="Məhkəmə/İcra qətnaməsi mövcuddur"
                            ></span>
                          )}
                        </div>
                      </td>

                      {/* Ad, Soyad, Ata adı */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                            {fullName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <PhoneCall className="w-3 h-3 text-slate-400" /> {mainPhone}
                            </span>
                            {customer.idSerialNum && (
                              <span className="text-slate-400">• ŞV: {customer.idSerialNum}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* FIN Kodu */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-xs tracking-wide whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800 border border-slate-200">
                          {customer.finCode}
                        </span>
                      </td>

                      {/* Sonuncu qeyd */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        {lastNote ? (
                          <div className="text-xs">
                            <p className="text-slate-800 line-clamp-2 font-medium">
                              {lastNote.content}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {lastNote.date} {lastNote.time} - {lastNote.employee}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Qeyd yoxdur</span>
                        )}
                      </td>

                      {/* Müştərinin ümumi borcu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <div>
                          <p
                            className={`font-bold text-base ${
                              totalDebt > 0 ? (isOverdue ? 'text-rose-600' : 'text-slate-900') : 'text-emerald-600'
                            }`}
                          >
                            {formatAZN(totalDebt)}
                          </p>

                          {totalDebt > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPopoverCustomerId(
                                  popoverCustomerId === customer.id ? null : customer.id
                                );
                              }}
                              className="text-[11px] text-blue-600 hover:underline font-medium mt-0.5 block ml-auto"
                            >
                              Tərkibinə bax (Təfərrüat)
                            </button>
                          )}
                        </div>

                        {/* Debt breakdown popover */}
                        {popoverCustomerId === customer.id && (
                          <div
                            className="absolute right-4 top-14 z-20 bg-slate-900 text-white p-4 rounded-xl shadow-xl w-64 text-left text-xs animate-in fade-in duration-150 border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2 font-semibold text-emerald-400">
                              <span>Borcun Tərkibi (Ümumi)</span>
                              <button
                                onClick={() => setPopoverCustomerId(null)}
                                className="text-slate-400 hover:text-white"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="space-y-1.5 text-slate-300">
                              <div className="flex justify-between">
                                <span>Əsas Borc:</span>
                                <span className="font-semibold text-white">
                                  {formatAZN(debtBreakdown.principal)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Faiz Borcu:</span>
                                <span className="font-semibold text-white">
                                  {formatAZN(debtBreakdown.interest)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Komissiya:</span>
                                <span className="font-semibold text-white">
                                  {formatAZN(debtBreakdown.commission)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cərimə:</span>
                                <span className="font-semibold text-rose-400">
                                  {formatAZN(debtBreakdown.penalty)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rüsum:</span>
                                <span className="font-semibold text-white">
                                  {formatAZN(debtBreakdown.fee)}
                                </span>
                              </div>
                              <div className="border-t border-slate-700 pt-1.5 flex justify-between font-bold text-white">
                                <span>Yekun Borc:</span>
                                <span className="text-emerald-400">{formatAZN(totalDebt)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Müştərinin son ödənişi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lastPayment ? (
                          <div>
                            <p className="font-bold text-emerald-700 text-sm">
                              {formatAZN(lastPayment.amount)}
                            </p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {formatDate(lastPayment.date)}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Ödəniş yoxdur
                          </span>
                        )}
                      </td>

                      {/* Ətraflı Bax Button */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectCustomer(customer)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-medium text-xs transition border border-emerald-200/80 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ətraflı Bax
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span>
              Cəmi: <strong className="text-slate-900">{sortedCustomers.length}</strong> müştəri
              tapıldı
            </span>
            <div className="flex items-center gap-1.5">
              <span>Səhifədə:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded border border-slate-300 bg-white font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-slate-800">
              Səhifə {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
