import { Customer, DebtBreakdown, Loan, Note, Payment } from '../types/customer';

/**
 * Calculates total debt broken down by components across all customer loans.
 */
export function calculateDebtBreakdown(loans: Loan[] = []): DebtBreakdown {
  return loans.reduce(
    (acc, loan) => {
      // Sum only active, overdue or court loans
      if (loan.status !== 'Bağlanıb') {
        const debt = loan.remainingDebt || { principal: 0, interest: 0, commission: 0, penalty: 0, fee: 0 };
        acc.principal += debt.principal || 0;
        acc.interest += debt.interest || 0;
        acc.commission += debt.commission || 0;
        acc.penalty += debt.penalty || 0;
        acc.fee += debt.fee || 0;
      }
      return acc;
    },
    { principal: 0, interest: 0, commission: 0, penalty: 0, fee: 0 }
  );
}

/**
 * Calculates total debt amount for a single loan or breakdown
 */
export function getTotalDebtFromBreakdown(breakdown: DebtBreakdown): number {
  return (
    (breakdown.principal || 0) +
    (breakdown.interest || 0) +
    (breakdown.commission || 0) +
    (breakdown.penalty || 0) +
    (breakdown.fee || 0)
  );
}

/**
 * Calculates total combined debt for a customer.
 */
export function calculateCustomerTotalDebt(customer: Customer): number {
  const breakdown = calculateDebtBreakdown(customer.loans || []);
  return getTotalDebtFromBreakdown(breakdown);
}

/**
 * Retrieves the latest payment for a customer.
 */
export function getLatestPayment(payments: Payment[] = []): Payment | null {
  if (!payments || payments.length === 0) return null;
  // Sort by date descending
  const sorted = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted[0];
}

/**
 * Retrieves the latest note for a customer.
 */
export function getLatestNote(notes: Note[] = []): Note | null {
  if (!notes || notes.length === 0) return null;
  const sorted = [...notes].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return dateTimeB - dateTimeA;
  });
  return sorted[0];
}

/**
 * Formats full name of customer.
 */
export function getFullName(customer: Customer): string {
  return `${customer.lastName} ${customer.firstName} ${customer.fatherName}`.trim();
}

/**
 * Currency formatter for Azerbaijani Manat (AZN).
 */
export function formatAZN(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '0.00 ₼';
  return new Intl.NumberFormat('az-AZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ₼';
}

/**
 * Formats date string to Azerbaijani local date format.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}
