'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import {
  ArrowLeft,
  Truck,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Building2,
  Send,
  AlertCircle,
  FileText,
  Weight,
} from 'lucide-react';

function ShipmentDetailContent({ params }) {
  const unwrappedParams = use(params);
  const shipmentId = unwrappedParams.id;

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Update Form State
  const [newStatus, setNewStatus] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchShipment = useCallback(async () => {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (!res.ok) {
        throw new Error('Shipment not found');
      }
      const data = await res.json();
      setShipment(data.shipment);
      setNewStatus(data.shipment.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    fetchShipment();

    // SSE listener for real-time changes
    let eventSource;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.addEventListener('status_change', () => fetchShipment());
    } catch {
      //
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchShipment]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess('');
    setError('');

    try {
      const res = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          location: updateLocation || shipment.currentLocation || shipment.recipientCity,
          notes: updateNotes || `Status updated to ${newStatus.replace('_', ' ')}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setUpdateSuccess(`Status successfully updated to ${newStatus}!`);
      setUpdateNotes('');
      fetchShipment();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Loading consignment details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !shipment) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/20">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
          <h2 className="text-base font-bold text-rose-700 dark:text-rose-400">Error Loading Shipment</h2>
          <p className="text-xs text-rose-600 mt-1">{error || 'Consignment could not be found.'}</p>
          <Link
            href="/shipments"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Shipments
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/shipments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shipments</span>
          </Link>

          <Link
            href={`/track/${shipment.trackingId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>Open Public Tracking Link</span>
          </Link>
        </div>

        {/* Tracking Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracking Manifest</span>
                <PriorityBadge priority={shipment.priority} />
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {shipment.trackingId}
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Created on {new Date(shipment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; Expected by {new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={shipment.status} size="lg" />
            </div>
          </div>
        </div>

        {/* Live Status Updater Card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Update Delivery Status (Live Dispatch)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Triggers real-time SSE broadcast and records automated audit trail entry
            </p>
          </div>

          {updateSuccess && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{updateSuccess}</span>
            </div>
          )}

          <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed / Exception</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Current Checkpoint / Location</label>
              <input
                type="text"
                placeholder="e.g. Surat Highway Hub"
                value={updateLocation}
                onChange={(e) => setUpdateLocation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Status Update Notes</label>
              <input
                type="text"
                placeholder="e.g. Package inspected at gate"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={updating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{updating ? 'Broadcasting...' : 'Update Status'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Route & Consignment Specifications */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sender & Recipient Cards */}
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Sender */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pickup Origin</span>
                <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{shipment.senderName}</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{shipment.senderAddress}</p>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1">{shipment.senderCity}</p>
                {shipment.senderPhone && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{shipment.senderPhone}</span>
                  </p>
                )}
              </div>

              {/* Recipient */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivery Destination</span>
                <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{shipment.recipientName}</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{shipment.recipientAddress}</p>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1">
                  {shipment.recipientCity} {shipment.recipientPincode ? `- ${shipment.recipientPincode}` : ''}
                </p>
                {shipment.recipientPhone && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{shipment.recipientPhone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Consignment Specs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cargo Specifications</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Weight</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{shipment.weightKg} Kg</p>
                </div>
                <div>
                  <span className="text-slate-400">Package Type</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{shipment.packageType}</p>
                </div>
                <div>
                  <span className="text-slate-400">Origin Hub</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {shipment.originWarehouse ? shipment.originWarehouse.name : 'Direct Dispatch'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Destination Hub</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {shipment.destWarehouse ? shipment.destWarehouse.name : 'Direct Delivery'}
                  </p>
                </div>
              </div>
              {shipment.notes && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  <span className="font-semibold block mb-0.5">Special Handling Notes:</span>
                  {shipment.notes}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Driver & Vehicle Sidebar */}
          <div className="space-y-4">
            {/* Driver */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Driver</span>
              {shipment.driver ? (
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold">
                      {shipment.driver.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{shipment.driver.name}</p>
                      <p className="text-[10px] text-slate-400">Rating: ⭐ {shipment.driver.rating || '4.8'}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{shipment.driver.phone}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    License: <span className="font-mono">{shipment.driver.licenseNumber}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs italic text-slate-400">No driver assigned to this shipment yet.</p>
              )}
            </div>

            {/* Vehicle */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fleet Vehicle</span>
              {shipment.vehicle ? (
                <div className="mt-2 space-y-2 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                    {shipment.vehicle.plateNumber}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">{shipment.vehicle.model}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{shipment.vehicle.type}</span>
                    <span>Max: {shipment.vehicle.capacityKg} Kg</span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs italic text-slate-400">No vehicle assigned.</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Status History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Consignment Status Timeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited chronological log of status transitions and location updates
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              {shipment.statusHistory?.length || 0} Events Logged
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:left-2 before:top-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {shipment.statusHistory?.map((event, idx) => (
              <div key={event.id} className="relative">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-white dark:ring-slate-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={event.status} size="sm" />
                    <span className="text-[11px] text-slate-400">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {event.notes}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {event.location}
                      </span>
                    )}
                    {event.updatedBy && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {event.updatedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ShipmentDetailPage({ params }) {
  return (
    <React.Suspense
      fallback={
        <DashboardLayout>
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </DashboardLayout>
      }
    >
      <ShipmentDetailContent params={params} />
    </React.Suspense>
  );
}
