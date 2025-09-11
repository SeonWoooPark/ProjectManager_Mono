const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Find admin user
    console.log('\n📌 Finding admin user...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin' },
      include: {
        role: true,
        status: true,
        company: true
      }
    });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ User found:', {
      email: user.email,
      name: user.user_name,
      passwordHash: user.password_hash.substring(0, 20) + '...',
      role: user.role.role_name,
      status: user.status.status_name
    });
    
    // Test password
    console.log('\n📌 Testing password "admin"...');
    const isValid = await bcrypt.compare('admin', user.password_hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      // Try to check if it's plain text (for testing only)
      console.log('Checking if password is stored as plain text...');
      if (user.password_hash === 'admin') {
        console.log('⚠️  Password is stored as plain text! This is a security issue.');
        
        // Hash the password properly
        console.log('\n📌 Creating proper password hash...');
        const hashedPassword = await bcrypt.hash('admin', 10);
        console.log('New hash:', hashedPassword);
        
        // Update the user's password
        console.log('\n📌 Updating admin password to use proper hash...');
        await prisma.user.update({
          where: { id: user.id },
          data: { password_hash: hashedPassword }
        });
        console.log('✅ Password updated successfully');
      } else {
        console.log('❌ Password "admin" does not match');
        console.log('Current hash starts with:', user.password_hash.substring(0, 30));
      }
    } else {
      console.log('✅ Password is valid and properly hashed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📴 Database disconnected');
  }
}

testLogin();