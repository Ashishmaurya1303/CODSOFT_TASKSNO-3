'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Truck,
  Plus,
  Fuel,
  Weight,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  AlertCircle,
  MapPin,
} from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    plateNumber: '',
    model: '',
    type: 'TRUCK',
    capacityKg: '15000',
    fuelType: 'Diesel',
    status: 'AVAILABLE',
    currentLocation: 'Main Depot Yard',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register vehicle');

      setIsAddOpen(false);
      setFormData(initialForm);
      fetchVehicles();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update vehicle');

      setIsEditOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, plate) => {
    if (!confirm(`Are you sure you want to remove vehicle ${plate}?`)) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Delete failed');
      } else {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      }
    } catch {
      alert('Failed to delete vehicle');
    }
  };

  const statusBadges = {
    AVAILABLE: {
      label: 'Available',
      classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: CheckCircle2,
    },
    ASSIGNED: {
      label: 'Assigned / On Route',
      classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: Truck,
    },
    MAINTENANCE: {
      label: 'Under Maintenance',
      classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      icon: Wrench,
    },
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Fleet & Vehicle Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage trucks, vans, trailers, payload capacities, and maintenance status
            </p>
          </div>

          <button
            onClick={() => {
              setFormData(initialForm);
              setFormError('');
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Register Vehicle</span>
          </button>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="col-span-full py-12 text-center text-xs text-slate-400">Loading fleet records...</p>
          ) : vehicles.length === 0 ? (
            <p className="col-span-full py-12 text-center text-xs text-slate-400">No fleet vehicles registered.</p>
          ) : (
            vehicles.map((v) => {
              const badge = statusBadges[v.status] || statusBadges.AVAILABLE;
              const StatusIcon = badge.icon;

              return (
                <div
                  key={v.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                        {v.plateNumber}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{v.model}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingVehicle(v);
                          setFormData({
                            plateNumber: v.plateNumber,
                            model: v.model,
                            type: v.type,
                            capacityKg: v.capacityKg.toString(),
                            fuelType: v.fuelType || 'Diesel',
                            status: v.status,
                            currentLocation: v.currentLocation || '',
                          });
                          setFormError('');
                          setIsEditOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.plateNumber)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${badge.classes}`}>
                      <StatusIcon className="h-3 w-3" />
                      {badge.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400">Type</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{v.type}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Max Capacity</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {(v.capacityKg / 1000).toFixed(1)} Tonnes ({v.capacityKg} kg)
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Fuel Type</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{v.fuelType || 'Diesel'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Active Cargoes</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {v.shipments?.length || 0} Trips
                      </p>
                    </div>
                  </div>

                  {v.currentLocation && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{v.currentLocation}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Add Vehicle */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Fleet Vehicle</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Registration Plate Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="MH-04-AZ-4512"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Vehicle Model & Make *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Tata Signa 4825 Heavy Freight"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Vehicle Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="TRUCK">Truck</option>
                      <option value="VAN">Express Van</option>
                      <option value="TRAILER">Multi-Axle Trailer</option>
                      <option value="EV_VAN">Electric EV Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Payload Capacity (Kg) *</label>
                    <input
                      type="number"
                      required
                      value={formData.capacityKg}
                      onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
                      placeholder="12000"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Fuel Type</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                      <option value="Petrol">Petrol</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Operational Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Registering...' : 'Register Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Vehicle */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Vehicle</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleEdit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Model</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Capacity (Kg)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
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
