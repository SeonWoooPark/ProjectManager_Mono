const fs = require('fs');
const path = require('path');

// 스키마 파일 경로
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// 스키마 파일 읽기
let schema = fs.readFileSync(schemaPath, 'utf8');

// 모델명 매핑 (snake_case -> PascalCase)
const modelMapping = {
  'activity_logs': 'ActivityLog',
  'allocate_projects': 'AllocateProject',
  'companies': 'Company',
  'companies_status': 'CompanyStatus',
  'password_reset_tokens': 'PasswordResetToken',
  'project_status': 'ProjectStatus',
  'projects': 'Project',
  'refresh_tokens': 'RefreshToken',
  'reviews': 'Review',
  'roles': 'Role',
  'tasks': 'Task',
  'tasks_status': 'TaskStatus',
  'token_blacklist': 'TokenBlacklist',
  'users': 'User',
  'users_status': 'UserStatus'
};

// 1. 모델명 변경 및 @@map 추가
Object.entries(modelMapping).forEach(([oldName, newName]) => {
  // model 선언 변경
  const modelRegex = new RegExp(`model ${oldName}`, 'g');
  schema = schema.replace(modelRegex, `model ${newName}`);
  
  // @@map 추가 (이미 없는 경우에만)
  const modelBlockRegex = new RegExp(`(model ${newName} {[^}]+)(?!@@map)\\n}`, 'g');
  schema = schema.replace(modelBlockRegex, `$1\n\n  @@map("${oldName}")\n}`);
});

// 2. 필드 타입에서 모델 참조 변경
Object.entries(modelMapping).forEach(([oldName, newName]) => {
  // 필드 타입 참조 변경 (예: users -> User)
  const fieldTypeRegex = new RegExp(`(\\s+\\w+\\s+)${oldName}(\\??)(\\s|\\[|@)`, 'g');
  schema = schema.replace(fieldTypeRegex, `$1${newName}$2$3`);
  
  // 배열 타입 참조 변경 (예: users[] -> User[])
  const arrayTypeRegex = new RegExp(`${oldName}\\[\\]`, 'g');
  schema = schema.replace(arrayTypeRegex, `${newName}[]`);
});

// 3. @relation의 references 필드에서 모델명 변경
Object.entries(modelMapping).forEach(([oldName, newName]) => {
  const relationRegex = new RegExp(`@relation\\(([^)]*references:\\s*\\[)([^\\]]+)(\\][^)]*)\\)`, 'g');
  schema = schema.replace(relationRegex, (match, before, refs, after) => {
    return match; // references는 필드명이므로 변경하지 않음
  });
});

// 4. 복잡한 관계 이름 간소화
const relationRenamings = [
  // companies 관계
  ['users_companies_manager_idTousers', 'manager'],
  ['companies_manager_idTousers', 'managedCompany'],
  ['users_users_company_idTocompanies', 'employees'],
  ['companies_users_company_idTocompanies', 'company'],
  
  // reviews 관계
  ['users_reviews_assignee_idTousers', 'assignee'],
  ['reviews_assignee_idTousers', 'assignedReviews'],
  ['users_reviews_manager_idTousers', 'manager'],
  ['reviews_manager_idTousers', 'managedReviews'],
  
  // status 관계
  ['companies_status', 'status'],
  ['project_status', 'status'],
  ['tasks_status', 'status'],
  ['users_status', 'status'],
  
  // 기타 관계
  ['activity_logs', 'activityLogs'],
  ['allocate_projects', 'allocatedProjects'],
  ['password_reset_tokens', 'passwordResetTokens'],
  ['refresh_tokens', 'refreshTokens'],
  ['token_blacklist', 'tokenBlacklist']
];

relationRenamings.forEach(([oldName, newName]) => {
  const regex = new RegExp(`(\\s+)${oldName}(\\s+)`, 'g');
  schema = schema.replace(regex, `$1${newName}$2`);
});

// 5. Check constraint 주석 제거
schema = schema.replace(/\/\/\/ This table contains check constraints.*\n/g, '');

// 6. 들여쓰기 정리
schema = schema.replace(/\n\n\n+/g, '\n\n');

// 스키마 파일 저장
fs.writeFileSync(schemaPath, schema);

console.log('✅ Prisma 스키마 최적화 완료!');
console.log('📝 변경 사항:');
console.log('  - 모델명을 PascalCase로 변경');
console.log('  - @@map으로 실제 테이블명 유지');
console.log('  - 관계 이름 간소화');
console.log('  - Check constraint 주석 제거');
console.log('\n⚠️  관계 이름과 필드명을 수동으로 확인해주세요.');