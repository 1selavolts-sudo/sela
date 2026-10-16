import { z } from 'zod';
import { adminRoles } from './admin-access';
import { accountStatuses, chargerStatuses, notificationChannels, paymentStatuses, sessionStatuses, stationStatuses } from './format';

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

// Optional number boxes: an empty box means no value, while anything typed must be a number in range.
const optionalNumberText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^-?\d+(\.\d+)?$/.test(value), 'Enter a number')
    .transform((value) => (value === '' ? null : Number(value)))
    .refine((value) => value === null || (value >= min && value <= max), `Must be between ${min} and ${max}`);

// NONE removes admin access and leaves the account as a customer.
const staffRoleChoices = [...adminRoles, 'NONE'] as const;

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

// An empty station or connector means the rate applies to all of them. Also used when editing a rate.
export const pricingCreateSchema = z.object({
  stationId: z.string().trim().transform((value) => value || null),
  connectorType: z.enum(['', 'CCS2', 'GB_T']).transform((value) => value || null),
  pricePerKwh: numberText(1, 100000, true),
  validFrom: z.string().trim().min(1, 'Choose a start time'),
  validTo: z.string().trim().transform((value) => value || null)
});

export const staffCreateSchema = z.object({
  email: z.string().trim().max(254).email('Enter a valid email address'),
  fullName: requiredText(120),
  role: z.enum(adminRoles),
  password: z.string().min(12, 'Use at least 12 characters').max(128, 'Use at most 128 characters')
});

export const staffRoleSchema = z.object({
  role: z.enum(staffRoleChoices)
});

// Editing a staff member. A blank password keeps the current one.
export const staffProfileSchema = z.object({
  fullName: requiredText(120),
  email: z.string().trim().max(254).email('Enter a valid email address'),
  role: z.enum(staffRoleChoices),
  password: z
    .string()
    .max(128, 'Use at most 128 characters')
    .transform((value) => value || null)
    .refine((value) => value === null || value.length >= 12, 'Use at least 12 characters')
});

export const ticketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
});

export const ticketDetailsSchema = z.object({
  subject: requiredText(120),
  message: requiredText(2000),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
});

export const customerSchema = z.object({
  fullName: requiredText(120),
  email: z.string().trim().max(254).email('Enter a valid email address'),
  phoneNumber: optionalText(40),
  accountStatus: z.enum(accountStatuses),
  preferredConnector: z.enum(['', 'CCS2', 'GB_T']).transform((value) => value || null),
  vehicleMake: optionalText(80),
  vehicleModel: optionalText(80),
  licensePlate: optionalText(20)
});

export const sessionSchema = z.object({
  status: z.enum(sessionStatuses),
  paymentStatus: z.enum(paymentStatuses),
  startTime: z.string().trim().min(1, 'Choose a start time'),
  endTime: z.string().trim().transform((value) => value || null),
  energyDeliveredKwh: optionalNumberText(0, 100000),
  totalAmount: optionalNumberText(0, 100000000),
  notes: optionalText(500)
});

export const paymentSchema = z.object({
  status: z.enum(paymentStatuses),
  amount: numberText(0, 100000000),
  paymentMethod: optionalText(60),
  energyKwh: numberText(0, 100000),
  timestamp: z.string().trim().min(1, 'Choose a time')
});

export const notificationSchema = z.object({
  title: requiredText(120),
  message: requiredText(1000),
  channel: z.enum(notificationChannels),
  // An unticked checkbox sends no value at all, so a missing field means "not read".
  read: z.enum(['', 'yes']).optional().transform((value) => value === 'yes')
});

// Rwandan mobile numbers, typed with or without spaces and +250. Returns them as 07… digits, or null.
export function normaliseRwandaMobile(value: string) {
  const match = /^(?:\+?250|0)?(7\d{8})$/.exec(value.replace(/[\s()-]/g, ''));
  return match ? `0${match[1]}` : null;
}

export const supportWhatsAppSchema = z.object({
  whatsapp: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const normalised = normaliseRwandaMobile(value);
      if (!normalised) {
        ctx.addIssue({ code: 'custom', message: 'Enter a Rwandan mobile number, for example 0789 662 677' });
        return z.NEVER;
      }
      return normalised;
    })
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
