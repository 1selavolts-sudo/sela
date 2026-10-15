import type { ChargerStatus, ConnectorType, StationStatus } from '@prisma/client';

export const connectorTypes = ['CCS2', 'GB_T'] as const satisfies readonly ConnectorType[];
export const chargerStatuses = ['AVAILABLE', 'CHARGING', 'PREPARING', 'SUSPENDED', 'FINISHING', 'FAULTED', 'UNAVAILABLE', 'OFFLINE'] as const satisfies readonly ChargerStatus[];
export const stationStatuses = ['ACTIVE', 'MAINTENANCE', 'INACTIVE'] as const satisfies readonly StationStatus[];

export const connectorLabels: Record<ConnectorType, string> = { CCS2: 'CCS2', GB_T: 'GB/T' };

export const chargerStatusLabels: Record<ChargerStatus, string> = {
  AVAILABLE: 'Available',
  CHARGING: 'Charging',
  PREPARING: 'Preparing',
  SUSPENDED: 'Suspended',
  FINISHING: 'Finishing',
  FAULTED: 'Faulted',
  UNAVAILABLE: 'Unavailable',
  OFFLINE: 'Offline'
};

export const stationStatusLabels: Record<StationStatus, string> = { ACTIVE: 'Open', MAINTENANCE: 'Maintenance', INACTIVE: 'Closed' };

export type Tone = 'green' | 'cyan' | 'amber' | 'red' | 'slate';

export const chargerStatusTones: Record<ChargerStatus, Tone> = {
  AVAILABLE: 'green',
  CHARGING: 'cyan',
  PREPARING: 'cyan',
  SUSPENDED: 'amber',
  FINISHING: 'cyan',
  FAULTED: 'red',
  UNAVAILABLE: 'slate',
  OFFLINE: 'slate'
};

export const stationStatusTones: Record<StationStatus, Tone> = { ACTIVE: 'green', MAINTENANCE: 'amber', INACTIVE: 'slate' };

export function formatRwf(amount: number) {
  return `RWF ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatKwh(kwh: number) {
  return `${kwh.toLocaleString('en-US', { maximumFractionDigits: 1 })} kWh`;
}

// Dates are shown in Rwanda time regardless of where the server runs.
export function formatDateTime(date: Date) {
  return date.toLocaleString('en-GB', { timeZone: 'Africa/Kigali', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(start: Date, end: Date | null) {
  if (!end) return 'In progress';
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function googleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
