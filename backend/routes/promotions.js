const express = require('express');
const { getPool, sql } = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/promotions - Lấy danh sách khuyến mãi đang hoạt động
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT MaKhuyenMai, TenKhuyenMai, PhanTramGiam, 
             NgayBatDau, NgayKetThuc, DieuKienKhuyenMai
      FROM KhuyenMai
      WHERE NgayBatDau <= GETDATE() AND NgayKetThuc >= GETDATE()
      ORDER BY PhanTramGiam DESC
    `);

    const promotions = result.recordset.map(p => ({
      id: p.MaKhuyenMai?.trim(),
      name: p.TenKhuyenMai,
      discount: p.PhanTramGiam,
      startDate: p.NgayBatDau,
      endDate: p.NgayKetThuc,
      condition: p.DieuKienKhuyenMai,
    }));

    res.json(promotions);
  } catch (err) {
    console.error('Get promotions error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/promotions/validate - Kiểm tra mã khuyến mãi
router.post('/validate', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã khuyến mãi' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('code', sql.Char(10), code)
      .query(`
        SELECT MaKhuyenMai, TenKhuyenMai, PhanTramGiam,
               NgayBatDau, NgayKetThuc, DieuKienKhuyenMai
        FROM KhuyenMai
        WHERE MaKhuyenMai = @code
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Mã khuyến mãi không tồn tại' });
    }

    const p = result.recordset[0];
    const now = new Date();
    const start = new Date(p.NgayBatDau);
    const end = new Date(p.NgayKetThuc);

    if (now < start) {
      return res.status(400).json({ message: 'Chương trình khuyến mãi chưa bắt đầu' });
    }
    if (now > end) {
      return res.status(400).json({ message: 'Chương trình khuyến mãi đã hết hạn' });
    }

    res.json({
      id: p.MaKhuyenMai?.trim(),
      name: p.TenKhuyenMai,
      discount: p.PhanTramGiam,
      startDate: p.NgayBatDau,
      endDate: p.NgayKetThuc,
      condition: p.DieuKienKhuyenMai,
    });
  } catch (err) {
    console.error('Validate promotion error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
