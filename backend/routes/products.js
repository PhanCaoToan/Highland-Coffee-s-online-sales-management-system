const express = require('express');
const { getPool, sql } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { categoryId, search, limit } = req.query;
    const pool = await getPool();
    let query = `
      SELECT sp.MaSanPham, sp.TenSanPham, sp.GiaBan, sp.HinhAnh, sp.MoTa,
             sp.TrangThaiSanPham, sp.MaDanhMuc, dm.TenDanhMuc
      FROM SanPham sp
      LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
      WHERE sp.TrangThaiSanPham = N'Đang bán'
    `;
    const request = pool.request();

    if (categoryId) {
      query += ' AND sp.MaDanhMuc = @categoryId';
      request.input('categoryId', sql.Char(10), categoryId);
    }

    if (search) {
      query += ' AND sp.TenSanPham LIKE @search';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ' ORDER BY sp.MaDanhMuc, sp.MaSanPham';

    if (limit) {
      query += ' OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY';
      request.input('limit', sql.Int, parseInt(limit));
    }

    const result = await request.query(query);

    // Map to consistent format
    const products = result.recordset.map(p => ({
      id: p.MaSanPham?.trim(),
      name: p.TenSanPham,
      description: p.MoTa,
      price: p.GiaBan,
      image: p.HinhAnh,
      status: p.TrangThaiSanPham,
      categoryId: p.MaDanhMuc?.trim(),
      categoryName: p.TenDanhMuc,
    }));

    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Char(10), req.params.id)
      .query(`
        SELECT sp.*, dm.TenDanhMuc
        FROM SanPham sp
        LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE sp.MaSanPham = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const p = result.recordset[0];
    res.json({
      id: p.MaSanPham?.trim(),
      name: p.TenSanPham,
      description: p.MoTa,
      price: p.GiaBan,
      image: p.HinhAnh,
      status: p.TrangThaiSanPham,
      categoryId: p.MaDanhMuc?.trim(),
      categoryName: p.TenDanhMuc,
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/products (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, price, image, categoryId, status } = req.body;
    const pool = await getPool();

    const count = await pool.request().query('SELECT COUNT(*) as cnt FROM SanPham');
    const masp = 'SP' + String(count.recordset[0].cnt + 1).padStart(3, '0');

    await pool.request()
      .input('maSP', sql.Char(10), masp)
      .input('tenSP', sql.NVarChar, name)
      .input('moTa', sql.NVarChar, description || null)
      .input('gia', sql.Decimal(18, 2), price)
      .input('hinh', sql.NVarChar, image || null)
      .input('trangThai', sql.NVarChar, status || 'Đang bán')
      .input('maDM', sql.Char(10), categoryId)
      .query(`INSERT INTO SanPham (MaSanPham, TenSanPham, MoTa, GiaBan, HinhAnh, TrangThaiSanPham, MaDanhMuc) 
              VALUES (@maSP, @tenSP, @moTa, @gia, @hinh, @trangThai, @maDM)`);

    res.status(201).json({ id: masp, name, description, price, image, categoryId });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, price, image, categoryId, status } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.Char(10), req.params.id)
      .input('tenSP', sql.NVarChar, name)
      .input('moTa', sql.NVarChar, description || null)
      .input('gia', sql.Decimal(18, 2), price)
      .input('hinh', sql.NVarChar, image || null)
      .input('trangThai', sql.NVarChar, status || 'Đang bán')
      .input('maDM', sql.Char(10), categoryId)
      .query(`UPDATE SanPham SET TenSanPham=@tenSP, MoTa=@moTa, GiaBan=@gia, HinhAnh=@hinh, 
              TrangThaiSanPham=@trangThai, MaDanhMuc=@maDM WHERE MaSanPham=@id`);

    res.json({ id: req.params.id, name, description, price, image, categoryId, status });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/products/:id (admin - soft delete)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Char(10), req.params.id)
      .query("UPDATE SanPham SET TrangThaiSanPham = N'Ngừng bán' WHERE MaSanPham = @id");
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
