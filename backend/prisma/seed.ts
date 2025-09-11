import { PrismaClient } from '@prisma/client';

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

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });