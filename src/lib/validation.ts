import { z } from 'zod';
import { chargerStatuses, stationStatuses } from './format';

const requiredText = (max: number) => z.string().trim().min(1, 'Required').max(max);
const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

// Form numbers arrive as strings. An empty box must fail validation, not quietly become 0.
const numberText = (min: number, max: number, integer = false) =>
  z
    .string()
    .trim()
    .regex(integer ? /^-?\d+$/ : /^-?\d+(\.\d+)?$/, 'Enter a number')
    .transform(Number)
    .refine((value) => value >= min && value <= max, `Must be between ${min} and ${max}`);

export const stationSchema = z.object({
  name: requiredText(120),
  address: requiredText(200),
  district: requiredText(80),
  sector: requiredText(80),
  latitude: numberText(-90, 90),
  longitude: numberText(-180, 180),
  openingHours: requiredText(80),
  contact: optionalText(120),
  status: z.enum(stationStatuses)
});

// Charger codes appear in QR links (/charge/CODE), so keep them URL-safe.
export const chargerSchema = z.object({
  stationId: z.string().trim().min(1, 'Choose a station'),
  chargerId: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and dashes only'),
  manufacturer: requiredText(80),
  model: requiredText(80),
  serialNumber: requiredText(80),
  powerKw: numberText(1, 1000, true),
  connectorType: z.enum(['CCS2', 'GB_T']),
  numberOfConnectors: numberText(1, 8, true),
  operationalStatus: z.enum(chargerStatuses),
  ocppIdentity: optionalText(80)
});

// An empty station or connector means the rate applies to all of them.
export const pricingCreateSchema = z.object({
  stationId: z.string().trim().transform((value) => value || null),
  connectorType: z.enum(['', 'CCS2', 'GB_T']).transform((value) => value || null),
  pricePerKwh: numberText(1, 100000, true),
  validFrom: z.string().trim().min(1, 'Choose a start time'),
  validTo: z.string().trim().transform((value) => value || null)
});

export const pricingUpdateSchema = z.object({
  pricePerKwh: numberText(1, 100000, true),
  validTo: z.string().trim().transform((value) => value || null)
});

export const staffCreateSchema = z.object({
  email: z.string().trim().max(254).email('Enter a valid email address'),
  fullName: requiredText(120),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER', 'SUPPORT']),
  password: z.string().min(12, 'Use at least 12 characters').max(128, 'Use at most 128 characters')
});

export const staffRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER', 'SUPPORT'])
});

export const ticketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
});

// Datetime-local inputs carry no timezone. Rwanda is UTC+2, so read them as Kigali time.
export function kigaliDateTime(value: string) {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${withSeconds}+02:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Only send people back to admin pages, never to another site.
export function safeAdminPath(value: FormDataEntryValue | null, fallback: string) {
  const path = typeof value === 'string' ? value : '';
  return path.startsWith('/admin/') && !path.startsWith('//') ? path : fallback;
}
