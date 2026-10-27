'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Route based on role
      if (data.user.role === 'DRIVER') {
        router.push('/driver/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo fill buttons
  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@fleetflow.com');
      setPassword('Admin@123');
    } else {
      setEmail('rajesh.driver@fleetflow.com');
      setPassword('Driver@123');
    }
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Left Promotional Banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">Fleet<span className="text-blue-400">Flow</span></span>
            <p className="text-xs text-slate-400">Logistics & Fleet Operations Platform</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            CodSoft Task 5 Full-Stack Submission
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Next-Generation Logistics & Real-Time Fleet Intelligence.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Centralized tracking, smart driver dispatch, vehicle capacity tracking, and multi-warehouse routing in one unified platform.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="block text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-slate-400">Live SSE Status Updates</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="block text-2xl font-bold text-blue-400">Prisma</span>
              <span className="text-xs text-slate-400">PostgreSQL Relational DB</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          FleetFlow Platform &bull; Built for CodSoft Internship 2026
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Fleet<span className="text-blue-400">Flow</span></span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Sign in to your account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Access the administrative dashboard or driver delivery terminal.
            </p>
          </div>

          {/* Quick 1-Click Demo Buttons */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              ⚡ Quick 1-Click Demo Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
              >
                <ShieldCheck className="h-4 w-4" />
                Fill Admin (Vikram)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('driver')}
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
              >
                <UserCheck className="h-4 w-4" />
                Fill Driver (Rajesh)
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fleetflow.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Need a new account?{' '}
            <Link href="/register" className="font-semibold text-blue-400 hover:underline">
              Create an account
            </Link>
            {' '}&bull;{' '}
            <Link href="/track" className="font-semibold text-slate-300 hover:underline">
              Public Tracking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
