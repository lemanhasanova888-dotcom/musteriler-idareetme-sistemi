import { Customer, CustomerDocument, Loan, Note, Payment, PhoneNumber } from '../types/customer';
import { INITIAL_CUSTOMERS } from '../data/mockCustomers';

const STORAGE_KEY = 'crm_az_customers_data_v1';

export function loadCustomersFromStorage(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  } catch (error) {
    console.error('Error loading customers from localStorage:', error);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomersToStorage(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    window.dispatchEvent(new CustomEvent('customers_updated'));
  } catch (error) {
    console.error('Error saving customers to localStorage:', error);
  }
}

export function getCustomerById(id: string): Customer | null {
  const customers = loadCustomersFromStorage();
  return customers.find((c) => c.id === id) || null;
}

export function updateCustomer(updated: Customer): void {
  const customers = loadCustomersFromStorage();
  const index = customers.findIndex((c) => c.id === updated.id);
  if (index !== -1) {
    customers[index] = updated;
    saveCustomersToStorage(customers);
  }
}

export function createCustomer(newCustomerData: Partial<Customer>): Customer {
  const customers = loadCustomersFromStorage();
  
  // Generate code e.g. C-10048
  const nextNum = 10040 + customers.length + 1;
  const code = newCustomerData.code || `C-${nextNum}`;
  const id = `cust-${Date.now()}`;

  const customer: Customer = {
    id,
    code,
    firstName: newCustomerData.firstName || '',
    lastName: newCustomerData.lastName || '',
    fatherName: newCustomerData.fatherName || '',
    motherName: newCustomerData.motherName || '',
    finCode: (newCustomerData.finCode || '').toUpperCase(),
    idSerialNum: newCustomerData.idSerialNum || '',
    birthDate: newCustomerData.birthDate || '',
    gender: newCustomerData.gender || 'Kişi',
    citizenship: newCustomerData.citizenship || 'Azərbaycan',
    phones: newCustomerData.phones || [
      { id: `p-${Date.now()}`, type: 'Mobil 1', number: '+994 50 000 00 00' },
    ],
    addresses: newCustomerData.addresses || {
      registration: '',
      residential: '',
      actual: '',
    },
    workInfo: newCustomerData.workInfo || {
      company: '',
      position: '',
      salary: 0,
      address: '',
      phone: '',
    },
    loans: newCustomerData.loans || [],
    payments: newCustomerData.payments || [],
    notes: newCustomerData.notes || [],
    legalInfo: newCustomerData.legalInfo || {},
    documents: newCustomerData.documents || [],
    createdAt: new Date().toISOString(),
  };

  customers.unshift(customer);
  saveCustomersToStorage(customers);
  return customer;
}

export function deleteCustomer(id: string): void {
  const customers = loadCustomersFromStorage();
  const filtered = customers.filter((c) => c.id !== id);
  saveCustomersToStorage(filtered);
}

export function addPaymentToCustomer(
  customerId: string,
  paymentData: Omit<Payment, 'id'>
): Customer | null {
  const customer = getCustomerById(customerId);
  if (!customer) return null;

  const newPayment: Payment = {
    ...paymentData,
    id: `pm-${Date.now()}`,
  };

  const updatedPayments = [newPayment, ...(customer.payments || [])];

  // If loanId exists, reduce remaining debt on that loan
  let updatedLoans = [...(customer.loans || [])];
  if (paymentData.loanId) {
    updatedLoans = updatedLoans.map((loan) => {
      if (loan.id === paymentData.loanId) {
        const rem = loan.remainingDebt || { principal: 0, interest: 0, commission: 0, penalty: 0, fee: 0 };
        const newPrincipal = Math.max(0, rem.principal - (paymentData.principal || 0));
        const newInterest = Math.max(0, rem.interest - (paymentData.interest || 0));
        const newComm = Math.max(0, rem.commission - (paymentData.commission || 0));
        const newPenalty = Math.max(0, rem.penalty - (paymentData.penalty || 0));
        const newFee = Math.max(0, rem.fee - (paymentData.fee || 0));

        const totalRem = newPrincipal + newInterest + newComm + newPenalty + newFee;
        const newStatus = totalRem === 0 ? 'Bağlanıb' : loan.status;

        return {
          ...loan,
          status: newStatus,
          remainingDebt: {
            principal: newPrincipal,
            interest: newInterest,
            commission: newComm,
            penalty: newPenalty,
            fee: newFee,
          },
        };
      }
      return loan;
    });
  }

  // Also record auto note about payment
  const newNote: Note = {
    id: `nt-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
    employee: paymentData.receiverEmployee || 'Sistem',
    content: `${paymentData.amount} AZN məbləğində ödəniş qəbul edildi. (${paymentData.notes || 'Qeyd yoxdur'})`,
  };

  const updatedCustomer: Customer = {
    ...customer,
    payments: updatedPayments,
    loans: updatedLoans,
    notes: [newNote, ...(customer.notes || [])],
  };

  updateCustomer(updatedCustomer);
  return updatedCustomer;
}

export function addNoteToCustomer(
  customerId: string,
  noteData: Omit<Note, 'id'>
): Customer | null {
  const customer = getCustomerById(customerId);
  if (!customer) return null;

  const newNote: Note = {
    ...noteData,
    id: `nt-${Date.now()}`,
  };

  const updatedCustomer: Customer = {
    ...customer,
    notes: [newNote, ...(customer.notes || [])],
  };

  updateCustomer(updatedCustomer);
  return updatedCustomer;
}

export function addLoanToCustomer(
  customerId: string,
  loanData: Omit<Loan, 'id'>
): Customer | null {
  const customer = getCustomerById(customerId);
  if (!customer) return null;

  const newLoan: Loan = {
    ...loanData,
    id: `ln-${Date.now()}`,
  };

  const updatedCustomer: Customer = {
    ...customer,
    loans: [newLoan, ...(customer.loans || [])],
  };

  updateCustomer(updatedCustomer);
  return updatedCustomer;
}

export function addDocumentToCustomer(
  customerId: string,
  docData: Omit<CustomerDocument, 'id'>
): Customer | null {
  const customer = getCustomerById(customerId);
  if (!customer) return null;

  const newDoc: CustomerDocument = {
    ...docData,
    id: `doc-${Date.now()}`,
  };

  const updatedCustomer: Customer = {
    ...customer,
    documents: [newDoc, ...(customer.documents || [])],
  };

  updateCustomer(updatedCustomer);
  return updatedCustomer;
}

export function deleteDocumentFromCustomer(customerId: string, docId: string): Customer | null {
  const customer = getCustomerById(customerId);
  if (!customer) return null;

  const updatedDocs = (customer.documents || []).filter((d) => d.id !== docId);

  const updatedCustomer: Customer = {
    ...customer,
    documents: updatedDocs,
  };

  updateCustomer(updatedCustomer);
  return updatedCustomer;
}

export function resetDataToDefault(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
  window.dispatchEvent(new CustomEvent('customers_updated'));
}
