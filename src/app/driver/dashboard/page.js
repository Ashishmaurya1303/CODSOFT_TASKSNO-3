'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import {
  Truck,
  Navigation,
  MapPin,
  CheckCircle2,
  Phone,
  Clock,
  Send,
  AlertCircle,
  Package,
  Calendar,
} from 'lucide-react';

export default function DriverDashboardPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeShipment, setActiveShipment] = useState(null);

  // Status update form
  const [selectedStatus, setSelectedStatus] = useState('IN_TRANSIT');
  const [locationText, setLocationText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchMyDeliveries = useCallback(async () => {
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const data = await res.json();
        setShipments(data.shipments || []);
      }
    } catch (err) {
      console.error('Fetch driver shipments error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDeliveries();
  }, [fetchMyDeliveries]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeShipment) return;

    setUpdating(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/shipments/${activeShipment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          location: locationText || activeShipment.recipientCity,
          notes: notesText || `Driver marked as ${selectedStatus.replace('_', ' ')}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update delivery');

      setMessage(`Shipment ${activeShipment.trackingId} status updated to ${selectedStatus}!`);
      setActiveShipment(null);
      setLocationText('');
      setNotesText('');
      fetchMyDeliveries();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardLayout requiredRole="DRIVER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Driver Delivery Terminal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live dispatched manifests assigned to your vehicle
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Truck className="h-4 w-4" />
            <span>{shipments.length} Active Consignments</span>
          </span>
        </div>

        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Assigned Shipments List */}
        <div className="space-y-4">
          {loading ? (
            <p className="py-12 text-center text-xs text-slate-400">Loading your deliveries...</p>
          ) : shipments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">All Caught Up!</h3>
              <p className="text-xs text-slate-500 mt-1">No pending dispatches assigned to you right now.</p>
            </div>
          ) : (
            shipments.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                        {s.trackingId}
                      </span>
                      <PriorityBadge priority={s.priority} />
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Deliver to: <span className="font-semibold text-slate-800 dark:text-slate-200">{s.recipientName}</span> ({s.recipientCity})
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveShipment(s);
                      setSelectedStatus(s.status === 'PENDING' ? 'PICKED_UP' : s.status === 'PICKED_UP' ? 'IN_TRANSIT' : 'OUT_FOR_DELIVERY');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Update Status</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-3 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[11px]">Delivery Address:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{s.recipientAddress}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Contact Phone:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{s.recipientPhone || 'N/A'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Cargo Spec:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{s.weightKg} Kg &bull; {s.packageType}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Update Delivery Status */}
        {activeShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Status: {activeShipment.trackingId}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Recipient: {activeShipment.recipientName} ({activeShipment.recipientCity})
              </p>

              <form onSubmit={handleUpdateStatus} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Set Current Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="PICKED_UP">Picked Up from Warehouse</option>
                    <option value="IN_TRANSIT">In Transit on Highway</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery to Recipient</option>
                    <option value="DELIVERED">Delivered (Handover Complete)</option>
                    <option value="FAILED">Delivery Failed / Customer Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Current Checkpoint Location</label>
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="e.g. NH-48 Toll Gate 3 / Recipient Gate"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Delivery Notes</label>
                  <input
                    type="text"
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="e.g. Signed by Security In-charge"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveShipment(null)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {updating ? 'Transmitting...' : 'Confirm Status Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
