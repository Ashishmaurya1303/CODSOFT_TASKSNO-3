// FleetFlow — Database Seeding Script
// Seeds realistic, fictional logistics sample data
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚛 Seeding FleetFlow database...');

  // Clean existing records in correct relation order
  await prisma.notification.deleteMany();
  await prisma.shipmentStatusHistory.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 1. Create Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const driverPassword = await bcrypt.hash('Driver@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Vikram Malhotra (Operations Lead)',
      email: 'admin@fleetflow.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+91 98201 11223',
    },
  });

  const driverUser1 = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma',
      email: 'rajesh.driver@fleetflow.com',
      password: driverPassword,
      role: 'DRIVER',
      phone: '+91 98765 43210',
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      name: 'Amit Verma',
      email: 'amit.driver@fleetflow.com',
      password: driverPassword,
      role: 'DRIVER',
      phone: '+91 98123 45678',
    },
  });

  console.log('✅ Users created: admin@fleetflow.com (Admin@123), rajesh.driver@fleetflow.com (Driver@123)');

  // 2. Create Warehouses
  const whMumbai = await prisma.warehouse.create({
    data: {
      name: 'Mumbai Central Logistics Hub',
      code: 'WH-BOM-01',
      address: 'Plot 42, MIDC Industrial Area, Turbhe',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400705',
      capacityKg: 150000,
      currentLoadKg: 42500,
      managerName: 'Sanjay Deshmukh',
      contactPhone: '+91 22 2789 4400',
      latitude: 19.0760,
      longitude: 72.8777,
    },
  });

  const whDelhi = await prisma.warehouse.create({
    data: {
      name: 'Delhi NCR Fulfillment Center',
      code: 'WH-DEL-02',
      address: 'Sector 37, Pace City II, Gurugram',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      capacityKg: 200000,
      currentLoadKg: 89000,
      managerName: 'Anil Tyagi',
      contactPhone: '+91 124 456 7890',
      latitude: 28.4595,
      longitude: 77.0266,
    },
  });

  const whBengaluru = await prisma.warehouse.create({
    data: {
      name: 'Bengaluru Express Distribution Gateway',
      code: 'WH-BLR-03',
      address: 'Hosur Main Road, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      capacityKg: 120000,
      currentLoadKg: 61200,
      managerName: 'Karthik Raman',
      contactPhone: '+91 80 2852 0100',
      latitude: 12.9716,
      longitude: 77.5946,
    },
  });

  const whAhmedabad = await prisma.warehouse.create({
    data: {
      name: 'Ahmedabad Industrial Freight Terminal',
      code: 'WH-AMD-04',
      address: 'Changodar Industrial Estate, Sarkhej-Bavla Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382213',
      capacityKg: 100000,
      currentLoadKg: 34000,
      managerName: 'Hitesh Patel',
      contactPhone: '+91 79 2690 3300',
      latitude: 23.0225,
      longitude: 72.5714,
    },
  });

  console.log('✅ 4 Regional Warehouses created.');

  // 3. Create Vehicles
  const v1 = await prisma.vehicle.create({
    data: {
      plateNumber: 'MH-04-AB-8910',
      model: 'Tata Signa 4825.TK Heavy Freight',
      type: 'TRUCK',
      capacityKg: 25000,
      fuelType: 'Diesel',
      status: 'ASSIGNED',
      currentLocation: 'NH-48 Corridor (En route to Delhi)',
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      plateNumber: 'DL-01-CD-4512',
      model: 'Ashok Leyland Dost+ Express',
      type: 'VAN',
      capacityKg: 3500,
      fuelType: 'CNG',
      status: 'ASSIGNED',
      currentLocation: 'Gurugram Sector 48',
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      plateNumber: 'KA-05-EF-2390',
      model: 'Mahindra Zor Grand Electric',
      type: 'EV_VAN',
      capacityKg: 1800,
      fuelType: 'Electric',
      status: 'AVAILABLE',
      currentLocation: 'WH-BLR-03 Yard',
    },
  });

  const v4 = await prisma.vehicle.create({
    data: {
      plateNumber: 'GJ-01-GH-7811',
      model: 'BharatBenz 3528C Heavy Hauler',
      type: 'TRAILER',
      capacityKg: 32000,
      fuelType: 'Diesel',
      status: 'AVAILABLE',
      currentLocation: 'WH-AMD-04 Dock 3',
    },
  });

  const v5 = await prisma.vehicle.create({
    data: {
      plateNumber: 'MH-12-JK-9088',
      model: 'Eicher Pro 2049 Light Commercial',
      type: 'VAN',
      capacityKg: 4000,
      fuelType: 'Diesel',
      status: 'MAINTENANCE',
      currentLocation: 'Navi Mumbai Service Depot',
    },
  });

  console.log('✅ 5 Fleet Vehicles created.');

  // 4. Create Drivers
  const driver1 = await prisma.driver.create({
    data: {
      userId: driverUser1.id,
      name: 'Rajesh Sharma',
      email: 'rajesh.driver@fleetflow.com',
      phone: '+91 98765 43210',
      licenseNumber: 'DL-MH04201800452',
      vehicleType: 'Heavy Freight Truck',
      status: 'ON_TRIP',
      rating: 4.9,
      emergencyContact: 'Sunita Sharma (+91 98765 43219)',
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      userId: driverUser2.id,
      name: 'Amit Verma',
      email: 'amit.driver@fleetflow.com',
      phone: '+91 98123 45678',
      licenseNumber: 'DL-HR26201900891',
      vehicleType: 'Express Delivery Van',
      status: 'ON_TRIP',
      rating: 4.7,
      emergencyContact: 'Kavita Verma (+91 98123 45670)',
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: 'Sunil Yadav',
      email: 'sunil.yadav@fleetflow.com',
      phone: '+91 97654 32109',
      licenseNumber: 'DL-KA03202000345',
      vehicleType: 'Electric Light Van',
      status: 'AVAILABLE',
      rating: 4.8,
      emergencyContact: 'Rekha Yadav (+91 97654 32100)',
    },
  });

  const driver4 = await prisma.driver.create({
    data: {
      name: 'Priya Patel',
      email: 'priya.patel@fleetflow.com',
      phone: '+91 98980 12345',
      licenseNumber: 'DL-GJ01202100778',
      vehicleType: 'Multi-Axle Trailer',
      status: 'AVAILABLE',
      rating: 4.95,
      emergencyContact: 'Ramesh Patel (+91 98980 12340)',
    },
  });

  console.log('✅ 4 Drivers created.');

  // 5. Create Shipments with Full Status Histories
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 3600 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const threeDaysLater = new Date(now.getTime() + 72 * 3600 * 1000);

  // Shipment 1: In Transit (High Priority)
  const ship1 = await prisma.shipment.create({
    data: {
      trackingId: 'FF-89210-IN',
      senderName: 'Apex Electronics Ltd',
      senderPhone: '+91 22 2500 1199',
      senderAddress: 'Tech Park Zone B, Andheri East',
      senderCity: 'Mumbai',
      recipientName: 'NorthZone Retail Hub',
      recipientPhone: '+91 11 4100 8822',
      recipientAddress: 'Okhla Industrial Phase III',
      recipientCity: 'New Delhi',
      recipientPincode: '110020',
      originWarehouseId: whMumbai.id,
      destWarehouseId: whDelhi.id,
      driverId: driver1.id,
      vehicleId: v1.id,
      status: 'IN_TRANSIT',
      priority: 'HIGH',
      weightKg: 1450.5,
      packageType: 'High-Value Electronics',
      estimatedDelivery: tomorrow,
      currentLocation: 'Near Jaipur Bypass, NH-48',
      currentLat: 26.9124,
      currentLng: 75.7873,
      notes: 'Fragile: Contains micro-controller assemblies. Temperature controlled transport.',
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: ship1.id,
        status: 'PENDING',
        location: 'Mumbai Central Hub',
        notes: 'Shipment created and scheduled for dispatch.',
        updatedBy: 'Operations Desk',
        timestamp: twoDaysAgo,
      },
      {
        shipmentId: ship1.id,
        status: 'ASSIGNED',
        location: 'Mumbai Central Hub',
        notes: `Assigned to driver Rajesh Sharma (Vehicle: ${v1.plateNumber}).`,
        updatedBy: 'Operations Desk',
        timestamp: new Date(twoDaysAgo.getTime() + 4 * 3600 * 1000),
      },
      {
        shipmentId: ship1.id,
        status: 'PICKED_UP',
        location: 'Plot 42, MIDC, Navi Mumbai',
        notes: 'Cargo inspected and loaded onto vehicle.',
        updatedBy: 'Driver: Rajesh Sharma',
        timestamp: yesterday,
      },
      {
        shipmentId: ship1.id,
        status: 'IN_TRANSIT',
        location: 'Passing Vadodara - Surat Highway',
        notes: 'En route towards Delhi NCR via NH-48.',
        updatedBy: 'Driver: Rajesh Sharma',
        timestamp: new Date(yesterday.getTime() + 10 * 3600 * 1000),
      },
    ],
  });

  // Shipment 2: Out for Delivery (Urgent Priority)
  const ship2 = await prisma.shipment.create({
    data: {
      trackingId: 'FF-74125-IN',
      senderName: 'BioHealth Pharma Solutions',
      senderPhone: '+91 124 887 6655',
      senderAddress: 'Cyber City Tower 4, DLF Phase 2',
      senderCity: 'Gurugram',
      recipientName: 'Max Healthcare Central Pharmacy',
      recipientPhone: '+91 11 2651 5050',
      recipientAddress: 'Saket Institutional Area',
      recipientCity: 'New Delhi',
      recipientPincode: '110017',
      originWarehouseId: whDelhi.id,
      driverId: driver2.id,
      vehicleId: v2.id,
      status: 'OUT_FOR_DELIVERY',
      priority: 'URGENT',
      weightKg: 85.0,
      packageType: 'Medical & Vaccines',
      estimatedDelivery: now,
      currentLocation: 'Mehrauli-Gurgaon Road, 3km from destination',
      currentLat: 28.5244,
      currentLng: 77.1855,
      notes: 'Cold chain verified (2-8°C). Requires pharmacist direct handover signature.',
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: ship2.id,
        status: 'PENDING',
        location: 'Delhi NCR Fulfillment Center',
        notes: 'Urgent medical manifest registered.',
        updatedBy: 'BioHealth Dispatch',
        timestamp: yesterday,
      },
      {
        shipmentId: ship2.id,
        status: 'ASSIGNED',
        location: 'Delhi NCR Hub',
        notes: `Assigned to express driver Amit Verma (Van: ${v2.plateNumber}).`,
        updatedBy: 'Operations Desk',
        timestamp: new Date(yesterday.getTime() + 2 * 3600 * 1000),
      },
      {
        shipmentId: ship2.id,
        status: 'PICKED_UP',
        location: 'WH-DEL-02 Cold Bay',
        notes: 'Cold container secured in CNG express van.',
        updatedBy: 'Driver: Amit Verma',
        timestamp: new Date(now.getTime() - 4 * 3600 * 1000),
      },
      {
        shipmentId: ship2.id,
        status: 'OUT_FOR_DELIVERY',
        location: 'Saket Delivery Zone',
        notes: 'Driver approaching recipient facility.',
        updatedBy: 'Driver: Amit Verma',
        timestamp: new Date(now.getTime() - 1 * 3600 * 1000),
      },
    ],
  });

  // Shipment 3: Delivered (Completed)
  const ship3 = await prisma.shipment.create({
    data: {
      trackingId: 'FF-63941-IN',
      senderName: 'Gujarat Precision Castings',
      senderPhone: '+91 79 2541 3322',
      senderAddress: 'GIDC Industrial Estate, Vatva',
      senderCity: 'Ahmedabad',
      recipientName: 'Bengaluru Machine Tools Corp',
      recipientPhone: '+91 80 4112 9900',
      recipientAddress: 'Peenya Industrial Area Stage 1',
      recipientCity: 'Bengaluru',
      recipientPincode: '560058',
      originWarehouseId: whAhmedabad.id,
      destWarehouseId: whBengaluru.id,
      driverId: driver3.id,
      vehicleId: v3.id,
      status: 'DELIVERED',
      priority: 'MEDIUM',
      weightKg: 3200.0,
      packageType: 'Heavy Machinery Spares',
      estimatedDelivery: yesterday,
      actualDelivery: yesterday,
      currentLocation: 'WH-BLR-03 / Delivered at Peenya',
      notes: 'Delivered in full. Signed delivery receipt ref: POD-44120.',
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: ship3.id,
        status: 'PENDING',
        location: 'Ahmedabad Hub',
        notes: 'Consignment booking confirmed.',
        updatedBy: 'Ahmedabad Desk',
        timestamp: new Date(now.getTime() - 72 * 3600 * 1000),
      },
      {
        shipmentId: ship3.id,
        status: 'IN_TRANSIT',
        location: 'Pune - Kolhapur Highway',
        notes: 'Transit between Western & Southern hubs.',
        updatedBy: 'System Tracking',
        timestamp: new Date(now.getTime() - 40 * 3600 * 1000),
      },
      {
        shipmentId: ship3.id,
        status: 'DELIVERED',
        location: 'Peenya Industrial Area, Bengaluru',
        notes: 'Consignment successfully handed over to Gate 2 Store In-charge.',
        updatedBy: 'Driver: Sunil Yadav',
        timestamp: yesterday,
      },
    ],
  });

  // Shipment 4: Pending (Newly Created)
  const ship4 = await prisma.shipment.create({
    data: {
      trackingId: 'FF-51820-IN',
      senderName: 'Vibrant Textiles Export Co',
      senderPhone: '+91 261 245 8899',
      senderAddress: 'Ring Road Textile Market',
      senderCity: 'Surat',
      recipientName: 'Global Apparel Logistics',
      recipientPhone: '+91 22 6700 4433',
      recipientAddress: 'JNPT Port Container CFS, Nhava Sheva',
      recipientCity: 'Navi Mumbai',
      recipientPincode: '400707',
      originWarehouseId: whMumbai.id,
      status: 'PENDING',
      priority: 'MEDIUM',
      weightKg: 5200.0,
      packageType: 'Textile Fabric Bales',
      estimatedDelivery: threeDaysLater,
      currentLocation: 'Surat Dispatch Dock',
      notes: 'Ready for consolidation onto 32-foot trailer.',
    },
  });

  await prisma.shipmentStatusHistory.create({
    data: {
      shipmentId: ship4.id,
      status: 'PENDING',
      location: 'WH-BOM-01 / Surat Intake',
      notes: 'Booking created via FleetFlow Customer Portal.',
      updatedBy: 'Admin: Vikram Malhotra',
      timestamp: now,
    },
  });

  // Shipment 5: Assigned
  const ship5 = await prisma.shipment.create({
    data: {
      trackingId: 'FF-40912-IN',
      senderName: 'Karnataka Coffee Growers Syndicate',
      senderPhone: '+91 82 1244 5500',
      senderAddress: 'Plantation Avenue, Chikmagalur',
      senderCity: 'Chikmagalur',
      recipientName: 'RoastCraft Specialty Cafe Chain',
      recipientPhone: '+91 22 2490 8877',
      recipientAddress: 'Lower Parel Commercial Complex',
      recipientCity: 'Mumbai',
      recipientPincode: '400013',
      originWarehouseId: whBengaluru.id,
      destWarehouseId: whMumbai.id,
      driverId: driver4.id,
      vehicleId: v4.id,
      status: 'ASSIGNED',
      priority: 'LOW',
      weightKg: 850.0,
      packageType: 'Jute Bags Coffee Beans',
      estimatedDelivery: threeDaysLater,
      currentLocation: 'WH-BLR-03 Loading Dock 4',
      notes: 'Dry storage verified. Keep away from moisture.',
    },
  });

  await prisma.shipmentStatusHistory.create({
    data: {
      shipmentId: ship5.id,
      status: 'ASSIGNED',
      location: 'Bengaluru Distribution Gateway',
      notes: `Driver Priya Patel assigned with vehicle ${v4.plateNumber}.`,
      updatedBy: 'Operations Desk',
      timestamp: now,
    },
  });

  // Shipment 6: Failed / Delivery Exception
  const ship6 = await prisma.shipment.create({
    data: {
      trackingId: 'FF-18450-IN',
      senderName: 'DirectTech Appliances',
      senderPhone: '+91 11 4987 1100',
      senderAddress: 'Connaught Place Outer Circle',
      senderCity: 'New Delhi',
      recipientName: 'Sharma Enterprise Stores',
      recipientPhone: '+91 124 230 9988',
      recipientAddress: 'Main Market Sector 14',
      recipientCity: 'Gurugram',
      recipientPincode: '122001',
      originWarehouseId: whDelhi.id,
      driverId: driver2.id,
      vehicleId: v2.id,
      status: 'FAILED',
      priority: 'HIGH',
      weightKg: 120.0,
      packageType: 'Consumer Appliances',
      estimatedDelivery: yesterday,
      currentLocation: 'Returned to WH-DEL-02 Hub',
      notes: 'Customer shop was closed upon arrival; contact phone unreachable. Re-attempt scheduled for tomorrow.',
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: ship6.id,
        status: 'OUT_FOR_DELIVERY',
        location: 'Sector 14, Gurugram',
        notes: 'Out for final delivery.',
        updatedBy: 'Driver: Amit Verma',
        timestamp: yesterday,
      },
      {
        shipmentId: ship6.id,
        status: 'FAILED',
        location: 'Sector 14, Gurugram',
        notes: 'Customer premises shut. Customer phone unanswered after 3 attempts. Returned to hub.',
        updatedBy: 'Driver: Amit Verma',
        timestamp: new Date(yesterday.getTime() + 4 * 3600 * 1000),
      },
    ],
  });

  console.log('✅ 6 Realistic Shipments with full status history created.');

  // 6. Create In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Urgent Medical Shipment Dispatched',
        message: 'Shipment FF-74125-IN (Cold Chain Vaccines) is now OUT FOR DELIVERY in New Delhi.',
        type: 'WARNING',
        link: '/shipments/FF-74125-IN',
      },
      {
        title: 'Shipment Delivered Successfully',
        message: 'Shipment FF-63941-IN has been delivered to Bengaluru Machine Tools Corp.',
        type: 'SUCCESS',
        link: '/shipments/FF-63941-IN',
      },
      {
        title: 'Delivery Exception Alert',
        message: 'Shipment FF-18450-IN failed delivery in Gurugram (Premises closed). Needs re-scheduling.',
        type: 'ALERT',
        link: '/shipments/FF-18450-IN',
      },
      {
        title: 'Fleet Maintenance Due',
        message: 'Vehicle MH-12-JK-9088 scheduled maintenance is underway at Navi Mumbai depot.',
        type: 'INFO',
        link: '/vehicles',
      },
    ],
  });

  console.log('✅ In-app system notifications created.');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
