import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { trackingId } = await params;

    const cleanId = decodeURIComponent(trackingId).trim();

    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { trackingId: cleanId },
          { trackingId: cleanId.toUpperCase() },
          { id: cleanId },
        ],
      },
      include: {
        originWarehouse: { select: { name: true, city: true, code: true } },
        destWarehouse: { select: { name: true, city: true, code: true } },
        driver: { select: { name: true, vehicleType: true, rating: true } },
        vehicle: { select: { model: true, type: true } },
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: `No shipment found with tracking ID "${cleanId}". Please check the ID and try again.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while tracking the shipment' },
      { status: 500 }
    );
  }
}
