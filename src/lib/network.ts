import type { ChargerStatus, ConnectorType, PricingRule, StationStatus } from '@prisma/client';
import { connectorLabels } from './format';
import { prisma } from './prisma';

export type PublicStatus = 'Available' | 'Charging' | 'Offline' | 'Faulted';

const kigaliZone = 'Africa/Kigali';

// Rwanda stays on UTC+2 all year, so Kigali midnight is a fixed offset from UTC.
export function kigaliDateKey(date: Date) {
  return date.toLocaleDateString('en-CA', { timeZone: kigaliZone });
}

export function startOfKigaliDay(now: Date) {
  return new Date(`${kigaliDateKey(now)}T00:00:00+02:00`);
}

// Value for a datetime-local input, in Kigali time (YYYY-MM-DDTHH:MM).
export function toKigaliInputValue(date: Date | null) {
  if (!date) return '';
  const time = date.toLocaleTimeString('en-GB', { timeZone: kigaliZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return `${kigaliDateKey(date)}T${time}`;
}

function monthKey(date: Date) {
  return kigaliDateKey(date).slice(0, 7);
}

// The last twelve calendar months in Kigali time, oldest first, as YYYY-MM.
export function lastTwelveMonths(now: Date) {
  const [year, month] = kigaliDateKey(now).split('-').map(Number);
  return Array.from({ length: 12 }, (_, index) => {
    const total = year * 12 + (month - 1) + (index - 11);
    const y = Math.floor(total / 12);
    const m = (total % 12) + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  });
}

export function deriveStatus(stationStatus: StationStatus, chargers: { operationalStatus: ChargerStatus }[]): PublicStatus {
  if (stationStatus !== 'ACTIVE' || chargers.length === 0) return 'Offline';
  const statuses = new Set(chargers.map((charger) => charger.operationalStatus));
  if (statuses.has('AVAILABLE')) return 'Available';
  if (statuses.has('CHARGING') || statuses.has('PREPARING') || statuses.has('FINISHING')) return 'Charging';
  if (statuses.has('FAULTED')) return 'Faulted';
  return 'Offline';
}

export async function activePricing(now = new Date()) {
  return prisma.pricingRule.findMany({
    where: { validFrom: { lte: now }, OR: [{ validTo: null }, { validTo: { gt: now } }] }
  });
}

function specificity(rule: PricingRule) {
  return (rule.stationId ? 2 : 0) + (rule.connectorType ? 1 : 0);
}

// The most specific rule wins: station and connector, then station, then connector, then the global rate.
// Among equally specific rules, the most recently started one wins.
export function priceFor(rules: PricingRule[], stationId: string, connector: ConnectorType | null) {
  const candidates = rules
    .filter((rule) => (rule.stationId === null || rule.stationId === stationId) && (rule.connectorType === null || rule.connectorType === connector))
    .sort((a, b) => specificity(b) - specificity(a) || b.validFrom.getTime() - a.validFrom.getTime());
  return candidates[0]?.pricePerKwh ?? null;
}

export type StationRecord = {
  id: string;
  stationId: string;
  name: string;
  address: string;
  district: string;
  sector: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  contact: string | null;
  status: StationStatus;
  chargers: {
    id: string;
    chargerId: string;
    connectorType: ConnectorType;
    powerKw: number;
    numberOfConnectors: number;
    operationalStatus: ChargerStatus;
    networkStatus: ChargerStatus;
  }[];
};

const stationInclude = { chargers: { orderBy: { chargerId: 'asc' as const } } };

export function toPublicStation(station: StationRecord, rules: PricingRule[]) {
  const connectors = [...new Set(station.chargers.map((charger) => charger.connectorType))];
  const prices = connectors.map((connector) => priceFor(rules, station.id, connector)).filter((price): price is number => price !== null);
  return {
    id: station.id,
    stationId: station.stationId,
    name: station.name,
    address: station.address,
    district: station.district,
    sector: station.sector,
    openingHours: station.openingHours,
    contact: station.contact,
    latitude: station.latitude,
    longitude: station.longitude,
    status: deriveStatus(station.status, station.chargers),
    chargerCount: station.chargers.length,
    availableCount: station.chargers.filter((charger) => charger.operationalStatus === 'AVAILABLE').length,
    maxPowerKw: station.chargers.reduce((max, charger) => Math.max(max, charger.powerKw), 0),
    connectors: connectors.map((connector) => connectorLabels[connector]),
    connectorTypes: connectors,
    fromPriceRwf: prices.length ? Math.min(...prices) : priceFor(rules, station.id, null),
    chargers: station.chargers.map((charger) => ({
      chargerId: charger.chargerId,
      connectorType: connectorLabels[charger.connectorType],
      powerKw: charger.powerKw,
      status: charger.operationalStatus,
      priceRwf: priceFor(rules, station.id, charger.connectorType)
    }))
  };
}

// Public pages should still load if the database is briefly unavailable: they show an empty state and log the error.
async function safely<T>(label: string, fallback: T, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`${label} failed:`, error);
    return fallback;
  }
}

type PublicStation = ReturnType<typeof toPublicStation>;

// Only published (ACTIVE) stations appear on the public site.
export async function publicStations(now = new Date()): Promise<PublicStation[]> {
  return safely<PublicStation[]>('Loading public stations', [], async () => {
    const [stations, rules] = await Promise.all([
      prisma.station.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' }, include: stationInclude }),
      activePricing(now)
    ]);
    return stations.map((station) => toPublicStation(station, rules));
  });
}

export async function publicStationById(stationCode: string, now = new Date()): Promise<PublicStation | null> {
  return safely<PublicStation | null>('Loading a public station', null, async () => {
    const [station, rules] = await Promise.all([
      prisma.station.findFirst({ where: { stationId: stationCode, status: 'ACTIVE' }, include: stationInclude }),
      activePricing(now)
    ]);
    return station ? toPublicStation(station, rules) : null;
  });
}

export async function chargerByCode(chargerCode: string, now = new Date()) {
  const charger = await prisma.charger.findUnique({ where: { chargerId: chargerCode }, include: { station: true } });
  if (!charger) return null;
  const rules = await activePricing(now);
  return {
    chargerId: charger.chargerId,
    manufacturer: charger.manufacturer,
    model: charger.model,
    powerKw: charger.powerKw,
    connectorType: connectorLabels[charger.connectorType],
    numberOfConnectors: charger.numberOfConnectors,
    status: charger.operationalStatus,
    priceRwf: priceFor(rules, charger.stationId, charger.connectorType),
    station: {
      stationId: charger.station.stationId,
      name: charger.station.name,
      address: charger.station.address,
      openingHours: charger.station.openingHours,
      status: charger.station.status
    }
  };
}

// Global (all-station) rate, if one has been set.
export async function globalRateRwf(now = new Date()): Promise<number | null> {
  return safely<number | null>('Loading the global rate', null, async () => priceFor(await activePricing(now), '', null));
}

export async function overviewMetrics(now = new Date()) {
  const startToday = startOfKigaliDay(now);
  const [stations, chargers, online, faulted, charging, customers, revenueToday, energyToday, sessionsToday] = await Promise.all([
    prisma.station.count({ where: { status: 'ACTIVE' } }),
    prisma.charger.count(),
    prisma.charger.count({ where: { operationalStatus: { not: 'OFFLINE' } } }),
    prisma.charger.count({ where: { operationalStatus: 'FAULTED' } }),
    prisma.chargingSession.count({ where: { status: 'CHARGING' } }),
    prisma.customerProfile.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', timestamp: { gte: startToday } } }),
    prisma.chargingSession.aggregate({ _sum: { energyDeliveredKwh: true }, where: { startTime: { gte: startToday } } }),
    prisma.chargingSession.count({ where: { startTime: { gte: startToday } } })
  ]);
  return {
    stations,
    chargers,
    online,
    faulted,
    charging,
    customers,
    sessionsToday,
    revenueToday: revenueToday._sum.amount ?? 0,
    energyToday: energyToday._sum.energyDeliveredKwh ?? 0
  };
}

export async function monthlySeries(now = new Date()) {
  const months = lastTwelveMonths(now);
  const since = new Date(`${months[0]}-01T00:00:00+02:00`);
  const [payments, sessions] = await Promise.all([
    prisma.payment.findMany({ where: { status: 'PAID', timestamp: { gte: since } }, select: { amount: true, timestamp: true } }),
    prisma.chargingSession.findMany({ where: { startTime: { gte: since } }, select: { startTime: true, energyDeliveredKwh: true } })
  ]);

  const revenue = new Map(months.map((month) => [month, 0]));
  const energy = new Map(months.map((month) => [month, 0]));
  const sessionCount = new Map(months.map((month) => [month, 0]));
  for (const payment of payments) {
    const key = monthKey(payment.timestamp);
    if (revenue.has(key)) revenue.set(key, (revenue.get(key) ?? 0) + payment.amount);
  }
  for (const session of sessions) {
    const key = monthKey(session.startTime);
    if (sessionCount.has(key)) {
      sessionCount.set(key, (sessionCount.get(key) ?? 0) + 1);
      energy.set(key, (energy.get(key) ?? 0) + (session.energyDeliveredKwh ?? 0));
    }
  }

  return {
    months,
    revenue: months.map((month) => revenue.get(month) ?? 0),
    energy: months.map((month) => energy.get(month) ?? 0),
    sessions: months.map((month) => sessionCount.get(month) ?? 0)
  };
}

// Bar heights scaled to the largest value, so an empty series draws empty bars.
export function barPercentages(values: number[]) {
  const max = Math.max(0, ...values);
  return values.map((value) => (max > 0 ? Math.round((value / max) * 100) : 0));
}

export async function utilisationByStation() {
  const stations = await prisma.station.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    include: { chargers: { select: { operationalStatus: true } } }
  });
  return stations.map((station) => {
    const total = station.chargers.length;
    const busy = station.chargers.filter((charger) => charger.operationalStatus === 'CHARGING').length;
    return { id: station.id, name: station.name, busy, total, percent: total ? Math.round((busy / total) * 100) : 0 };
  });
}
