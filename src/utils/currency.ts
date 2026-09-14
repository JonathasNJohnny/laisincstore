/**
 * Formata um valor em centavos para a moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Formata um valor já em reais para BRL
 */
export function formatCurrencyReal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Converte valor em reais para centavos
 */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

/**
 * Converte centavos para reais
 */
export function toReais(value: number): number {
  return value / 100;
}

/**
 * Calcula porcentagem de desconto
 */
export function calculateDiscountPercentage(price: number, oldPrice: number): number {
  if (oldPrice <= 0 || price >= oldPrice) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Calcula subtotal de itens do carrinho
 */
export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}