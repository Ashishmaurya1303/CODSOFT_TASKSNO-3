import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            originShipments: true,
            destinationShipments: true,
          },
        },
      },
    });

    return NextResponse.json({ warehouses });
  } catch (error) {
    console.error('Fetch warehouses error:', error);
    return NextResponse.json({ error: 'Failed to retrieve warehouses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, address, city, state, pincode, capacityKg, managerName, contactPhone, latitude, longitude } = body;

    if (!name || !code || !city || !address) {
      return NextResponse.json(
        { error: 'Name, hub code, city, and address are required' },
        { status: 400 }
      );
    }

    const existingCode = await prisma.warehouse.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'A warehouse with this code already exists' },
        { status: 409 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        state: state?.trim() || '',
        pincode: pincode?.trim() || '',
        capacityKg: capacityKg ? parseFloat(capacityKg) : 100000,
        managerName: managerName?.trim() || 'Warehouse Manager',
        contactPhone: contactPhone?.trim() || '',
        latitude: latitude ? parseFloat(latitude) : 20.5937,
        longitude: longitude ? parseFloat(longitude) : 78.9629,
      },
    });

    return NextResponse.json({ warehouse }, { status: 201 });
  } catch (error) {
    console.error('Create warehouse error:', error);
    return NextResponse.json({ error: 'Failed to create warehouse record' }, { status: 500 });
  }
}
