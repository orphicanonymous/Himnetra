import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW':      return '#22c55e';
    case 'MEDIUM':   return '#f59e0b';
    case 'HIGH':     return '#f97316';
    case 'CRITICAL': return '#ef4444';
  }
}

export function getRiskBg(level: RiskLevel): string {
  switch (level) {
    case 'LOW':      return 'rgba(34,197,94,0.12)';
    case 'MEDIUM':   return 'rgba(245,158,11,0.12)';
    case 'HIGH':     return 'rgba(249,115,22,0.12)';
    case 'CRITICAL': return 'rgba(239,68,68,0.12)';
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatArea(km2: number): string {
  return `${km2.toFixed(2)} km²`;
}

export function formatElev(m: number): string {
  return `${m.toLocaleString('en-IN')} m`;
}
