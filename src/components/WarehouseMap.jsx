'use client';

import React, { useState } from 'react';
import { Building2, Navigation, Phone, User, Package, MapPin } from 'lucide-react';

export default function WarehouseMap({ warehouses = [], selectedWarehouse, onSelectWarehouse }) {
  const [activePin, setActivePin] = useState(null);

  // SVG Coordinate mapping for major Indian hub coordinates
  // Lat bounds ~ 8 to 32, Lng bounds ~ 68 to 88
  const toSVG = (lat, lng) => {
    // Map bounding box: lat [10, 30], lng [70, 85] to SVG 500x500
    const x = ((lng - 70) / (85 - 70)) * 440 + 30;
    const y = ((32 - lat) / (32 - 10)) * 440 + 30;
    return {
      x: Math.max(30, Math.min(470, x)),
      y: Math.max(30, Math.min(470, y)),
    };
  };

  const highlighted = activePin || selectedWarehouse;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-lg dark:border-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">National Freight & Hub Network</h3>
            <p className="text-[11px] text-slate-400">Interactive Regional Warehouses & Transit Corridors</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          {warehouses.length} Active Hubs
        </span>
      </div>

      <div className="relative h-96 w-full rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2">
        {/* SVG Network Grid */}
        <svg viewBox="0 0 500 500" className="h-full w-full">
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <rect width="500" height="500" fill="url(#grid)" />

          {/* Route Connecting Lines */}
          {warehouses.length > 1 &&
            warehouses.map((w1, i) =>
              warehouses.slice(i + 1).map((w2, j) => {
                const p1 = toSVG(w1.latitude, w1.longitude);
                const p2 = toSVG(w2.latitude, w2.longitude);
                return (
                  <g key={`${w1.id}-${w2.id}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="url(#routeGradient)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="opacity-40 animate-pulse"
                    />
                  </g>
                );
              })
            )}

          {/* Warehouse Nodes */}
          {warehouses.map((w) => {
            const pos = toSVG(w.latitude, w.longitude);
            const isSelected = highlighted?.id === w.id;

            return (
              <g
                key={w.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  setActivePin(w);
                  if (onSelectWarehouse) onSelectWarehouse(w);
                }}
              >
                {/* Glow ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 16 : 10}
                  className={isSelected ? 'fill-blue-500/30 animate-ping' : 'fill-blue-500/20'}
                />
                {/* Core node */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 7 : 5}
                  className={isSelected ? 'fill-amber-400 stroke-2 stroke-white' : 'fill-blue-400 stroke-1 stroke-slate-900'}
                />
                {/* City Label */}
                <text
                  x={pos.x}
                  y={pos.y - 12}
                  textAnchor="middle"
                  className="fill-slate-200 text-[10px] font-semibold"
                >
                  {w.city}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Hub Details Card Overlay */}
        {highlighted && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
                  {highlighted.code}
                </span>
                <h4 className="mt-1 text-xs font-bold text-white">{highlighted.name}</h4>
                <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <MapPin className="h-3 w-3 text-rose-400" />
                  {highlighted.address}, {highlighted.city}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 text-[11px]">
              <div>
                <span className="text-slate-400">Capacity:</span>
                <p className="font-semibold text-slate-200">{(highlighted.capacityKg / 1000).toLocaleString()} Tonnes</p>
              </div>
              <div>
                <span className="text-slate-400">Current Load:</span>
                <p className="font-semibold text-amber-400">{(highlighted.currentLoadKg / 1000).toLocaleString()} Tonnes</p>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-slate-300">
                <User className="h-3 w-3 text-slate-400" />
                <span>{highlighted.managerName}</span>
                <span className="text-slate-500">|</span>
                <Phone className="h-3 w-3 text-slate-400" />
                <span>{highlighted.contactPhone}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
