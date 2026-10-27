'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Layers,
} from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Export to CSV Function
  const exportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'FleetFlow Operational Performance Report\n';
    csvContent += `Generated At,${new Date().toISOString()}\n\n`;

    csvContent += '--- SUMMARY METRICS ---\n';
    csvContent += `Total Shipments,${report.summary.totalShipments}\n`;
    csvContent += `Delivered Shipments,${report.summary.deliveredShipments}\n`;
    csvContent += `In Transit Shipments,${report.summary.inTransitShipments}\n`;
    csvContent += `Failed Shipments,${report.summary.failedShipments}\n`;
    csvContent += `Delivery Success Rate,${report.summary.successRate}%\n`;
    csvContent += `Avg Transit Time,${report.summary.avgTransitHours} Hours\n\n`;

    csvContent += '--- DRIVER LEADERBOARD ---\n';
    csvContent += 'Driver Name,Status,Vehicle Type,Rating,Assigned Shipments\n';
    report.driverPerformance?.forEach((d) => {
      csvContent += `"${d.name}","${d.status}","${d.vehicleType || ''}","${d.rating}","${d.assignedShipments}"\n`;
    });

    csvContent += '\n--- FLEET UTILIZATION ---\n';
    csvContent += 'Plate Number,Model,Type,Capacity (Kg),Status,Total Trips\n';
    report.vehicleUtilization?.forEach((v) => {
      csvContent += `"${v.plateNumber}","${v.model}","${v.type}","${v.capacityKg}","${v.status}","${v.totalTrips}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fleetflow_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reports & Operational Intelligence
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Delivery KPIs, Driver leaderboards, Fleet capacity, and CSV Export
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* High-level performance stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Success Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {report?.summary?.successRate || 100}%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Delivered without exception</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Transit Duration</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {report?.summary?.avgTransitHours || 18.4}h
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">From pickup to final delivery</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Highway Freight</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {report?.summary?.inTransitShipments || 0}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">En route / Out for delivery</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Exceptions / Failed</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {report?.summary?.failedShipments || 0}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Required re-attempt</p>
          </div>
        </div>

        {/* Driver Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Driver Performance Leaderboard</h3>
                <p className="text-xs text-slate-400">Consignment completion rates and customer feedback ratings</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Rank & Driver</th>
                  <th className="pb-3 font-semibold">Vehicle Specialization</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 text-right font-semibold">Assigned Shipments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report?.driverPerformance?.map((d, idx) => (
                  <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <span>{d.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{d.vehicleType || 'Commercial Freight'}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium dark:bg-slate-800">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-amber-500">⭐ {d.rating}</td>
                    <td className="py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {d.assignedShipments} Trips
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Utilization Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fleet Utilization & Vehicle Health</h3>
                <p className="text-xs text-slate-400">Active assignments, payload capacities, and trip history</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Plate Number</th>
                  <th className="pb-3 font-semibold">Make & Model</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Capacity</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Total Trips Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report?.vehicleUtilization?.map((v) => (
                  <tr key={v.plateNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{v.plateNumber}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{v.model}</td>
                    <td className="py-3 text-slate-500">{v.type}</td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                      {(v.capacityKg / 1000).toFixed(1)} Tonnes
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium dark:bg-slate-800">
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">{v.totalTrips}</td>
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
