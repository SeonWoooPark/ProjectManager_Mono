const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.test', override: true });

async function checkData() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        status: true,
        company: true
      }
    });
    
    console.log('\n=== 현재 DB 상태 ===');
    console.log('총 사용자 수:', users.length);
    
    users.forEach(user => {
      console.log(`\n사용자: ${user.email}`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - 이름: ${user.user_name}`);
      console.log(`  - 역할: ${user.role?.role_name || 'N/A'}`);
      console.log(`  - 상태: ${user.status?.status_name || 'N/A'}`);
      console.log(`  - 회사 ID: ${user.company_id || 'N/A'}`);
    });

    const companies = await prisma.company.findMany({
      include: {
        status: true
      }
    });
    
    console.log('\n총 회사 수:', companies.length);
    companies.forEach(company => {
      console.log(`\n회사: ${company.company_name}`);
      console.log(`  - ID: ${company.id}`);
      console.log(`  - 상태: ${company.status?.status_name || 'N/A'}`);
      console.log(`  - 초대 코드: ${company.invitation_code || 'N/A'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();