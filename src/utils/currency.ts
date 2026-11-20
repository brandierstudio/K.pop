export type CurrencyCode = 'USD' | 'PKR';

export const CURRENCY_STORAGE_KEY = 'kshop-currency-v1';
export const PKR_EXCHANGE_RATE = 280;

type CurrencyListener = (currency: CurrencyCode) => void;

const listeners = new Set<CurrencyListener>();
let currentCurrency: CurrencyCode = readInitialCurrency();

function readInitialCurrency(): CurrencyCode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved === 'PKR' || saved === 'USD') {
        return saved;
      }
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'USD';
}

export function getCurrency(): CurrencyCode {
  return currentCurrency;
}

export function setCurrency(next: CurrencyCode): void {
  if (next !== 'USD' && next !== 'PKR') return;
  if (currentCurrency === next) return;
  currentCurrency = next;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    }
  } catch {
    // Ignore storage errors
  }
  for (const listener of listeners) {
    listener(next);
  }
}

export function subscribeCurrency(listener: CurrencyListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function formatPrice(
  usdAmount: number,
  currency: CurrencyCode = currentCurrency,
  compact = false
): string {
  const safe = Number.isFinite(usdAmount) ? usdAmount : 0;
  if (currency === 'PKR') {
    const pkr = Math.round(safe * PKR_EXCHANGE_RATE);
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(pkr);
    return compact ? `Rs ${formatted}` : `PKR ${formatted}`;
  }
  if (compact && Number.isInteger(safe)) {
    return `$${safe}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(safe);
}
