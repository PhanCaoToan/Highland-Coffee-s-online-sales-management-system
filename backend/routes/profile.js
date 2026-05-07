const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - Lấy thông tin tài khoản
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const role = req.user.role;
    console.log('Profile request - user:', JSON.stringify(req.user));

    // Thử tìm trong KhachHang trước
    const khResult = await pool.request()
      .input('maTK', sql.Char(10), req.user.id)
      .query(`
        SELECT kh.MaKhachHang, kh.TenKhachHang, kh.SoDienThoai, kh.Email, 
               kh.DiaChiKhachHang, kh.DiemTichLuy,
               tk.TenDangNhap, tk.VaiTro, tk.MaTaiKhoan
        FROM KhachHang kh
        INNER JOIN TaiKhoan tk ON kh.MaTaiKhoan = tk.MaTaiKhoan
        WHERE tk.MaTaiKhoan = @maTK
      `);

    if (khResult.recordset.length > 0) {
      const kh = khResult.recordset[0];
      return res.json({
        maTaiKhoan: kh.MaTaiKhoan?.trim(),
        maKhachHang: kh.MaKhachHang?.trim(),
        tenKhachHang: kh.TenKhachHang,
        soDienThoai: kh.SoDienThoai?.trim(),
        email: kh.Email?.trim() || kh.TenDangNhap?.trim(),
        diaChiKhachHang: kh.DiaChiKhachHang,
        diemTichLuy: kh.DiemTichLuy || 0,
        vaiTro: kh.VaiTro?.trim(),
      });
    }

    // Nếu không phải KH, tìm trong NhanVien
    const nvResult = await pool.request()
      .input('maTK', sql.Char(10), req.user.id)
      .query(`
        SELECT nv.MaNhanVien, nv.HoTen, nv.NgayVaoLam, nv.SoDienThoai, 
               nv.TrangThaiLamViec, nv.ChucVu,
               tk.TenDangNhap, tk.VaiTro, tk.MaTaiKhoan
        FROM NhanVien nv
        INNER JOIN TaiKhoan tk ON nv.MaTaiKhoan = tk.MaTaiKhoan
        WHERE tk.MaTaiKhoan = @maTK
      `);

    if (nvResult.recordset.length > 0) {
      const nv = nvResult.recordset[0];
      return res.json({
        maTaiKhoan: nv.MaTaiKhoan?.trim(),
        maNhanVien: nv.MaNhanVien?.trim(),
        hoTen: nv.HoTen,
        soDienThoai: nv.SoDienThoai?.trim(),
        email: nv.TenDangNhap?.trim(),
        chucVu: nv.ChucVu,
        ngayVaoLam: nv.NgayVaoLam,
        trangThaiLamViec: nv.TrangThaiLamViec,
        vaiTro: nv.VaiTro?.trim(),
      });
    }

    return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản' });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/profile - Cập nhật thông tin cá nhân
router.put('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const role = req.user.role;

    if (role === 'customer') {
      const { tenKhachHang, soDienThoai, diaChiKhachHang } = req.body;

      await pool.request()
        .input('maTK', sql.Char(10), req.user.id)
        .input('tenKH', sql.NVarChar, tenKhachHang)
        .input('sdt', sql.Char(10), soDienThoai || null)
        .input('diaChi', sql.NVarChar, diaChiKhachHang || null)
        .query(`
          UPDATE KhachHang 
          SET TenKhachHang = @tenKH, 
              SoDienThoai = @sdt, 
              DiaChiKhachHang = @diaChi
          WHERE MaTaiKhoan = @maTK
        `);

      // Cập nhật user data trong response
      const updated = await pool.request()
        .input('maTK', sql.Char(10), req.user.id)
        .query(`
          SELECT kh.TenKhachHang, kh.SoDienThoai, kh.DiaChiKhachHang, kh.Email, kh.DiemTichLuy
          FROM KhachHang kh WHERE kh.MaTaiKhoan = @maTK
        `);

      res.json({
        message: 'Cập nhật thành công',
        user: updated.recordset[0],
      });
    } else {
      const { hoTen, soDienThoai } = req.body;

      await pool.request()
        .input('maTK', sql.Char(10), req.user.id)
        .input('hoTen', sql.NVarChar, hoTen)
        .input('sdt', sql.Char(10), soDienThoai || null)
        .query(`
          UPDATE NhanVien 
          SET HoTen = @hoTen, 
              SoDienThoai = @sdt
          WHERE MaTaiKhoan = @maTK
        `);

      const updated = await pool.request()
        .input('maTK', sql.Char(10), req.user.id)
        .query(`
          SELECT nv.HoTen, nv.SoDienThoai, nv.ChucVu
          FROM NhanVien nv WHERE nv.MaTaiKhoan = @maTK
        `);

      res.json({
        message: 'Cập nhật thành công',
        user: updated.recordset[0],
      });
    }
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/profile/password - Đổi mật khẩu
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
    }

    const pool = await getPool();

    // Lấy mật khẩu hiện tại
    const result = await pool.request()
      .input('maTK', sql.Char(10), req.user.id)
      .query('SELECT MatKhau FROM TaiKhoan WHERE MaTaiKhoan = @maTK');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, result.recordset[0].MatKhau);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash và cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('maTK', sql.Char(10), req.user.id)
      .input('matKhau', sql.VarChar, hashedPassword)
      .query('UPDATE TaiKhoan SET MatKhau = @matKhau WHERE MaTaiKhoan = @maTK');

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
