import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateTalaoNumber(): string {
  const now = new Date()
  const timestamp = now.getTime().toString().slice(-6)
  return `TAL-${timestamp}`
}