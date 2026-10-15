import type { ChargerStatus } from '@prisma/client';
import { chargerStatusLabels } from '@/lib/format';

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export type ChargerValues = {
  stationId?: string;
  chargerId?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  powerKw?: number;
  connectorType?: 'CCS2' | 'GB_T';
  numberOfConnectors?: number;
  operationalStatus?: ChargerStatus;
  ocppIdentity?: string | null;
};

// The same fields are used to add and to edit a charger.
export function ChargerFields({ stations, values = {} }: { stations: { id: string; name: string }[]; values?: ChargerValues }) {
  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Station
        <select name="stationId" required defaultValue={values.stationId ?? ''} className={inputClass}>
          <option value="" disabled>Choose a station</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>{station.name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Charger code (used in QR links)
        <input name="chargerId" required minLength={2} maxLength={40} pattern="[A-Za-z0-9-]+" defaultValue={values.chargerId ?? ''} placeholder="e.g. KGL-01" className={inputClass} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Manufacturer
        <input name="manufacturer" required maxLength={80} defaultValue={values.manufacturer ?? ''} className={inputClass} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Model
        <input name="model" required maxLength={80} defaultValue={values.model ?? ''} className={inputClass} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Serial number
        <input name="serialNumber" required maxLength={80} defaultValue={values.serialNumber ?? ''} className={inputClass} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Power (kW)
        <input name="powerKw" required inputMode="numeric" defaultValue={values.powerKw ?? ''} className={inputClass} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Connector
        <select name="connectorType" required defaultValue={values.connectorType ?? 'CCS2'} className={inputClass}>
          <option value="CCS2">CCS2</option>
          <option value="GB_T">GB/T</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Connectors on this charger
        <input name="numberOfConnectors" required inputMode="numeric" defaultValue={values.numberOfConnectors ?? 1} className={inputClass} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Status
        <select name="operationalStatus" required defaultValue={values.operationalStatus ?? 'AVAILABLE'} className={inputClass}>
          {(Object.keys(chargerStatusLabels) as ChargerStatus[]).map((status) => (
            <option key={status} value={status}>{chargerStatusLabels[status]}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">OCPP identity (optional)
        <input name="ocppIdentity" maxLength={80} defaultValue={values.ocppIdentity ?? ''} className={inputClass} />
      </label>
    </>
  );
}
