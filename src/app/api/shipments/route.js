import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { broadcastUpdate } from '@/lib/realtime';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const driverId = searchParams.get('driverId');

    const auth = await getAuthUser(request);

    const where = {};

    // If logged in as driver, filter strictly to this driver's shipments
    if (auth && auth.role === 'DRIVER' && auth.driverId) {
      where.driverId = auth.driverId;
    } else if (driverId) {
      where.driverId = driverId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { trackingId: { contains: search } },
        { recipientName: { contains: search } },
        { recipientCity: { contains: search } },
        { senderName: { contains: search } },
        { senderCity: { contains: search } },
      ];
    }

    const shipments = await prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
        vehicle: { select: { id: true, plateNumber: true, model: true } },
        originWarehouse: { select: { id: true, name: true, city: true } },
        destWarehouse: { select: { id: true, name: true, city: true } },
        statusHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ shipments, count: shipments.length });
  } catch (error) {
    console.error('Fetch shipments error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required to create shipments' },
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
      priority = 'MEDIUM',
      weightKg,
      packageType = 'Standard Box',
      estimatedDelivery,
      notes,
    } = body;

    // Validate required fields
    if (!senderName || !senderAddress || !recipientName || !recipientAddress || !recipientCity) {
      return NextResponse.json(
        { error: 'Missing required sender or recipient details' },
        { status: 400 }
      );
    }

    // Auto-generate Unique Tracking ID (e.g. FF-83921-IN)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `FF-${randomNum}-IN`;

    // Validate driver availability if assigned
    if (driverId) {
      const driver = await prisma.driver.findUnique({ where: { id: driverId } });
      if (!driver || driver.status === 'INACTIVE') {
        return NextResponse.json(
          { error: 'Selected driver is inactive or not found' },
          { status: 400 }
        );
      }
    }

    // Validate vehicle availability if assigned
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle || vehicle.status === 'MAINTENANCE') {
        return NextResponse.json(
          { error: 'Selected vehicle is under maintenance or not available' },
          { status: 400 }
        );
      }
    }

    const initialStatus = driverId ? 'ASSIGNED' : 'PENDING';

    const shipment = await prisma.shipment.create({
      data: {
        trackingId,
        senderName: senderName.trim(),
        senderPhone: senderPhone?.trim() || '',
        senderAddress: senderAddress.trim(),
        senderCity: senderCity?.trim() || 'Origin Hub',
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone?.trim() || '',
        recipientAddress: recipientAddress.trim(),
        recipientCity: recipientCity.trim(),
        recipientPincode: recipientPincode?.trim() || '',
        originWarehouseId: originWarehouseId || null,
        destWarehouseId: destWarehouseId || null,
        driverId: driverId || null,
        vehicleId: vehicleId || null,
        status: initialStatus,
        priority,
        weightKg: parseFloat(weightKg) || 1.0,
        packageType,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 48 * 3600 * 1000),
        notes: notes ? notes.trim() : null,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    // Create initial timeline entry
    await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId: shipment.id,
        status: initialStatus,
        location: senderCity || 'Origin Sorting Hub',
        notes: driverId ? 'Shipment created and driver assigned.' : 'Shipment manifest registered. Pending assignment.',
        updatedBy: `Admin: ${auth.name}`,
      },
    });

    // Update Driver & Vehicle status if assigned
    if (driverId) {
      await prisma.driver.update({
        where: { id: driverId },
        data: { status: 'ON_TRIP' },
      });
    }
    if (vehicleId) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'ASSIGNED' },
      });
    }

    // Broadcast real-time update
    broadcastUpdate('shipment_created', {
      trackingId: shipment.trackingId,
      status: shipment.status,
    });

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment. Duplicate tracking or database error.' },
      { status: 500 }
    );
  }
}
