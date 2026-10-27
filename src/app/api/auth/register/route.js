import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, TOKEN_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password, role = 'ADMIN', phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email address already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = role === 'DRIVER' ? 'DRIVER' : 'ADMIN';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: phone ? phone.trim() : null,
      },
    });

    // If registering as a driver, automatically create a linked driver profile
    let driverProfile = null;
    if (assignedRole === 'DRIVER') {
      driverProfile = await prisma.driver.create({
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '+91 90000 00000',
          licenseNumber: `DL-${Date.now().toString().slice(-8)}`,
          status: 'AVAILABLE',
        },
      });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      driverId: driverProfile ? driverProfile.id : null,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      message: 'Account registered successfully',
      user: tokenPayload,
      token,
    }, { status: 201 });

    response.cookies.set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    );
  }
}
