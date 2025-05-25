// scripts/hash-password.js
const bcrypt = require('bcryptjs');

async function hashAndPrint(password) {
  const saltRounds = 10; // Nên giữ nguyên số này
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Mật khẩu của bạn là:', password);
  console.log('Chuỗi hash tương ứng là:', hashedPassword);
  console.log('\nSử dụng chuỗi hash này để chèn vào database.');
}

// Thay đổi mật khẩu này bằng mật khẩu bạn muốn dùng cho tài khoản admin ban đầu
const adminPassword = 'adminpassword123';
hashAndPrint(adminPassword);