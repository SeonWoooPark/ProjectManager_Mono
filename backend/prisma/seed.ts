import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Create Roles
  await prisma.role.createMany({
    data: [
      { id: 1, role_name: 'SYSTEM_ADMIN' },
      { id: 2, role_name: 'COMPANY_MANAGER' },
      { id: 3, role_name: 'TEAM_MEMBER' },
    ],
    skipDuplicates: true,
  });

  // Create User Status
  await prisma.userStatus.createMany({
    data: [
      { id: 1, status_name: 'ACTIVE' },
      { id: 2, status_name: 'INACTIVE' },
      { id: 3, status_name: 'PENDING' },
    ],
    skipDuplicates: true,
  });

  // Create Company Status
  await prisma.companyStatus.createMany({
    data: [
      { id: 1, status_name: 'ACTIVE' },
      { id: 2, status_name: 'INACTIVE' },
      { id: 3, status_name: 'PENDING' },
    ],
    skipDuplicates: true,
  });

  // Create Project Status
  await prisma.projectStatus.createMany({
    data: [
      { id: 1, status_name: 'NOT_STARTED' },
      { id: 2, status_name: 'IN_PROGRESS' },
      { id: 3, status_name: 'COMPLETED' },
      { id: 4, status_name: 'ON_HOLD' },
      { id: 5, status_name: 'CANCELLED' },
    ],
    skipDuplicates: true,
  });

  // Create Task Status
  await prisma.taskStatus.createMany({
    data: [
      { id: 1, status_name: 'TODO' },
      { id: 2, status_name: 'IN_PROGRESS' },
      { id: 3, status_name: 'IN_REVIEW' },
      { id: 4, status_name: 'DONE' },
      { id: 5, status_name: 'CANCELLED' },
    ],
    skipDuplicates: true,
  });

  // Create System Admin User
  const adminId = uuidv4();
  const hashedPassword = await bcrypt.hash('Admin123!@#', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      id: adminId,
      email: 'admin@system.com',
      password_hash: hashedPassword,
      user_name: 'System Administrator',
      phone_number: '010-1234-5678',
      role_id: 1, // SYSTEM_ADMIN
      status_id: 1, // ACTIVE
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log('✅ System admin created:', {
    email: adminUser.email,
    name: adminUser.user_name,
    role: 'SYSTEM_ADMIN',
  });

  // Create Sample Company Manager User
  const managerId = uuidv4();
  const companyId = uuidv4();
  const managerHashedPassword = await bcrypt.hash('Manager123!@#', 10);

  // Create Company first
  const sampleCompany = await prisma.company.upsert({
    where: { id: companyId },
    update: {},
    create: {
      id: companyId,
      company_name: 'Sample Company',
      company_description: 'A sample company for testing',
      status_id: 1, // ACTIVE
      invitation_code: 'SAMPLE2024',
      created_at: new Date(),
    },
  });

  // Create Manager User
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@sample.com' },
    update: {},
    create: {
      id: managerId,
      email: 'manager@sample.com',
      password_hash: managerHashedPassword,
      user_name: 'Company Manager',
      phone_number: '010-9876-5432',
      role_id: 2, // COMPANY_MANAGER
      status_id: 1, // ACTIVE
      company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // Update company with manager_id
  await prisma.company.update({
    where: { id: companyId },
    data: { manager_id: managerId },
  });

  console.log('✅ Company manager created:', {
    email: managerUser.email,
    name: managerUser.user_name,
    company: sampleCompany.company_name,
    role: 'COMPANY_MANAGER',
  });

  console.log('✅ Database seeded successfully');
  console.log('\n📝 Test Accounts:');
  console.log('1. System Admin:');
  console.log('   Email: admin@system.com');
  console.log('   Password: Admin123!@#');
  console.log('\n2. Company Manager:');
  console.log('   Email: manager@sample.com');
  console.log('   Password: Manager123!@#');
  console.log('   Company: Sample Company');
  console.log('   Invitation Code: SAMPLE2024');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
