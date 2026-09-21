export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function getWhatsAppLink(phone: string, message: string): string {
  const clean = cleanPhone(phone);
  // Default to Brazil +55 prefix if not present
  const fullNumber = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}
