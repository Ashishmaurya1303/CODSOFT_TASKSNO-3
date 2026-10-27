import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    const where = {};
    if (availableOnly) {
      where.status = 'AVAILABLE';
    } else if (status && status !== 'ALL') {
      where.status = status;
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        shipments: {
          where: {
            status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
          },
          select: { id: true, trackingId: true, status: true, recipientCity: true },
        },
      },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json({ error: 'Failed to retrieve vehicles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { plateNumber, model, type = 'TRUCK', capacityKg, fuelType, status = 'AVAILABLE', currentLocation } = body;

    if (!plateNumber || !model || !capacityKg) {
      return NextResponse.json(
        { error: 'Plate number, vehicle model, and capacity (kg) are required' },
        { status: 400 }
      );
    }

    const existingPlate = await prisma.vehicle.findUnique({
      where: { plateNumber: plateNumber.trim().toUpperCase() },
    });

    if (existingPlate) {
      return NextResponse.json(
        { error: 'A vehicle with this license plate number is already registered' },
        { status: 409 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: plateNumber.trim().toUpperCase(),
        model: model.trim(),
        type,
        capacityKg: parseFloat(capacityKg),
        fuelType: fuelType?.trim() || 'Diesel',
        status,
        currentLocation: currentLocation?.trim() || 'Main Fleet Depot',
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Failed to register vehicle' }, { status: 500 });
  }
}
