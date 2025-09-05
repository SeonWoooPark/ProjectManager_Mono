#!/bin/bash

echo "🚀 프로젝트 설정을 시작합니다..."

# Backend 설정
echo "📦 Backend 패키지 설치 중..."
cd backend
npm install
cp .env.example .env
echo "✅ Backend 설정 완료"

# Frontend 설정
echo "📦 Frontend 패키지 설치 중..."
cd ../frontend
npm install
echo "✅ Frontend 설정 완료"

echo "
🎉 설정이 완료되었습니다!

개발 서버 실행:

방법 1) 개별 실행:
  백엔드: cd backend && npm run dev
  프론트엔드: cd frontend && npm run dev

방법 2) Docker Compose:
  docker-compose up

백엔드: http://localhost:5000
프론트엔드: http://localhost:3000
"