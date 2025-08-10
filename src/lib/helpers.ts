import { Talao, ItemTal } from '@/types';

export function valorTotalTalao(talao: Talao): number {
  return talao.itens.reduce((total, item) => {
    const qtdLiquida = qtdLiquidaItem(item);
    const preco = item.precoUnit || 0;
    return total + (qtdLiquida * preco);
  }, 0);
}

export function qtdLiquidaItem(item: ItemTal): number {
  const entregue = item.qtdEntregue || 0;
  const devolvida = item.qtdDevolvida || 0;
  return entregue - devolvida;
}

export function toBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateTalaoNumber(): string {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-6);
  return `TAL-${timestamp}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR');
}