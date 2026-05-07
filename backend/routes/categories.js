const express = require('express');
const { getPool, sql } = require('../config/db');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT dm.MaDanhMuc, dm.TenDanhMuc, dm.Mota,
             COUNT(sp.MaSanPham) as productCount
      FROM DanhMucSanPham dm
      LEFT JOIN SanPham sp ON sp.MaDanhMuc = dm.MaDanhMuc AND sp.TrangThaiSanPham = N'Đang bán'
      GROUP BY dm.MaDanhMuc, dm.TenDanhMuc, dm.Mota
      ORDER BY dm.MaDanhMuc
    `);
    // Map to consistent format for frontend
    const categories = result.recordset.map(c => ({
      id: c.MaDanhMuc?.trim(),
      name: c.TenDanhMuc,
      description: c.Mota,
      productCount: c.productCount,
    }));
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
