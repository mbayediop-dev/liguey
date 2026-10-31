export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export function detectBrand(number: string): CardBrand {
  const n = number.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
}

export function brandLabel(b: string): string {
  switch (b) {
    case 'visa':
      return 'VISA';
    case 'mastercard':
      return 'MASTERCARD';
    case 'amex':
      return 'AMERICAN EXPRESS';
    default:
      return 'CARTE';
  }
}

export function formatCardNumber(raw: string): string {
  const n = raw.replace(/\D/g, '').slice(0, 19);
  if (detectBrand(n) === 'amex') {
    return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)].filter(Boolean).join(' ');
  }
  return n.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function luhnValid(raw: string): boolean {
  const n = raw.replace(/\D/g, '');
  if (n.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function formatExpiry(raw: string): string {
  const n = raw.replace(/\D/g, '').slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}/${n.slice(2)}`;
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const m = /^(\d{2})\s*\/?\s*(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return null;
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return null;
  return { month, year };
}

export function maskedNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}
