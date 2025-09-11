const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if admin user exists
    console.log('\n📌 Checking for admin user...');
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin' },
      include: {
        role: true,
        status: true,
        company: true
      }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.user_name,
        role: adminUser.role.role_name,
        status: adminUser.status.status_name,
        company: adminUser.company?.company_name || 'No company'
      });
    } else {
      console.log('❌ Admin user not found');
      
      // List all users
      console.log('\n📌 Listing all users:');
      const allUsers = await prisma.user.findMany({
        include: {
          role: true,
          status: true
        }
      });
      
      if (allUsers.length === 0) {
        console.log('No users found in database');
      } else {
        allUsers.forEach(user => {
          console.log(`- ${user.email} (${user.user_name}) - Role: ${user.role.role_name}, Status: ${user.status.status_name}`);
        });
      }
    }
    
    // Check roles
    console.log('\n📌 Available roles:');
    const roles = await prisma.role.findMany();
    roles.forEach(role => {
      console.log(`- ID: ${role.id}, Name: ${role.role_name}`);
    });
    
    // Check statuses
    console.log('\n📌 Available user statuses:');
    const statuses = await prisma.userStatus.findMany();
    statuses.forEach(status => {
      console.log(`- ID: ${status.id}, Name: ${status.status_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📴 Database disconnected');
  }
}

testDatabase();