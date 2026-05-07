const bcrypt = require('bcryptjs');
const { getPool, sql } = require('./config/db');

async function seed() {
  try {
    const pool = await getPool();

    // Check if data exists
    const existing = await pool.request().query('SELECT COUNT(*) as count FROM TaiKhoan');
    if (existing.recordset[0].count > 0) {
      console.log('⚠️  Tài khoản đã tồn tại, cập nhật password hash...');
    }

    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Upsert accounts with correct password hashes
    const accounts = [
      { id: 'TK001', email: 'admin@highlands.com', password: adminPassword, role: 'admin' },
      { id: 'TK002', email: 'staff@highlands.com', password: staffPassword, role: 'staff' },
      { id: 'TK003', email: 'customer@gmail.com', password: customerPassword, role: 'customer' },
    ];

    for (const acc of accounts) {
      const exists = await pool.request()
        .input('id', sql.Char(10), acc.id)
        .query('SELECT MaTaiKhoan FROM TaiKhoan WHERE MaTaiKhoan = @id');

      if (exists.recordset.length > 0) {
        await pool.request()
          .input('id', sql.Char(10), acc.id)
          .input('password', sql.VarChar, acc.password)
          .input('role', sql.NVarChar, acc.role)
          .query('UPDATE TaiKhoan SET MatKhau = @password, VaiTro = @role WHERE MaTaiKhoan = @id');
        console.log(`  ✅ Cập nhật: ${acc.email}`);
      } else {
        await pool.request()
          .input('id', sql.Char(10), acc.id)
          .input('email', sql.VarChar, acc.email)
          .input('password', sql.VarChar, acc.password)
          .input('role', sql.NVarChar, acc.role)
          .query('INSERT INTO TaiKhoan (MaTaiKhoan, TenDangNhap, MatKhau, VaiTro) VALUES (@id, @email, @password, @role)');
        console.log(`  ✅ Tạo mới: ${acc.email}`);
      }
    }

    console.log('');
    console.log('📋 Seed hoàn tất! Tài khoản:');
    console.log('   👑 Admin:    admin@highlands.com / admin123');
    console.log('   👤 Staff:    staff@highlands.com / staff123');
    console.log('   🛒 Customer: customer@gmail.com / customer123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
