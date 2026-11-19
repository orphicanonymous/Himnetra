import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel } from '../types';
import { getDashboardPreferences } from '../services/preferences';

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

export function getAreaUnitLabel(): string {
  return getDashboardPreferences().areaUnit === 'ha' ? 'ha' : 'km²';
}

export function formatAreaValue(km2: number, decimals = 2): string {
  if (getDashboardPreferences().areaUnit === 'ha') {
    return (km2 * 100).toLocaleString('en-IN', { maximumFractionDigits: decimals });
  }
  return km2.toFixed(decimals);
}

export function formatArea(km2: number, decimals = 2): string {
  return `${formatAreaValue(km2, decimals)} ${getAreaUnitLabel()}`;
}

export function formatDistance(km: number, decimals = 1): string {
  if (getDashboardPreferences().distanceUnit === 'm') {
    return `${(km * 1000).toLocaleString('en-IN', { maximumFractionDigits: decimals })} m`;
  }
  return `${km.toFixed(decimals)} km`;
}

export function formatElev(m: number): string {
  if (getDashboardPreferences().elevationUnit === 'ft') {
    return `${(m * 3.28084).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ft`;
  }
  return `${m.toLocaleString('en-IN')} m`;
}
