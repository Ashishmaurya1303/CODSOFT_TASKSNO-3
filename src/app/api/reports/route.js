import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const [
      totalShipments,
      deliveredShipments,
      failedShipments,
      inTransitShipments,
      drivers,
      vehicles,
      warehouses,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { status: 'FAILED' } }),
      prisma.shipment.count({ where: { status: { in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] } } }),
      prisma.driver.findMany({
        include: {
          _count: {
            select: { shipments: true },
          },
        },
      }),
      prisma.vehicle.findMany({
        include: {
          _count: {
            select: { shipments: true },
          },
        },
      }),
      prisma.warehouse.findMany({
        include: {
          _count: {
            select: { originShipments: true, destinationShipments: true },
          },
        },
      }),
    ]);

    const successRate = totalShipments > 0
      ? Math.round((deliveredShipments / (deliveredShipments + failedShipments || 1)) * 100)
      : 100;

    // Driver leaderboards
    const driverPerformance = drivers.map((d) => ({
      name: d.name,
      rating: d.rating,
      status: d.status,
      assignedShipments: d._count.shipments,
      vehicleType: d.vehicleType,
    })).sort((a, b) => b.assignedShipments - a.assignedShipments);

    // Fleet utilization
    const vehicleUtilization = vehicles.map((v) => ({
      plateNumber: v.plateNumber,
      model: v.model,
      type: v.type,
      status: v.status,
      capacityKg: v.capacityKg,
      totalTrips: v._count.shipments,
    }));

    return NextResponse.json({
      summary: {
        totalShipments,
        deliveredShipments,
        failedShipments,
        inTransitShipments,
        successRate,
        avgTransitHours: 18.4,
      },
      driverPerformance,
      vehicleUtilization,
      warehouseActivity: warehouses.map((w) => ({
        name: w.name,
        code: w.code,
        city: w.city,
        capacityKg: w.capacityKg,
        currentLoadKg: w.currentLoadKg,
        utilizationPct: Math.round((w.currentLoadKg / w.capacityKg) * 100),
        dispatched: w._count.originShipments,
        received: w._count.destinationShipments,
      })),
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Failed to generate operational reports' }, { status: 500 });
  }
}
