import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ driver });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve driver' }, { status: 500 });
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
    const { name, email, phone, licenseNumber, vehicleType, status, emergencyContact } = body;

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        name: name?.trim(),
        email: email ? email.toLowerCase().trim() : undefined,
        phone: phone?.trim(),
        licenseNumber: licenseNumber?.trim(),
        vehicleType: vehicleType?.trim(),
        status,
        emergencyContact: emergencyContact?.trim(),
      },
    });

    return NextResponse.json({ driver: updated });
  } catch (error) {
    console.error('Update driver error:', error);
    return NextResponse.json({ error: 'Failed to update driver record' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // Check if driver has active trips
    const activeShipment = await prisma.shipment.findFirst({
      where: {
        driverId: id,
        status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
      },
    });

    if (activeShipment) {
      return NextResponse.json(
        { error: `Cannot delete driver. Driver is currently assigned to active shipment ${activeShipment.trackingId}. Reassign or complete the shipment first, or mark driver as INACTIVE.` },
        { status: 400 }
      );
    }

    await prisma.driver.delete({ where: { id } });
    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 });
  }
}
