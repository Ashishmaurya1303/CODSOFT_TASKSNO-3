import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        originShipments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ warehouse });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve warehouse' }, { status: 500 });
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
    const { name, code, address, city, state, pincode, capacityKg, managerName, contactPhone, latitude, longitude } = body;

    const updated = await prisma.warehouse.update({
      where: { id },
      data: {
        name: name?.trim(),
        code: code?.trim().toUpperCase(),
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        pincode: pincode?.trim(),
        capacityKg: capacityKg ? parseFloat(capacityKg) : undefined,
        managerName: managerName?.trim(),
        contactPhone: contactPhone?.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      },
    });

    return NextResponse.json({ warehouse: updated });
  } catch (error) {
    console.error('Update warehouse error:', error);
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // Check if warehouse has active shipments
    const activeShipment = await prisma.shipment.findFirst({
      where: {
        OR: [{ originWarehouseId: id }, { destWarehouseId: id }],
        status: { in: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
      },
    });

    if (activeShipment) {
      return NextResponse.json(
        { error: `Cannot delete warehouse. It is associated with active shipment ${activeShipment.trackingId}.` },
        { status: 400 }
      );
    }

    await prisma.warehouse.delete({ where: { id } });
    return NextResponse.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 });
  }
}
