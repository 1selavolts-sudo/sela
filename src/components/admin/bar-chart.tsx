import { barPercentages } from '@/lib/network';

const tones = {
  green: 'from-brand-green to-brand-cyan',
  cyan: 'from-brand-cyan to-sky-400',
  amber: 'from-amber-400 to-orange-500'
};

// Short month name for a YYYY-MM key, read in Kigali time.
export function monthLabel(key: string) {
  return new Date(`${key}-01T00:00:00+02:00`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'Africa/Kigali' });
}

// Vertical bars scaled to the largest value. Shows an empty note when every value is zero.
export function BarChart({ values, labels, tone = 'green' }: { values: number[]; labels: string[]; tone?: keyof typeof tones }) {
  if (values.every((value) => value === 0)) {
    return <p className="py-12 text-center text-sm text-slate-500">No activity recorded in this period yet.</p>;
  }

  const heights = barPercentages(values);
  return (
    <div className="flex h-56 items-end gap-2">
      {values.map((value, index) => (
        <div key={labels[index]} className="flex h-full flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div className={`w-full rounded-t-2xl bg-gradient-to-t ${tones[tone]}`} style={{ height: `${heights[index]}%` }} title={`${labels[index]}: ${value}`} />
          </div>
          <span className="text-[10px] text-slate-500">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}
