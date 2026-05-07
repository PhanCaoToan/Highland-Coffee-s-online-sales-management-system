import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { warehouseAPI } from '../../services/api';
import {
  ArrowLeft, Warehouse, Package, Printer, CheckCircle, XCircle,
  Loader2, Clock, FileText, Building2
} from 'lucide-react';

export default function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const res = await warehouseAPI.getById(id);
      setReceipt(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái sang "${status}"?`)) return;
    setUpdating(true);
    try {
      await warehouseAPI.updateStatus(id, status);
      await loadReceipt();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => window.print();

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price);

  const formatDate = (date) =>
    new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  const totalAmount = receipt?.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

  const statusFlow = {
    'Chờ duyệt': ['Đã duyệt', 'Đã hủy'],
    'Đã duyệt': ['Đã nhập', 'Đã hủy'],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <Loader2 size={36} style={{ color: '#c0392b', animation: 'wdSpin .8s linear infinite' }} />
        <style>{`@keyframes wdSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Package size={48} style={{ color: 'rgba(44,26,14,0.2)', marginBottom: 16 }} />
        <p style={{ color: 'rgba(44,26,14,0.4)' }}>Không tìm thấy phiếu nhập</p>
        <button onClick={() => navigate('/admin/warehouse')} style={{
          marginTop: 16, padding: '10px 20px', borderRadius: 12,
          border: 'none', cursor: 'pointer', background: 'rgba(192,57,43,0.1)', color: '#c0392b',
          fontFamily: 'Outfit, sans-serif', fontWeight: 600
        }}>← Quay lại</button>
      </div>
    );
  }

  const statusColors = {
    'Chờ duyệt': { color: '#a16207', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)' },
    'Đã duyệt': { color: '#1d4ed8', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
    'Đã nhập': { color: '#15803d', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
    'Đã hủy': { color: '#c0392b', bg: 'rgba(192,57,43,0.08)', border: 'rgba(192,57,43,0.25)' },
  };
  const sc = statusColors[receipt.status] || statusColors['Chờ duyệt'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .wd-wrap {
          font-family: 'Outfit', sans-serif; color: #2c1a0e;
          max-width: 900px; margin: 0 auto;
        }

        /* Back */
        .wd-back {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px;
          font-size: .85rem; font-weight: 600;
          color: #c0392b; background: rgba(192,57,43,0.08);
          border: 1.5px solid rgba(192,57,43,0.15);
          cursor: pointer; transition: all .2s;
          text-decoration: none; margin-bottom: 24px;
          font-family: 'Outfit', sans-serif;
        }
        .wd-back:hover { background: rgba(192,57,43,0.15); transform: translateX(-2px); }

        /* Header */
        .wd-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 28px;
        }
        .wd-title { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; font-weight: 700; color: #2c1a0e; margin: 0 0 4px; }
        .wd-title-sub { font-size: .82rem; color: rgba(44,26,14,0.4); }
        .wd-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .wd-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px;
          font-size: .82rem; font-weight: 700;
        }
        .wd-btn-print {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 12px;
          font-size: .85rem; font-weight: 600;
          background: linear-gradient(135deg, #c0392b, #96281b);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(192,57,43,0.3);
          transition: all .2s; font-family: 'Outfit', sans-serif;
        }
        .wd-btn-print:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(192,57,43,0.4); }

        /* Cards */
        .wd-card {
          background: #fff; border-radius: 18px;
          border: 1.5px solid rgba(44,26,14,0.07);
          padding: 24px; margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(44,26,14,0.04);
        }
        .wd-card-title {
          display: flex; align-items: center; gap: 8px;
          font-size: .95rem; font-weight: 700; color: #2c1a0e;
          margin: 0 0 18px;
        }
        .wd-card-title svg { color: #c0392b; }

        .wd-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
        }
        @media (max-width: 600px) { .wd-info-grid { grid-template-columns: 1fr; } }
        .wd-info-label {
          font-size: 11px; font-weight: 600; color: rgba(44,26,14,0.4);
          text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;
        }
        .wd-info-value {
          font-size: .9rem; font-weight: 600; color: #2c1a0e;
          display: flex; align-items: center; gap: 8px;
        }
        .wd-info-value svg { color: rgba(192,57,43,0.4); flex-shrink: 0; }

        /* Table */
        .wd-table { width: 100%; border-collapse: collapse; }
        .wd-table th {
          text-align: left; padding: 12px 16px;
          font-size: .75rem; font-weight: 700; color: rgba(44,26,14,0.4);
          text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 2px solid rgba(44,26,14,0.08);
          background: #faf8f5;
        }
        .wd-table th:first-child { border-radius: 10px 0 0 0; }
        .wd-table th:last-child { border-radius: 0 10px 0 0; text-align: right; }
        .wd-table td {
          padding: 14px 16px; font-size: .875rem;
          border-bottom: 1px solid rgba(44,26,14,0.06);
        }
        .wd-table td:last-child { text-align: right; }
        .wd-table tr:hover td { background: rgba(44,26,14,0.02); }
        .wd-nvl-name { font-weight: 600; color: #2c1a0e; }
        .wd-nvl-unit { font-size: .75rem; color: rgba(44,26,14,0.4); margin-left: 6px; }
        .wd-price { font-weight: 600; color: #c8914a; }
        .wd-qty { font-weight: 700; color: #2c1a0e; }

        .wd-total-row {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 12px; padding: 18px 16px 0; margin-top: 4px;
          border-top: 2px solid rgba(192,57,43,0.15);
        }
        .wd-total-label { font-size: .95rem; font-weight: 600; color: rgba(44,26,14,0.5); }
        .wd-total-val { font-size: 1.4rem; font-weight: 800; color: #c0392b; }

        /* Action panel */
        .wd-actions {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .wd-btn-status {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 22px; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: .85rem; font-weight: 600;
          border: none; cursor: pointer; transition: all .2s;
        }
        .wd-btn-status:disabled { opacity: .5; cursor: not-allowed; }
        .wd-btn-approve { background: rgba(59,130,246,0.1); color: #1d4ed8; }
        .wd-btn-approve:hover:not(:disabled) { background: rgba(59,130,246,0.2); }
        .wd-btn-import { background: rgba(34,197,94,0.1); color: #16a34a; }
        .wd-btn-import:hover:not(:disabled) { background: rgba(34,197,94,0.2); }
        .wd-btn-reject { background: rgba(192,57,43,0.08); color: #c0392b; }
        .wd-btn-reject:hover:not(:disabled) { background: rgba(192,57,43,0.15); }

        @keyframes wdSpin { to { transform: rotate(360deg); } }
        .wd-spin { animation: wdSpin .7s linear infinite; }

        /* ── PRINT: Chứng từ nhập kho ── */
        @media print {
          /* Hide everything except print content */
          body > div > nav, body > div > header,
          [class*="navbar"], [class*="Navbar"],
          .admin-sidebar, .admin-mob-toggle, .admin-overlay,
          .wd-back, .wd-btn-print, .wd-actions, .wd-status-badge { display: none !important; }

          .admin-wrap { padding-top: 0 !important; display: block !important; background: #fff !important; }
          .admin-main { padding: 0 !important; }

          .wd-wrap { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }

          /* Print header branding */
          .wd-header { display: block !important; text-align: center; border-bottom: none; margin-bottom: 0; }
          .wd-header::before {
            content: "HIGHLANDS COFFEE";
            display: block; font-size: 1.6rem; font-weight: 800;
            color: #c0392b; letter-spacing: 3px; margin-bottom: 2px;
          }
          .wd-header::after {
            content: "PHIẾU NHẬP KHO HÀNG HÓA";
            display: block; font-size: 1.1rem; font-weight: 700;
            color: #333; margin-bottom: 16px; padding-bottom: 12px;
            border-bottom: 2px solid #c0392b;
          }
          .wd-header-right { display: none !important; }
          .wd-title { font-size: 0 !important; }
          .wd-title-sub { font-size: 0 !important; }

          /* Info card */
          .wd-card {
            border: 1px solid #ddd !important; box-shadow: none !important;
            border-radius: 8px !important; padding: 16px !important;
            margin-bottom: 16px !important; break-inside: avoid;
          }

          /* Table */
          .wd-table th { background: #f5f5f5 !important; font-size: .7rem !important; }
          .wd-table td { font-size: .8rem !important; padding: 10px 12px !important; }

          /* Total emphasis */
          .wd-total-row { border-top: 2px solid #c0392b !important; }
          .wd-total-val { color: #c0392b !important; }

          /* Signatures section */
          .wd-wrap::after {
            content: "";
            display: block;
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px dashed #ccc;
          }

          /* Signature boxes using pseudo elements on last card */
          .wd-card:last-child::after {
            content: "BÊN GIAO HÀNG                                              QUẢN LÝ CỬA HÀNG\\A\\A(Ký và ghi rõ họ tên)                                     (Ký và ghi rõ họ tên)";
            white-space: pre-wrap;
            display: block;
            margin-top: 48px;
            font-size: .85rem;
            color: #333;
            text-align: center;
            line-height: 2;
          }

          body { background: #fff !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="wd-wrap">
        {/* Back */}
        <button className="wd-back" onClick={() => navigate('/admin/warehouse')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>

        {/* Header */}
        <div className="wd-header">
          <div>
            <h1 className="wd-title">Phiếu Nhập #{receipt.id}</h1>
            <p className="wd-title-sub">Ngày tạo: {formatDate(receipt.date)}</p>
          </div>
          <div className="wd-header-right">
            <span className="wd-status-badge" style={{
              color: sc.color, background: sc.bg,
              border: `1.5px solid ${sc.border}`,
            }}>
              {receipt.status === 'Đã nhập' ? <CheckCircle size={14} /> :
               receipt.status === 'Đã hủy' ? <XCircle size={14} /> :
               <Clock size={14} />}
              {receipt.status}
            </span>
            <button className="wd-btn-print" onClick={handlePrint}>
              <Printer size={16} /> In Phiếu Nhập
            </button>
          </div>
        </div>

        {/* Receipt Info */}
        <div className="wd-card">
          <h3 className="wd-card-title"><Building2 size={18} /> Thông Tin Phiếu Nhập</h3>
          <div className="wd-info-grid">
            <div>
              <div className="wd-info-label">Mã phiếu</div>
              <div className="wd-info-value">
                <FileText size={14} /> {receipt.id}
              </div>
            </div>
            <div>
              <div className="wd-info-label">Ngày nhập</div>
              <div className="wd-info-value">
                <Clock size={14} /> {formatDate(receipt.date)}
              </div>
            </div>
            <div>
              <div className="wd-info-label">Nhà cung cấp</div>
              <div className="wd-info-value">
                <Building2 size={14} /> {receipt.supplier}
              </div>
            </div>
            <div>
              <div className="wd-info-label">Trạng thái</div>
              <div className="wd-info-value" style={{ color: sc.color }}>
                <CheckCircle size={14} /> {receipt.status}
              </div>
            </div>
            {receipt.note && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="wd-info-label">Ghi chú</div>
                <div className="wd-info-value">
                  <FileText size={14} /> {receipt.note}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Materials Table */}
        <div className="wd-card">
          <h3 className="wd-card-title">
            <Package size={18} /> Chi Tiết Nguyên Vật Liệu
            <span style={{ fontSize: '.82rem', fontWeight: 500, color: 'rgba(44,26,14,0.4)', marginLeft: 4 }}>
              ({receipt.items?.length || 0})
            </span>
          </h3>

          <table className="wd-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã NVL</th>
                <th>Tên nguyên vật liệu</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items?.map((item, idx) => (
                <tr key={item.materialId}>
                  <td>{idx + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'rgba(44,26,14,0.5)' }}>
                    {item.materialId}
                  </td>
                  <td>
                    <span className="wd-nvl-name">{item.materialName}</span>
                    <span className="wd-nvl-unit">({item.unit})</span>
                  </td>
                  <td className="wd-qty">{new Intl.NumberFormat('vi-VN').format(item.quantity)}</td>
                  <td className="wd-price">{formatPrice(item.unitPrice)} ₫</td>
                  <td className="wd-price" style={{ fontWeight: 700 }}>
                    {formatPrice(item.totalPrice)} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="wd-total-row">
            <span className="wd-total-label">TỔNG GIÁ TRỊ NHẬP:</span>
            <span className="wd-total-val">{formatPrice(totalAmount)} VNĐ</span>
          </div>
        </div>

        {/* Status Actions */}
        {statusFlow[receipt.status] && (
          <div className="wd-card">
            <h3 className="wd-card-title"><FileText size={18} /> Cập Nhật Trạng Thái</h3>
            <div className="wd-actions">
              {statusFlow[receipt.status].map(nextStatus => (
                <button
                  key={nextStatus}
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating}
                  className={`wd-btn-status ${
                    nextStatus === 'Đã duyệt' ? 'wd-btn-approve' :
                    nextStatus === 'Đã nhập' ? 'wd-btn-import' :
                    'wd-btn-reject'
                  }`}
                >
                  {updating
                    ? <Loader2 size={16} className="wd-spin" />
                    : nextStatus === 'Đã hủy' ? <XCircle size={16} /> : <CheckCircle size={16} />
                  }
                  {nextStatus}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
