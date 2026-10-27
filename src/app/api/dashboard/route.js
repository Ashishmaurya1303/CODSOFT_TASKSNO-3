import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    // Allow reading dashboard stats (if logged in, or fallback for guest demo)
    
    // 1. Shipment Statistics
    const [
      totalShipments,
      pendingShipments,
      inTransitShipments,
      outForDeliveryShipments,
      deliveredShipments,
      failedShipments,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: 'PENDING' } }),
      prisma.shipment.count({ where: { status: 'IN_TRANSIT' } }),
      prisma.shipment.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { status: 'FAILED' } }),
    ]);

    // Active in-transit total (in-transit + out for delivery + picked up + assigned)
    const activeTransit = inTransitShipments + outForDeliveryShipments;

    // 2. Driver Statistics
    const [totalDrivers, availableDrivers, onTripDrivers] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: 'AVAILABLE' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    ]);

    // 3. Vehicle Statistics
    const [totalVehicles, availableVehicles, assignedVehicles, maintenanceVehicles] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'ASSIGNED' } }),
      prisma.vehicle.count({ where: { status: 'MAINTENANCE' } }),
    ]);

    // 4. Warehouse Statistics
    const totalWarehouses = await prisma.warehouse.count();

    // 5. Recent Shipments
    const recentShipments = await prisma.shipment.findMany({
      take: 7,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
        vehicle: { select: { id: true, plateNumber: true, model: true } },
        originWarehouse: { select: { name: true, city: true } },
        destWarehouse: { select: { name: true, city: true } },
      },
    });

    // 6. Status distribution for Charts
    const statusDistribution = [
      { name: 'Pending', count: pendingShipments, color: '#f59e0b' },
      { name: 'In Transit', count: inTransitShipments, color: '#3b82f6' },
      { name: 'Out For Delivery', count: outForDeliveryShipments, color: '#8b5cf6' },
      { name: 'Delivered', count: deliveredShipments, color: '#10b981' },
      { name: 'Failed/Exception', count: failedShipments, color: '#ef4444' },
    ];

    // 7. Priority distribution
    const [urgentCount, highCount, mediumCount, lowCount] = await Promise.all([
      prisma.shipment.count({ where: { priority: 'URGENT' } }),
      prisma.shipment.count({ where: { priority: 'HIGH' } }),
      prisma.shipment.count({ where: { priority: 'MEDIUM' } }),
      prisma.shipment.count({ where: { priority: 'LOW' } }),
    ]);

    const priorityDistribution = [
      { name: 'Urgent', count: urgentCount, color: '#dc2626' },
      { name: 'High', count: highCount, color: '#f97316' },
      { name: 'Medium', count: mediumCount, color: '#0ea5e9' },
      { name: 'Low', count: lowCount, color: '#64748b' },
    ];

    // 8. Recent Timeline Updates
    const recentActivity = await prisma.shipmentStatusHistory.findMany({
      take: 6,
      orderBy: { timestamp: 'desc' },
      include: {
        shipment: { select: { trackingId: true, recipientCity: true } },
      },
    });

    return NextResponse.json({
      metrics: {
        totalShipments,
        pendingShipments,
        inTransitShipments: activeTransit,
        deliveredShipments,
        failedShipments,
        totalDrivers,
        availableDrivers,
        onTripDrivers,
        totalVehicles,
        availableVehicles,
        assignedVehicles,
        maintenanceVehicles,
        totalWarehouses,
        deliverySuccessRate: totalShipments > 0 
          ? Math.round((deliveredShipments / (deliveredShipments + failedShipments || 1)) * 100) 
          : 100,
      },
      recentShipments,
      statusDistribution,
      priorityDistribution,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard metrics' },
      { status: 500 }
    );
  }
}
