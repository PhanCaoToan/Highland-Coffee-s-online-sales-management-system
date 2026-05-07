const express = require('express');
const { getPool, sql } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// GET /api/warehouse/materials - Lấy danh sách nguyên vật liệu
// =====================================================
router.get('/materials', auth, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT MaNguyenVatLieu, TenNguyenVatLieu, SoLuongTon, DonViTinh
      FROM NguyenVatLieu
      ORDER BY TenNguyenVatLieu
    `);

    const materials = result.recordset.map(m => ({
      id: m.MaNguyenVatLieu?.trim(),
      name: m.TenNguyenVatLieu,
      stock: m.SoLuongTon,
      unit: m.DonViTinh,
    }));

    res.json(materials);
  } catch (err) {
    console.error('Get materials error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// =====================================================
// GET /api/warehouse - Lấy danh sách phiếu nhập kho
// =====================================================
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT pnk.MaPhieuNhapKho, pnk.NgayNhap, pnk.TenNhaCungCap,
             pnk.TrangThaiNhap, pnk.GhiChuPhieuNhap,
             ISNULL((SELECT SUM(ct.ThanhTien) FROM ChiTietPhieuNhap ct 
                     WHERE ct.MaPhieuNhapKho = pnk.MaPhieuNhapKho), 0) AS TongTien,
             (SELECT COUNT(*) FROM ChiTietPhieuNhap ct 
              WHERE ct.MaPhieuNhapKho = pnk.MaPhieuNhapKho) AS SoNguyenVatLieu
      FROM PhieuNhapKho pnk
      ORDER BY pnk.NgayNhap DESC
    `);

    const receipts = result.recordset.map(r => ({
      id: r.MaPhieuNhapKho?.trim(),
      date: r.NgayNhap,
      supplier: r.TenNhaCungCap,
      status: r.TrangThaiNhap?.trim(),
      note: r.GhiChuPhieuNhap,
      totalAmount: r.TongTien,
      itemCount: r.SoNguyenVatLieu,
    }));

    res.json(receipts);
  } catch (err) {
    console.error('Get warehouse receipts error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// =====================================================
// GET /api/warehouse/:id - Chi tiết phiếu nhập
// =====================================================
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();

    const receiptResult = await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .query(`
        SELECT pnk.*
        FROM PhieuNhapKho pnk
        WHERE pnk.MaPhieuNhapKho = @maPN
      `);

    if (receiptResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    const r = receiptResult.recordset[0];

    const detailResult = await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .query(`
        SELECT ct.MaPhieuNhapKho, ct.MaNguyenVatLieu, ct.DonGiaNhap, 
               ct.SoLuongNhap, ct.ThanhTien,
               nvl.TenNguyenVatLieu, nvl.DonViTinh
        FROM ChiTietPhieuNhap ct
        LEFT JOIN NguyenVatLieu nvl ON ct.MaNguyenVatLieu = nvl.MaNguyenVatLieu
        WHERE ct.MaPhieuNhapKho = @maPN
      `);

    res.json({
      id: r.MaPhieuNhapKho?.trim(),
      date: r.NgayNhap,
      supplier: r.TenNhaCungCap,
      status: r.TrangThaiNhap?.trim(),
      note: r.GhiChuPhieuNhap,
      items: detailResult.recordset.map(i => ({
        materialId: i.MaNguyenVatLieu?.trim(),
        materialName: i.TenNguyenVatLieu,
        unit: i.DonViTinh,
        unitPrice: i.DonGiaNhap,
        quantity: i.SoLuongNhap,
        totalPrice: i.ThanhTien,
      })),
    });
  } catch (err) {
    console.error('Get receipt detail error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// =====================================================
// POST /api/warehouse - Tạo phiếu nhập kho mới (kèm chi tiết)
// =====================================================
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { supplier, note, items } = req.body;

    if (!supplier || !items || items.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin nhà cung cấp hoặc chi tiết nguyên vật liệu' });
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Tạo mã phiếu nhập
      const countResult = await transaction.request()
        .query("SELECT ISNULL(MAX(CAST(SUBSTRING(MaPhieuNhapKho, 3, 8) AS INT)), 0) + 1 AS nextId FROM PhieuNhapKho");
      const nextId = countResult.recordset[0].nextId;
      const maPN = 'PN' + String(nextId).padStart(8, '0');

      // Tạo phiếu nhập
      await transaction.request()
        .input('maPN', sql.Char(10), maPN)
        .input('supplier', sql.NVarChar(100), supplier)
        .input('note', sql.NVarChar(255), note || null)
        .query(`INSERT INTO PhieuNhapKho (MaPhieuNhapKho, NgayNhap, TenNhaCungCap, TrangThaiNhap, GhiChuPhieuNhap)
                VALUES (@maPN, GETDATE(), @supplier, N'Chờ duyệt', @note)`);

      // Thêm chi tiết phiếu nhập
      for (const item of items) {
        const thanhTien = item.unitPrice * item.quantity;
        await transaction.request()
          .input('maPN', sql.Char(10), maPN)
          .input('maNVL', sql.Char(10), item.materialId)
          .input('donGia', sql.Decimal(18, 2), item.unitPrice)
          .input('soLuong', sql.Float, item.quantity)
          .input('thanhTien', sql.Decimal(18, 2), thanhTien)
          .query(`INSERT INTO ChiTietPhieuNhap (MaPhieuNhapKho, MaNguyenVatLieu, DonGiaNhap, SoLuongNhap, ThanhTien)
                  VALUES (@maPN, @maNVL, @donGia, @soLuong, @thanhTien)`);
      }

      await transaction.commit();

      res.status(201).json({
        id: maPN,
        status: 'Chờ duyệt',
        message: 'Tạo phiếu nhập kho thành công',
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Create receipt error:', err);
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
});

// =====================================================
// PUT /api/warehouse/:id/status - Cập nhật trạng thái phiếu nhập
// =====================================================
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Chờ duyệt', 'Đã duyệt', 'Đã nhập', 'Đã hủy'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const pool = await getPool();

    // Kiểm tra phiếu tồn tại
    const checkResult = await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .query('SELECT TrangThaiNhap FROM PhieuNhapKho WHERE MaPhieuNhapKho = @maPN');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    const currentStatus = checkResult.recordset[0].TrangThaiNhap?.trim();

    // Validate flow
    const validFlow = {
      'Chờ duyệt': ['Đã duyệt', 'Đã hủy'],
      'Đã duyệt': ['Đã nhập', 'Đã hủy'],
      'Đã nhập': [],
      'Đã hủy': [],
    };

    if (!validFlow[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ "${currentStatus}" sang "${status}"`,
      });
    }

    await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .input('status', sql.NVarChar(50), status)
      .query('UPDATE PhieuNhapKho SET TrangThaiNhap = @status WHERE MaPhieuNhapKho = @maPN');

    res.json({
      id: req.params.id?.trim(),
      status,
      message: `Cập nhật trạng thái thành "${status}"`,
    });
  } catch (err) {
    console.error('Update receipt status error:', err);
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
});

// =====================================================
// DELETE /api/warehouse/:id - Xóa phiếu nhập (chỉ khi Chờ duyệt)
// =====================================================
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();

    const checkResult = await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .query('SELECT TrangThaiNhap FROM PhieuNhapKho WHERE MaPhieuNhapKho = @maPN');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    const status = checkResult.recordset[0].TrangThaiNhap?.trim();
    if (status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Chỉ có thể xóa phiếu nhập đang chờ duyệt' });
    }

    // Xóa chi tiết trước, rồi phiếu nhập
    await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .query('DELETE FROM ChiTietPhieuNhap WHERE MaPhieuNhapKho = @maPN');

    await pool.request()
      .input('maPN', sql.Char(10), req.params.id)
      .query('DELETE FROM PhieuNhapKho WHERE MaPhieuNhapKho = @maPN');

    res.json({ message: 'Xóa phiếu nhập thành công' });
  } catch (err) {
    console.error('Delete receipt error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
