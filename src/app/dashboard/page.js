'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Listen for real-time SSE updates
    let eventSource;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.addEventListener('status_change', () => fetchDashboard(true));
      eventSource.addEventListener('shipment_created', () => fetchDashboard(true));
      eventSource.addEventListener('shipment_deleted', () => fetchDashboard(true));
    } catch {
      //
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <DashboardLayout requiredRole="ADMIN">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Querying live fleet metrics from database...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { metrics, recentShipments, statusDistribution, recentActivity } = data || {};

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Logistics Command Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live operational overview &bull; Real-time PostgreSQL database state
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchDashboard()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/shipments?new=true"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              <span>Create Shipment</span>
            </Link>
          </div>
        </div>

        {/* KPI Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Shipments"
            value={metrics?.totalShipments || 0}
            subtitle={`${metrics?.deliverySuccessRate || 100}% Success Rate`}
            icon={Package}
            color="blue"
            trend="+12% this wk"
          />
          <StatCard
            title="In Transit"
            value={metrics?.inTransitShipments || 0}
            subtitle="Active on highway routes"
            icon={Truck}
            color="purple"
          />
          <StatCard
            title="Delivered"
            value={metrics?.deliveredShipments || 0}
            subtitle="Completed deliveries"
            icon={CheckCircle2}
            color="emerald"
            trend="100% on-time"
          />
          <StatCard
            title="Pending Dispatches"
            value={metrics?.pendingShipments || 0}
            subtitle="Awaiting driver dispatch"
            icon={Clock}
            color="amber"
          />
        </div>

        {/* Secondary KPI Bar: Drivers & Fleet Capacity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Driver Availability</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics?.availableDrivers || 0} <span className="text-xs font-normal text-slate-400">/ {metrics?.totalDrivers || 0} Active</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-blue-500"
                style={{ width: `${((metrics?.availableDrivers || 0) / (metrics?.totalDrivers || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fleet Vehicles Ready</span>
              <Truck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics?.availableVehicles || 0} <span className="text-xs font-normal text-slate-400">/ {metrics?.totalVehicles || 0} Ready</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-emerald-500"
                style={{ width: `${((metrics?.availableVehicles || 0) / (metrics?.totalVehicles || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Delivery Exceptions</span>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics?.failedShipments || 0} <span className="text-xs font-normal text-slate-400">Failed / Closed</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-rose-500"
                style={{ width: `${((metrics?.failedShipments || 0) / (metrics?.totalShipments || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Visual Charts & Status Breakdown Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status Breakdown Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shipment Volume by Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown of active pipeline lifecycle</p>
              </div>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-3.5">
              {statusDistribution?.map((item) => {
                const total = metrics?.totalShipments || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.count} <span className="text-[10px] text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, pct)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Recent Updates Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Activity Log</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {recentActivity?.map((act) => (
                <div key={act.id} className="pt-2.5 first:pt-0 text-xs">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/shipments/${act.shipmentId}`}
                      className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {act.shipment.trackingId}
                    </Link>
                    <StatusBadge status={act.status} size="sm" />
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 leading-snug truncate">
                    {act.notes}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{act.location || act.shipment.recipientCity}</span>
                    <span>&bull;</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Shipments Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Active Shipments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Database live records</p>
            </div>
            <Link
              href="/shipments"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <span>View all shipments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Tracking ID</th>
                  <th className="pb-3 font-semibold">Recipient & City</th>
                  <th className="pb-3 font-semibold">Assigned Driver</th>
                  <th className="pb-3 font-semibold">Vehicle</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentShipments?.map((shipment) => (
                  <tr key={shipment.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-bold text-blue-600 dark:text-blue-400">
                      <Link href={`/shipments/${shipment.id}`} className="hover:underline">
                        {shipment.trackingId}
                      </Link>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{shipment.recipientName}</p>
                      <p className="text-[11px] text-slate-400">{shipment.recipientCity}</p>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {shipment.driver ? (
                        <div>
                          <p className="font-medium">{shipment.driver.name}</p>
                          <p className="text-[10px] text-slate-400">{shipment.driver.phone}</p>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {shipment.vehicle ? (
                        <div>
                          <p className="font-medium">{shipment.vehicle.plateNumber}</p>
                          <p className="text-[10px] text-slate-400">{shipment.vehicle.model}</p>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">No vehicle</span>
                      )}
                    </td>
                    <td className="py-3">
                      <PriorityBadge priority={shipment.priority} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/shipments/${shipment.id}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
