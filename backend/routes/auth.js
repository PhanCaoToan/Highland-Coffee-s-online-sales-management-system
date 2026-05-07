const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');
const { auth } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Tạo mã tự động
function generateId(prefix, number) {
  return prefix + String(number).padStart(10 - prefix.length, '0');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { tenKhachHang, email, password, soDienThoai, diaChi } = req.body;
    const pool = await getPool();

    // Check email tồn tại
    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Lấy số tài khoản tiếp theo
    const countTK = await pool.request().query('SELECT COUNT(*) as cnt FROM TaiKhoan');
    const tkId = generateId('TK', countTK.recordset[0].cnt + 1);

    const countKH = await pool.request().query('SELECT COUNT(*) as cnt FROM KhachHang');
    const khId = generateId('KH', countKH.recordset[0].cnt + 1);

    // Tạo tài khoản
    await pool.request()
      .input('maTK', sql.Char(10), tkId)
      .input('tenDN', sql.VarChar, email)
      .input('matKhau', sql.VarChar, hashedPassword)
      .input('vaiTro', sql.NVarChar, 'customer')
      .query("INSERT INTO TaiKhoan (MaTaiKhoan, TenDangNhap, MatKhau, VaiTro) VALUES (@maTK, @tenDN, @matKhau, @vaiTro)");

    // Tạo khách hàng
    await pool.request()
      .input('maKH', sql.Char(10), khId)
      .input('tenKH', sql.NVarChar, tenKhachHang)
      .input('sdt', sql.Char(10), soDienThoai || null)
      .input('email', sql.VarChar, email)
      .input('diaChi', sql.NVarChar, diaChi || null)
      .input('maTK', sql.Char(10), tkId)
      .query("INSERT INTO KhachHang (MaKhachHang, TenKhachHang, SoDienThoai, Email, DiaChiKhachHang, MaTaiKhoan) VALUES (@maKH, @tenKH, @sdt, @email, @diaChi, @maTK)");

    const token = jwt.sign(
      { id: tkId, maKH: khId, email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: tkId, maKH: khId, fullName: tenKhachHang, email, role: 'customer' },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM TaiKhoan WHERE TenDangNhap = @email');

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const account = result.recordset[0];
    const isMatch = await bcrypt.compare(password, account.MatKhau);

    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const role = account.VaiTro?.trim() || 'customer';
    let fullName = email;
    let maKH = null;
    let maNV = null;

    // Lấy thông tin chi tiết
    if (role === 'customer') {
      const kh = await pool.request()
        .input('maTK', sql.Char(10), account.MaTaiKhoan)
        .query('SELECT * FROM KhachHang WHERE MaTaiKhoan = @maTK');
      if (kh.recordset.length > 0) {
        fullName = kh.recordset[0].TenKhachHang;
        maKH = kh.recordset[0].MaKhachHang?.trim();
      }
    } else {
      const nv = await pool.request()
        .input('maTK', sql.Char(10), account.MaTaiKhoan)
        .query('SELECT * FROM NhanVien WHERE MaTaiKhoan = @maTK');
      if (nv.recordset.length > 0) {
        fullName = nv.recordset[0].HoTen;
        maNV = nv.recordset[0].MaNhanVien?.trim();
      }
    }

    const token = jwt.sign(
      { id: account.MaTaiKhoan.trim(), maKH, maNV, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: account.MaTaiKhoan.trim(),
        maKH,
        maNV,
        fullName,
        email,
        role,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('maTK', sql.Char(10), req.user.id)
      .query('SELECT MaTaiKhoan, TenDangNhap, VaiTro FROM TaiKhoan WHERE MaTaiKhoan = @maTK');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const account = result.recordset[0];
    res.json({
      id: account.MaTaiKhoan.trim(),
      email: account.TenDangNhap.trim(),
      role: account.VaiTro?.trim(),
      maKH: req.user.maKH,
      maNV: req.user.maNV,
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ─── FORGOT PASSWORD ───

// Step 1: Check email exists, return masked phone
router.post('/forgot-password/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const pool = await getPool();

    // Find account by email
    const account = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT MaTaiKhoan, VaiTro FROM TaiKhoan WHERE TenDangNhap = @email');

    if (account.recordset.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    const tk = account.recordset[0];
    const role = tk.VaiTro?.trim() || 'customer';

    // Get phone number based on role
    let phone = null;
    if (role === 'customer') {
      const kh = await pool.request()
        .input('maTK', sql.Char(10), tk.MaTaiKhoan)
        .query('SELECT SoDienThoai FROM KhachHang WHERE MaTaiKhoan = @maTK');
      if (kh.recordset.length > 0) phone = kh.recordset[0].SoDienThoai?.trim();
    } else {
      const nv = await pool.request()
        .input('maTK', sql.Char(10), tk.MaTaiKhoan)
        .query('SELECT SoDienThoai FROM NhanVien WHERE MaTaiKhoan = @maTK');
      if (nv.recordset.length > 0) phone = nv.recordset[0].SoDienThoai?.trim();
    }

    if (!phone) {
      return res.status(400).json({ message: 'Tài khoản chưa đăng ký số điện thoại. Vui lòng liên hệ quản trị viên.' });
    }

    // Mask phone: 09****1234
    const maskedPhone = phone.substring(0, 2) + '****' + phone.substring(6);

    res.json({ maskedPhone });
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Step 2: Verify phone number
router.post('/forgot-password/verify-phone', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const pool = await getPool();

    const account = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT MaTaiKhoan, VaiTro FROM TaiKhoan WHERE TenDangNhap = @email');

    if (account.recordset.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    const tk = account.recordset[0];
    const role = tk.VaiTro?.trim() || 'customer';

    let dbPhone = null;
    if (role === 'customer') {
      const kh = await pool.request()
        .input('maTK', sql.Char(10), tk.MaTaiKhoan)
        .query('SELECT SoDienThoai FROM KhachHang WHERE MaTaiKhoan = @maTK');
      if (kh.recordset.length > 0) dbPhone = kh.recordset[0].SoDienThoai?.trim();
    } else {
      const nv = await pool.request()
        .input('maTK', sql.Char(10), tk.MaTaiKhoan)
        .query('SELECT SoDienThoai FROM NhanVien WHERE MaTaiKhoan = @maTK');
      if (nv.recordset.length > 0) dbPhone = nv.recordset[0].SoDienThoai?.trim();
    }

    if (phone.trim() !== dbPhone) {
      return res.status(400).json({ message: 'Số điện thoại không khớp với tài khoản' });
    }

    res.json({ verified: true });
  } catch (err) {
    console.error('Verify phone error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Step 3: Reset password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;
    const pool = await getPool();

    // Re-verify email + phone for security
    const account = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT MaTaiKhoan, VaiTro FROM TaiKhoan WHERE TenDangNhap = @email');

    if (account.recordset.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    const tk = account.recordset[0];
    const role = tk.VaiTro?.trim() || 'customer';

    let dbPhone = null;
    if (role === 'customer') {
      const kh = await pool.request()
        .input('maTK', sql.Char(10), tk.MaTaiKhoan)
        .query('SELECT SoDienThoai FROM KhachHang WHERE MaTaiKhoan = @maTK');
      if (kh.recordset.length > 0) dbPhone = kh.recordset[0].SoDienThoai?.trim();
    } else {
      const nv = await pool.request()
        .input('maTK', sql.Char(10), tk.MaTaiKhoan)
        .query('SELECT SoDienThoai FROM NhanVien WHERE MaTaiKhoan = @maTK');
      if (nv.recordset.length > 0) dbPhone = nv.recordset[0].SoDienThoai?.trim();
    }

    if (phone.trim() !== dbPhone) {
      return res.status(400).json({ message: 'Xác minh thất bại' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('maTK', sql.Char(10), tk.MaTaiKhoan)
      .input('matKhau', sql.VarChar, hashedPassword)
      .query('UPDATE TaiKhoan SET MatKhau = @matKhau WHERE MaTaiKhoan = @maTK');

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
