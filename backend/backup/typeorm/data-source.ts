import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';

// .env 파일 로드
dotenv.config();

// TypeORM 데이터 소스 설정
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'dbuser',
  password: process.env.DB_PASSWORD || 'dbpassword123',
  database: process.env.DB_NAME || 'pm_database',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User], // 모든 엔티티를 여기에 추가
  migrations: ['dist/migrations/*.js'],
  subscribers: ['dist/subscribers/*.js'],
};

// DataSource 인스턴스 생성
export const AppDataSource = new DataSource(dataSourceOptions);

// 데이터베이스 연결 초기화 함수
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection has been established successfully.');
    
    // synchronize가 true인 경우 자동으로 테이블 생성
    if (process.env.DB_SYNCHRONIZE === 'true') {
      console.log('📊 Database tables synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// 데이터베이스 연결 종료 함수
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📴 Database connection closed.');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};