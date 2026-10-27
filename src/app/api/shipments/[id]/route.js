import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { broadcastUpdate } from '@/lib/realtime';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [{ id }, { trackingId: id }],
      },
      include: {
        driver: true,
        vehicle: true,
        originWarehouse: true,
        destWarehouse: true,
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error('Fetch single shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shipment details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators can modify shipment info' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      senderName,
      senderPhone,
      senderAddress,
      senderCity,
      recipientName,
      recipientPhone,
      recipientAddress,
      recipientCity,
      recipientPincode,
      originWarehouseId,
      destWarehouseId,
      driverId,
      vehicleId,
      priority,
      weightKg,
      packageType,
      estimatedDelivery,
      notes,
    } = body;

    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        senderName,
        senderPhone,
        senderAddress,
        senderCity,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientCity,
        recipientPincode,
        originWarehouseId: originWarehouseId || null,
        destWarehouseId: destWarehouseId || null,
        driverId: driverId || null,
        vehicleId: vehicleId || null,
        priority,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        packageType,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        notes,
      },
      include: {
        driver: true,
        vehicle: true,
        originWarehouse: true,
        destWarehouse: true,
      },
    });

    broadcastUpdate('shipment_updated', {
      trackingId: updatedShipment.trackingId,
      status: updatedShipment.status,
    });

    return NextResponse.json({ shipment: updatedShipment });
  } catch (error) {
    console.error('Update shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators can delete shipments' },
        { status: 403 }
      );
    }

    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Free up driver and vehicle if this shipment was assigned/active
    if (shipment.driverId && shipment.status !== 'DELIVERED') {
      await prisma.driver.update({
        where: { id: shipment.driverId },
        data: { status: 'AVAILABLE' },
      }).catch(() => {});
    }
    if (shipment.vehicleId && shipment.status !== 'DELIVERED') {
      await prisma.vehicle.update({
        where: { id: shipment.vehicleId },
        data: { status: 'AVAILABLE' },
      }).catch(() => {});
    }

    await prisma.shipment.delete({ where: { id } });

    broadcastUpdate('shipment_deleted', { id, trackingId: shipment.trackingId });

    return NextResponse.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Delete shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}
