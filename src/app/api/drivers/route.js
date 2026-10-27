import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword } from '@/lib/auth';

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

    const drivers = await prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, role: true } },
        shipments: {
          where: {
            status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
          },
          select: { id: true, trackingId: true, status: true, recipientCity: true },
        },
      },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Fetch drivers error:', error);
    return NextResponse.json({ error: 'Failed to retrieve drivers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, licenseNumber, vehicleType, emergencyContact, createLoginAccount, password } = body;

    if (!name || !phone || !licenseNumber) {
      return NextResponse.json(
        { error: 'Name, phone number, and license number are required' },
        { status: 400 }
      );
    }

    const existingLicense = await prisma.driver.findUnique({
      where: { licenseNumber: licenseNumber.trim() },
    });

    if (existingLicense) {
      return NextResponse.json(
        { error: 'A driver with this license number already exists' },
        { status: 409 }
      );
    }

    let linkedUserId = null;

    // Optionally create a user login for this driver
    if (createLoginAccount && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!existingUser) {
        const hashedPassword = await hashPassword(password || 'Driver@123');
        const user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'DRIVER',
            phone: phone.trim(),
          },
        });
        linkedUserId = user.id;
      } else {
        linkedUserId = existingUser.id;
      }
    }

    const driver = await prisma.driver.create({
      data: {
        userId: linkedUserId,
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : null,
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        vehicleType: vehicleType ? vehicleType.trim() : 'Standard Fleet Van',
        emergencyContact: emergencyContact ? emergencyContact.trim() : null,
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    console.error('Create driver error:', error);
    return NextResponse.json({ error: 'Failed to create driver record' }, { status: 500 });
  }
}
