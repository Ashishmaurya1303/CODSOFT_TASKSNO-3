'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Search, ArrowRight, ShieldCheck, Clock, MapPin, PackageCheck } from 'lucide-react';

export default function TrackPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    router.push(`/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
  };

  const sampleTrackings = ['FF-89210-IN', 'FF-74125-IN', 'FF-63941-IN', 'FF-18450-IN'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/30">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Fleet<span className="text-blue-400">Flow</span></span>
              <span className="block text-[10px] tracking-wider text-slate-400 uppercase">Live Public Tracker</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Search Section */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
          <PackageCheck className="h-4 w-4" />
          <span>Real-Time Shipment Consignment Tracking</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Track Your Shipment in Real-Time
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-400 leading-relaxed">
          Enter your unique FleetFlow Tracking ID to view chronological transit milestones, checkpoint locations, and delivery status.
        </p>

        {/* Tracking Search Input Box */}
        <form onSubmit={handleTrack} className="mt-8 w-full max-w-xl">
          <div className="relative flex items-center rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
            <Search className="ml-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. FF-89210-IN)..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
            >
              <span>Track Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Quick Sample IDs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span>Try quick sample:</span>
          {sampleTrackings.map((id) => (
            <button
              key={id}
              onClick={() => router.push(`/track/${id}`)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-blue-400 transition hover:border-blue-500/50 hover:bg-slate-800"
            >
              {id}
            </button>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 w-full text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <Clock className="h-5 w-5 text-blue-400 mb-2" />
            <h4 className="font-bold text-xs text-white">Live Status Transitions</h4>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              Real-time updates as cargo is picked up, dispatched, and delivered.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <MapPin className="h-5 w-5 text-emerald-400 mb-2" />
            <h4 className="font-bold text-xs text-white">Verified Route Hubs</h4>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              Recorded scans at regional distribution centers and transit checkpoints.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <ShieldCheck className="h-5 w-5 text-amber-400 mb-2" />
            <h4 className="font-bold text-xs text-white">Driver Verification</h4>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              Assigned commercial fleet drivers and security handover verification.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        FleetFlow &bull; Logistics & Fleet Management System &bull; CodSoft Full Stack Task 5
      </footer>
    </div>
  );
}
