'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Package,
  ShieldCheck,
  Radio,
  Search,
} from 'lucide-react';

function PublicTrackingResultContent({ params }) {
  const unwrappedParams = use(params);
  const trackingId = unwrappedParams.id;

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [livePulse, setLivePulse] = useState(false);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trackingId)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Shipment not found');
      }
      setShipment(data.shipment);
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [trackingId]);

  useEffect(() => {
    fetchTracking();

    // Listen for live status change broadcasts
    let eventSource;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.addEventListener('status_change', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.trackingId === trackingId.toUpperCase()) {
          fetchTracking();
        }
      });
    } catch {
      //
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchTracking, trackingId]);

  // Delivery Stages Progression Array
  const stages = [
    { key: 'PENDING', label: 'Booking Registered' },
    { key: 'ASSIGNED', label: 'Driver Assigned' },
    { key: 'PICKED_UP', label: 'Picked Up & Sorted' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ASSIGNED': return 1;
      case 'PICKED_UP': return 2;
      case 'IN_TRANSIT': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      case 'FAILED': return 4; // Exception at final leg
      default: return 0;
    }
  };

  const currentStageIndex = shipment ? getStageIndex(shipment.status) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/track" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Track Another Consignment</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-400">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Live Checkpoint Sync</span>
            </span>
            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs text-slate-400">Locating tracking manifest across nationwide hubs...</p>
          </div>
        ) : error || !shipment ? (
          <div className="rounded-2xl border border-rose-900 bg-rose-950/20 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
            <h2 className="text-lg font-bold text-white">Tracking Not Found</h2>
            <p className="mt-1 text-xs text-slate-400">{error || 'No consignment matches this tracking number.'}</p>
            <div className="mt-6">
              <Link
                href="/track"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Search className="h-4 w-4" /> Try Different ID
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tracking Banner Card */}
            <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl transition-all ${
              livePulse ? 'ring-2 ring-emerald-500/50' : ''
            }`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracking ID</span>
                    <PriorityBadge priority={shipment.priority} />
                  </div>
                  <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl font-mono">
                    {shipment.trackingId}
                  </h1>
                  <p className="mt-1 text-xs text-slate-400">
                    Estimated Delivery:{' '}
                    <span className="font-semibold text-slate-200">
                      {new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <StatusBadge status={shipment.status} size="lg" />
                  {shipment.actualDelivery && (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Delivered on {new Date(shipment.actualDelivery).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div className="mt-8 border-t border-slate-800 pt-6">
                <div className="hidden sm:grid grid-cols-6 gap-2 text-center">
                  {stages.map((stage, idx) => {
                    const isPassed = idx <= currentStageIndex && shipment.status !== 'FAILED';
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-2 text-[10px] font-semibold ${
                            isCurrent
                              ? 'text-blue-400'
                              : isPassed
                              ? 'text-slate-200'
                              : 'text-slate-500'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Route Summary (Origin -> Destination) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>Origin (Pickup City)</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-white">{shipment.senderCity}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{shipment.senderName}</p>
                <p className="text-[11px] text-slate-500 mt-1">{shipment.senderAddress}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Destination (Delivery City)</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-white">{shipment.recipientCity}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{shipment.recipientName}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {shipment.recipientAddress} {shipment.recipientPincode ? `(${shipment.recipientPincode})` : ''}
                </p>
              </div>
            </div>

            {/* Consignment Specs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Package Specifications</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Weight</span>
                  <p className="font-semibold text-white mt-0.5">{shipment.weightKg} Kg</p>
                </div>
                <div>
                  <span className="text-slate-500">Packaging</span>
                  <p className="font-semibold text-white mt-0.5">{shipment.packageType}</p>
                </div>
                <div>
                  <span className="text-slate-500">Current Checkpoint</span>
                  <p className="font-semibold text-white mt-0.5">{shipment.currentLocation || shipment.recipientCity}</p>
                </div>
                <div>
                  <span className="text-slate-500">Assigned Driver</span>
                  <p className="font-semibold text-white mt-0.5">
                    {shipment.driver ? shipment.driver.name : 'Regional Dispatch'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Milestones Feed */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-6">Detailed Checkpoint History</h3>

              <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:left-2 before:top-2 before:w-0.5 before:bg-slate-800">
                {shipment.statusHistory?.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ring-4 ring-slate-950">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
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
                      <p className="mt-2 text-xs font-semibold text-white">{event.notes}</p>
                      {event.location && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        FleetFlow &bull; Checkpoint Verified Tracking System &bull; CodSoft Task 5
      </footer>
    </div>
  );
}

export default function PublicTrackingResultPage({ params }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <PublicTrackingResultContent params={params} />
    </React.Suspense>
  );
}
