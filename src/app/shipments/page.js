'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import {
  PackagePlus,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  X,
  AlertCircle,
  Truck,
  User,
  Calendar,
  RefreshCw,
} from 'lucide-react';

function ShipmentsContent() {
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderCity: 'Mumbai',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientCity: 'New Delhi',
    recipientPincode: '',
    originWarehouseId: '',
    destWarehouseId: '',
    driverId: '',
    vehicleId: '',
    priority: 'MEDIUM',
    weightKg: '50',
    packageType: 'Standard Box',
    estimatedDelivery: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 10),
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  // Auto-open modal if ?new=true query param
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Fetch Shipments
  const fetchShipments = useCallback(async () => {
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const data = await res.json();
        setShipments(data.shipments || []);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Metadata (Drivers, Vehicles, Warehouses) for Dropdowns
  const fetchMetadata = async () => {
    try {
      const [dRes, vRes, wRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
        fetch('/api/warehouses'),
      ]);
      if (dRes.ok) {
        const d = await dRes.json();
        setDrivers(d.drivers || []);
      }
      if (vRes.ok) {
        const v = await vRes.json();
        setVehicles(v.vehicles || []);
      }
      if (wRes.ok) {
        const w = await wRes.json();
        setWarehouses(w.warehouses || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown metadata:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchMetadata();
  }, [fetchShipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      const matchSearch =
        !search ||
        item.trackingId.toLowerCase().includes(search.toLowerCase()) ||
        item.recipientName.toLowerCase().includes(search.toLowerCase()) ||
        item.recipientCity.toLowerCase().includes(search.toLowerCase()) ||
        item.senderName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [shipments, search, statusFilter, priorityFilter]);

  // Handle Create Shipment
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create shipment');
      }

      setIsCreateOpen(false);
      setFormData(initialForm);
      fetchShipments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({
      senderName: shipment.senderName,
      senderPhone: shipment.senderPhone,
      senderAddress: shipment.senderAddress,
      senderCity: shipment.senderCity,
      recipientName: shipment.recipientName,
      recipientPhone: shipment.recipientPhone,
      recipientAddress: shipment.recipientAddress,
      recipientCity: shipment.recipientCity,
      recipientPincode: shipment.recipientPincode,
      originWarehouseId: shipment.originWarehouseId || '',
      destWarehouseId: shipment.destWarehouseId || '',
      driverId: shipment.driverId || '',
      vehicleId: shipment.vehicleId || '',
      priority: shipment.priority,
      weightKg: shipment.weightKg.toString(),
      packageType: shipment.packageType,
      estimatedDelivery: new Date(shipment.estimatedDelivery).toISOString().slice(0, 10),
      notes: shipment.notes || '',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/shipments/${editingShipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update shipment');
      }

      setIsEditOpen(false);
      setEditingShipment(null);
      fetchShipments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Shipment
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShipments((prev) => prev.filter((s) => s.id !== id));
        setDeletingId(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Shipment Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create, track, assign drivers, and manage all consignments
            </p>
          </div>

          <button
            onClick={() => {
              setFormData(initialForm);
              setFormError('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Shipment</span>
          </button>
        </div>

        {/* Search & Filters Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Tracking ID, recipient, city, sender..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed / Exception</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <button
                onClick={fetchShipments}
                title="Refresh shipments"
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tracking ID</th>
                  <th className="py-3 px-4 font-semibold">Origin & Destination</th>
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">Assigned Driver</th>
                  <th className="py-3 px-4 font-semibold">Vehicle</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading shipments...
                    </td>
                  </tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No shipments found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        <Link href={`/shipments/${s.id}`} className="hover:underline flex items-center gap-1.5">
                          <span>{s.trackingId}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{s.senderCity}</span>
                        <span className="mx-1 text-slate-400">&rarr;</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{s.recipientCity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{s.recipientName}</p>
                        <p className="text-[11px] text-slate-400">{s.recipientPhone}</p>
                      </td>
                      <td className="py-3 px-4">
                        {s.driver ? (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <User className="h-3 w-3 text-slate-400" />
                            {s.driver.name}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {s.vehicle ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Truck className="h-3 w-3 text-slate-400" />
                            {s.vehicle.plateNumber}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={s.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(s)}
                            title="Edit Shipment"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(s.id)}
                            title="Delete Shipment"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Shipment */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <PackagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Shipment</h3>
                    <p className="text-xs text-slate-500">Auto-assigns unique Tracking ID and records manifest</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
                {/* Sender Details */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                  <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider block mb-2">
                    Sender Information (Pickup)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Sender / Company Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        placeholder="Apex Logistics Ltd"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Sender Phone</label>
                      <input
                        type="text"
                        value={formData.senderPhone}
                        onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                        placeholder="+91 22 4567 8900"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Pickup Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.senderAddress}
                        onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                        placeholder="Plot 14, MIDC Industrial Area, Andheri"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Sender City *</label>
                      <input
                        type="text"
                        required
                        value={formData.senderCity}
                        onChange={(e) => setFormData({ ...formData, senderCity: e.target.value })}
                        placeholder="Mumbai"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Origin Warehouse Hub</label>
                      <select
                        value={formData.originWarehouseId}
                        onChange={(e) => setFormData({ ...formData, originWarehouseId: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="">Select Warehouse Hub (Optional)</option>
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.name} ({w.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                  <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider block mb-2">
                    Recipient Information (Delivery Destination)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        placeholder="Vijay Traders"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Recipient Phone</label>
                      <input
                        type="text"
                        value={formData.recipientPhone}
                        onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                        placeholder="+91 98123 45678"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Delivery Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.recipientAddress}
                        onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                        placeholder="Sector 18, Commercial Market Building 4"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Destination City *</label>
                      <input
                        type="text"
                        required
                        value={formData.recipientCity}
                        onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value })}
                        placeholder="Gurugram"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-300">Postal Pincode</label>
                      <input
                        type="text"
                        value={formData.recipientPincode}
                        onChange={(e) => setFormData({ ...formData, recipientPincode: e.target.value })}
                        placeholder="122001"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment & Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Assign Driver</label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Unassigned (Assign Later)</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.status}) - {d.vehicleType || 'Driver'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Assign Vehicle</label>
                    <select
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">No Vehicle Assigned</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plateNumber} ({v.model} - {v.capacityKg}kg - {v.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Priority Level</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Weight (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Package Type</label>
                    <input
                      type="text"
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                      placeholder="e.g. Pallet, Fragile, Electronics"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Creating Manifest...' : 'Create Shipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Shipment */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Shipment: {editingShipment?.trackingId}
                  </h3>
                  <p className="text-xs text-slate-500">Update destination, driver, or consignment specs</p>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Recipient City</label>
                    <input
                      type="text"
                      required
                      value={formData.recipientCity}
                      onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Assigned Driver</label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Unassigned</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-rose-600">
                <Trash2 className="h-6 w-6" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Shipment?</h3>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete this shipment and its status timeline records? This action cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  onClick={() => setDeletingId(null)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                >
                  Delete Shipment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ShipmentsPage() {
  return (
    <React.Suspense
      fallback={
        <DashboardLayout requiredRole="ADMIN">
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </DashboardLayout>
      }
    >
      <ShipmentsContent />
    </React.Suspense>
  );
}
