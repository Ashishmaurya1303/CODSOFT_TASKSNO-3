'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PackageCheck,
  Users,
  Truck,
  Building2,
  BarChart3,
  Search,
  Navigation,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function Sidebar({ user, isOpen, setIsOpen }) {
  const pathname = usePathname();

  const isAdmin = !user || user.role === 'ADMIN';
  const isDriver = user?.role === 'DRIVER';

  const adminNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', href: '/shipments', icon: PackageCheck },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Fleet Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Warehouses', href: '/warehouses', icon: Building2 },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'Public Tracker', href: '/track', icon: Search },
  ];

  const driverNav = [
    { name: 'My Deliveries', href: '/driver/dashboard', icon: Navigation },
    { name: 'Public Tracker', href: '/track', icon: Search },
  ];

  const navItems = isDriver ? driverNav : adminNav;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-100 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Fleet<span className="text-blue-400">Flow</span></span>
              <span className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">Logistics Platform</span>
            </div>
          </Link>
        </div>

        {/* User Role Card */}
        <div className="mx-4 my-4 rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              {isDriver ? <UserCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
              <div className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${isDriver ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {isDriver ? 'Driver Portal' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
