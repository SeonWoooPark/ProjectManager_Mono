const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkDatabaseSchemas() {
  try {
    console.log('🔍 데이터베이스 스키마 조사 시작...\n');
    
    // 1. 모든 스키마 목록 확인
    const schemasResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `);
    
    console.log('📋 사용 가능한 스키마:');
    schemasResult.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });
    console.log('');

    // 2. 각 스키마의 테이블 확인
    for (const schemaRow of schemasResult.rows) {
      const schema = schemaRow.schema_name;
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `, [schema]);
      
      if (tablesResult.rows.length > 0) {
        console.log(`📁 스키마 '${schema}'의 테이블 (${tablesResult.rows.length}개):`);
        tablesResult.rows.forEach(row => {
          console.log(`    - ${row.table_name}`);
        });
        console.log('');
      }
    }

    // 3. users 테이블 찾기
    const usersTableResult = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users' 
      AND table_type = 'BASE TABLE';
    `);
    
    if (usersTableResult.rows.length > 0) {
      console.log('✅ "users" 테이블 위치:');
      usersTableResult.rows.forEach(row => {
        console.log(`    스키마: ${row.table_schema}, 테이블: ${row.table_name}`);
      });
    } else {
      console.log('⚠️  "users" 테이블을 찾을 수 없습니다.');
    }
    
    console.log('\n💡 권장사항:');
    if (usersTableResult.rows.length > 0) {
      const targetSchema = usersTableResult.rows[0].table_schema;
      console.log(`   DATABASE_URL의 schema 파라미터를 '${targetSchema}'로 설정하세요.`);
      console.log(`   예: DATABASE_URL=postgresql://admin:coint4602@112.160.112.121:60003/projectmanager?schema=${targetSchema}`);
    } else {
      console.log('   TypeORM이 아직 테이블을 생성하지 않았습니다.');
      console.log('   먼저 TypeORM으로 서버를 실행해서 테이블을 생성한 후 마이그레이션을 진행하세요.');
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 조사 중 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseSchemas();