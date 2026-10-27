import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve vehicle' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { plateNumber, model, type, capacityKg, fuelType, status, currentLocation } = body;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber: plateNumber?.trim().toUpperCase(),
        model: model?.trim(),
        type,
        capacityKg: capacityKg ? parseFloat(capacityKg) : undefined,
        fuelType: fuelType?.trim(),
        status,
        currentLocation: currentLocation?.trim(),
      },
    });

    return NextResponse.json({ vehicle: updated });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // Check if vehicle is currently on an active shipment
    const activeShipment = await prisma.shipment.findFirst({
      where: {
        vehicleId: id,
        status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
      },
    });

    if (activeShipment) {
      return NextResponse.json(
        { error: `Cannot delete vehicle. Assigned to active shipment ${activeShipment.trackingId}. Reassign shipment first or change vehicle status to MAINTENANCE.` },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
