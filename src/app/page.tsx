import Link from 'next/link';
import { ArrowRight, BatteryCharging, MapPin, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

const stations = [
	{ name: 'Kigali Central Hub', location: 'KN 5 Avenue, Kigali', status: 'Available', power: '120 kW' },
	{ name: 'Rusumo Border Charging', location: 'Rusumo Junction', status: 'Available', power: '180 kW' },
	{ name: 'Nyagatare Rest Stop', location: 'Amahoro Road, Nyagatare', status: 'Charging', power: '60 kW' }
];

export default function HomePage() {
	return (
		<div className="min-h-screen bg-brand-bg">
			<Navbar />
			<main>
				<section className="border-b border-slate-200 bg-gradient-to-br from-brand-navy via-slate-900 to-slate-800 text-white">
					<div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-28">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-cyan">Rwanda charging network</p>
							<h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">Easy charging for Rwanda.</h1>
							<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Find a charger, pay quickly, and drive with confidence across Kigali and the rest of Rwanda.</p>
							<div className="mt-8 flex flex-wrap gap-4">
								<Link href="/stations" className="inline-flex items-center gap-2 rounded-2xl bg-brand-green px-5 py-3 font-semibold text-brand-navy hover:bg-emerald-300">Find a charger <ArrowRight className="h-4 w-4" /></Link>
								<Link href="/contact" className="rounded-2xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10">Become a partner</Link>
							</div>
							<div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
								<div><p className="text-3xl font-black">32</p><p className="text-sm text-slate-400">Stations</p></div>
								<div><p className="text-3xl font-black">148</p><p className="text-sm text-slate-400">Chargers</p></div>
								<div><p className="text-3xl font-black">24/7</p><p className="text-sm text-slate-400">Support</p></div>
							</div>
						</div>
						<div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
							<div className="flex items-center justify-between"><p className="text-sm font-semibold text-brand-cyan">Live station</p><span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-200">Available</span></div>
							<h2 className="mt-4 text-2xl font-bold">Kigali Central Hub</h2>
							<p className="mt-2 text-slate-300">KN 5 Avenue, Kigali</p>
							<div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-slate-400">Power</p><p className="mt-1 text-xl font-bold">120 kW</p></div><div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-slate-400">Rate</p><p className="mt-1 text-xl font-bold">RWF 420/kWh</p></div></div>
							<div className="mt-6 flex items-center gap-2 text-sm text-slate-300"><MapPin className="h-4 w-4 text-brand-cyan" /> Kigali • Rubavu • Rusumo</div>
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-cyan">Why SELAVOLT</p><h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">Charging that is simple, fast, and reliable.</h2><p className="mt-4 text-slate-600">From highway routes to city centers, SELAVOLT makes EV charging clear and accessible for everyday travel.</p></div>
					<div className="mt-10 grid gap-5 md:grid-cols-3"><div className="card-surface"><BatteryCharging className="h-7 w-7 text-brand-green" /><h3 className="mt-5 text-xl font-bold text-brand-navy">Fast charging</h3><p className="mt-2 text-slate-600">Dependable charging lanes along Rwanda&apos;s busiest corridors.</p></div><div className="card-surface"><ShieldCheck className="h-7 w-7 text-brand-green" /><h3 className="mt-5 text-xl font-bold text-brand-navy">Secure operations</h3><p className="mt-2 text-slate-600">Built for uptime, billing integrity, and trusted network operations.</p></div><div className="card-surface"><MapPin className="h-7 w-7 text-brand-green" /><h3 className="mt-5 text-xl font-bold text-brand-navy">Smart routing</h3><p className="mt-2 text-slate-600">Find the best available charger near your route in a few taps.</p></div></div>
				</section>

				<section className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-cyan">Network</p><h2 className="mt-3 text-3xl font-black text-brand-navy">Find a charger nearby.</h2></div><Link href="/stations" className="font-semibold text-brand-navy">View all stations <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{stations.map((station) => <div key={station.name} className="card-surface"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-brand-navy">{station.name}</h3><span className="text-xs font-semibold text-brand-green">{station.status}</span></div><p className="mt-3 text-sm text-slate-600">{station.location}</p><div className="mt-6 flex justify-between text-sm"><span className="text-slate-500">Power</span><span className="font-semibold text-brand-navy">{station.power}</span></div></div>)}</div></div></section>
			</main>
			<Footer />
		</div>
	);
}
