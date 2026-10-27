import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { broadcastUpdate } from '@/lib/realtime';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { status, location, notes } = await request.json();

    const allowedStatuses = [
      'PENDING',
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'FAILED',
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the shipment
    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [{ id }, { trackingId: id }],
      },
      include: { driver: true, vehicle: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Role check: If driver, verify they are assigned to this shipment
    if (auth.role === 'DRIVER') {
      if (!shipment.driverId || shipment.driverId !== auth.driverId) {
        return NextResponse.json(
          { error: 'Forbidden: Drivers can only update shipments assigned directly to them.' },
          { status: 403 }
        );
      }
    }

    // Determine updater display name
    const updaterName = auth.role === 'DRIVER' ? `Driver: ${auth.name}` : `Admin: ${auth.name}`;

    // Update shipment
    const updateData = {
      status,
      currentLocation: location || shipment.currentLocation,
    };

    if (status === 'DELIVERED') {
      updateData.actualDelivery = new Date();
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: updateData,
    });

    // Record Status History Timeline
    await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId: shipment.id,
        status,
        location: location || shipment.currentLocation || 'In Transit Checkpoint',
        notes: notes || `Status marked as ${status.replace('_', ' ')}`,
        updatedBy: updaterName,
      },
    });

    // Driver & Vehicle fleet status update
    if (status === 'DELIVERED' || status === 'FAILED') {
      if (shipment.driverId) {
        await prisma.driver.update({
          where: { id: shipment.driverId },
          data: { status: 'AVAILABLE' },
        }).catch(() => {});
      }
      if (shipment.vehicleId) {
        await prisma.vehicle.update({
          where: { id: shipment.vehicleId },
          data: { status: 'AVAILABLE' },
        }).catch(() => {});
      }
    } else if (status === 'PICKED_UP' || status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY') {
      if (shipment.driverId) {
        await prisma.driver.update({
          where: { id: shipment.driverId },
          data: { status: 'ON_TRIP' },
        }).catch(() => {});
      }
      if (shipment.vehicleId) {
        await prisma.vehicle.update({
          where: { id: shipment.vehicleId },
          data: { status: 'ASSIGNED' },
        }).catch(() => {});
      }
    }

    // Generate in-app notification for important transitions
    if (['DELIVERED', 'FAILED', 'OUT_FOR_DELIVERY'].includes(status)) {
      const typeMap = {
        DELIVERED: 'SUCCESS',
        FAILED: 'ALERT',
        OUT_FOR_DELIVERY: 'WARNING',
      };

      await prisma.notification.create({
        data: {
          title: `Shipment ${shipment.trackingId} is ${status.replace(/_/g, ' ')}`,
          message: `${shipment.trackingId} for ${shipment.recipientName} (${shipment.recipientCity}) was updated by ${updaterName}.`,
          type: typeMap[status] || 'INFO',
          link: `/shipments/${shipment.id}`,
        },
      }).catch(() => {});
    }

    // Broadcast live update to real-time subscribers
    broadcastUpdate('status_change', {
      shipmentId: shipment.id,
      trackingId: shipment.trackingId,
      status,
      location,
      notes,
      updatedBy: updaterName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Status updated successfully',
      shipment: updatedShipment,
    });
  } catch (error) {
    console.error('Update shipment status error:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment status' },
      { status: 500 }
    );
  }
}
