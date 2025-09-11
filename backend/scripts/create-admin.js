const bcrypt = require('bcryptjs');

// 'admin' 비밀번호를 bcrypt로 해싱
async function hashPassword() {
  const password = 'admin';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Hash length:', hash.length);
  
  // 검증
  const isValid = await bcrypt.compare(password, hash);
  console.log('Validation:', isValid);
}

hashPassword();