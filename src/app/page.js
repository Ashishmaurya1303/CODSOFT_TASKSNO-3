'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  ShieldCheck,
  Search,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  BarChart3,
  Users,
  Building2,
  CheckCircle2,
  Radio,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [quickTrack, setQuickTrack] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!quickTrack.trim()) return;
    router.push(`/track/${encodeURIComponent(quickTrack.trim().toUpperCase())}`);
  };

  const sampleIds = ['FF-89210-IN', 'FF-74125-IN', 'FF-63941-IN'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">Fleet<span className="text-blue-400">Flow</span></span>
              <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-semibold">Logistics & Fleet</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              <Search className="h-3.5 w-3.5 text-blue-400" />
              <span>Public Tracker</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6">
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>CodSoft Full-Stack Web Development Task 5</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Enterprise Logistics & <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                Live Fleet Intelligence
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
              End-to-end logistics platform managing shipments, commercial drivers, fleet payloads, regional warehouse hubs, and live customer status tracking.
            </p>

            {/* Quick Hero Tracking Box */}
            <div className="mx-auto mt-10 max-w-xl">
              <form onSubmit={handleTrackSubmit} className="relative flex items-center rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
                <Search className="ml-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={quickTrack}
                  onChange={(e) => setQuickTrack(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. FF-89210-IN)..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
                >
                  <span>Track</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Sample IDs */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>Sample ID:</span>
                {sampleIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => router.push(`/track/${id}`)}
                    className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-blue-400 hover:border-blue-500/50"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
              >
                Access Admin Dashboard
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Driver Portal Login
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="border-t border-slate-800/80 bg-slate-900/30 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Platform Capabilities</span>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Built for Scale and Full Visibility</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Real-Time Status Engine</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  WebSockets / SSE live event streaming triggers immediate dashboard card updates without needing page refreshes.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Role-Based Access Control</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Segregated Admin and Driver permissions, bcrypt-hashed credentials, and JWT HTTP-only cookie sessions.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">PostgreSQL & Prisma ORM</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Fully normalized relational schema tracking shipments, drivers, vehicles, warehouses, and status history logs.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Smart Driver Dispatch</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Commercial license verification, availability tracking, and conflict-prevention assignment algorithms.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 mb-4">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Multi-Warehouse Routing</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Interactive route corridor visualizer connecting regional distribution hubs across India with capacity monitoring.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Analytics & CSV Export</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Delivery success rates, vehicle utilization breakdown, driver rankings, and 1-click CSV report downloads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>FleetFlow &bull; Logistics & Fleet Management Web Application</p>
        <p className="mt-1 text-slate-600">Developed for CodSoft Full Stack Internship Task 5</p>
      </footer>
    </div>
  );
}
