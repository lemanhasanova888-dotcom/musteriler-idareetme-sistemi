export interface PhoneNumber {
  id: string;
  type: 'Mobil 1' | 'Mobil 2' | 'Ev telefonu' | 'İş telefonu' | 'WhatsApp' | string;
  number: string;
  note?: string;
}

export interface Addresses {
  registration: string; // Qeydiyyat ünvanı
  residential: string;  // Yaşadığı ünvan
  actual: string;       // Faktiki ünvan
}

export interface WorkInfo {
  company: string;       // İş yeri
  position: string;      // Vəzifəsi
  salary: number;        // Maaşı (AZN)
  address: string;       // İş yerinin ünvanı
  phone: string;         // İş telefon nömrəsi
}

export interface DebtBreakdown {
  principal: number;   // Əsas borc
  interest: number;    // Faiz borcu
  commission: number;  // Komissiya
  penalty: number;     // Cərimə
  fee: number;         // Rüsum
}

export interface Loan {
  id: string;
  code: string;         // Kredit kodu
  issueDate: string;    // Verilmə tarixi
  amount: number;       // Məbləğ
  termMonths: number;   // Müddət (aylarla)
  interestRate: number; // Faiz (%)
  status: 'Aktiv' | 'Gecikmədə' | 'Məhkəmədə' | 'Bağlanıb';
  remainingDebt: DebtBreakdown; // Qalıq borc
  overdueDays: number;  // Gecikmə günləri
}

export interface Payment {
  id: string;
  loanId?: string;
  loanCode?: string;
  date: string;          // Tarix (YYYY-MM-DD HH:mm)
  amount: number;        // Məbləğ (Yekun ödəniş)
  principal: number;     // Əsas borc payı
  interest: number;      // Faiz payı
  commission: number;    // Komissiya payı
  penalty: number;       // Cərimə payı
  fee: number;           // Rüsum payı
  receiverEmployee: string; // Qəbul edən əməkdaş
  notes?: string;        // Qeydlər
}

export interface Note {
  id: string;
  date: string;          // Tarix (YYYY-MM-DD)
  time: string;          // Saat (HH:mm)
  employee: string;      // Qeydi yazan əməkdaş
  content: string;       // Qeyd mətni
}

export interface LegalInfo {
  resolutionNumber?: string;  // Qətnamə nömrəsi
  resolutionDate?: string;    // Qətnamə tarixi
  enforcementBranch?: string; // İcra şöbəsi
  region?: string;            // Bölgə
  bailiff?: string;           // İcra məmuru
  enforcementStatus?: string; // İcra vəziyyəti (İcrada, Dayandırılıb, Maaşdan tutulur, Hərracda, Bağlanıb)
}

export interface CustomerDocument {
  id: string;
  title: string;
  type: 'Şəxsiyyət vəsiqəsi' | 'Müqavilə' | 'Girov sənədi' | 'Məhkəmə sənədləri' | 'Digər';
  fileType: 'pdf' | 'jpg' | 'png' | 'doc' | 'docx';
  fileSize: string;
  uploadDate: string;
  dataUrl?: string; // Base64 or mock preview link
}

export interface Customer {
  id: string;
  code: string;           // Müştəri kodu (e.g., C-10042)
  firstName: string;      // Ad
  lastName: string;       // Soyad
  fatherName: string;     // Atasının adı
  motherName?: string;    // Ana adı
  finCode: string;        // FIN kodu (7 simvol)
  idSerialNum: string;    // Şəxsiyyət vəsiqəsinin seriya və nömrəsi (e.g., AZE 12345678)
  birthDate: string;      // Doğum tarixi
  gender: 'Kişi' | 'Qadın'; // Cinsi
  citizenship: string;    // Vətəndaşlıq
  
  phones: PhoneNumber[];
  addresses: Addresses;
  workInfo: WorkInfo;
  loans: Loan[];
  payments: Payment[];
  notes: Note[];           // Chronologically stored notes (newest top or sorted)
  legalInfo: LegalInfo;
  documents: CustomerDocument[];
  
  createdAt: string;
}
