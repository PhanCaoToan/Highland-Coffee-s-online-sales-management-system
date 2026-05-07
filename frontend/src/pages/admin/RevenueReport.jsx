import { useState, useEffect, useRef } from 'react';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Printer, Download, Calendar, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Chuyển số thành chữ tiếng Việt ──
function numberToVietnameseWords(num) {
  if (num === 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const groups = ['', 'nghìn', 'triệu', 'tỷ'];

  function readThreeDigits(n) {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let result = '';
    if (h > 0) result += units[h] + ' trăm ';
    if (t > 1) {
      result += units[t] + ' mươi ';
      if (u === 1) result += 'mốt ';
      else if (u === 5) result += 'lăm ';
      else if (u > 0) result += units[u] + ' ';
    } else if (t === 1) {
      result += 'mười ';
      if (u === 5) result += 'lăm ';
      else if (u > 0) result += units[u] + ' ';
    } else if (t === 0 && h > 0 && u > 0) {
      result += 'lẻ ' + units[u] + ' ';
    } else if (u > 0) {
      result += units[u] + ' ';
    }
    return result.trim();
  }

  const n = Math.round(num);
  if (n < 0) return 'Âm ' + numberToVietnameseWords(-n);

  const chunks = [];
  let temp = n;
  while (temp > 0) {
    chunks.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let result = '';
  for (let i = chunks.length - 1; i >= 0; i--) {
    if (chunks[i] > 0) {
      result += readThreeDigits(chunks[i]) + ' ' + groups[i] + ' ';
    }
  }

  result = result.trim();
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
  return result;
}

export default function RevenueReport() {
  const { user } = useAuth();
  const printRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Default: today
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getReport({ fromDate, toDate });
      setReportData(res.data);
    } catch (err) {
      console.error('Load report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .rr-wrap { font-family: 'Outfit', sans-serif; color: #2c1a0e; }

        /* ── CONTROLS (hidden on print) ── */
        .rr-controls {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          margin-bottom: 28px; padding: 20px 24px;
          background: #fff; border-radius: 18px;
          border: 1.5px solid rgba(44,26,14,0.07);
        }
        .rr-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 12px;
          font-size: .82rem; font-weight: 600;
          background: rgba(44,26,14,0.04); border: 1.5px solid rgba(44,26,14,0.1);
          color: #2c1a0e; text-decoration: none; cursor: pointer;
          transition: background .2s; font-family: 'Outfit', sans-serif;
        }
        .rr-back-btn:hover { background: rgba(44,26,14,0.08); }

        .rr-date-group {
          display: flex; align-items: center; gap: 8px;
        }
        .rr-date-label {
          font-size: .78rem; font-weight: 600; color: rgba(44,26,14,0.5);
          white-space: nowrap;
        }
        .rr-date-input {
          padding: 9px 14px; border-radius: 10px;
          border: 1.5px solid rgba(44,26,14,0.12);
          font-size: .82rem; font-family: 'Outfit', sans-serif;
          color: #2c1a0e; background: #faf6f0;
          transition: border-color .2s;
          outline: none;
        }
        .rr-date-input:focus { border-color: #c0392b; }

        .rr-search-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 12px;
          font-size: .82rem; font-weight: 600;
          background: linear-gradient(135deg, #c0392b, #96281b);
          border: none; color: #fff; cursor: pointer;
          transition: all .25s; font-family: 'Outfit', sans-serif;
          box-shadow: 0 3px 12px rgba(192,57,43,0.25);
        }
        .rr-search-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(192,57,43,0.35); }
        .rr-search-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }

        .rr-print-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 12px;
          font-size: .82rem; font-weight: 600;
          background: linear-gradient(135deg, #2d8a4e, #1a6b38);
          border: none; color: #fff; cursor: pointer;
          transition: all .25s; font-family: 'Outfit', sans-serif;
          box-shadow: 0 3px 12px rgba(45,138,78,0.25);
          margin-left: auto;
        }
        .rr-print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(45,138,78,0.35); }

        /* ── REPORT PAPER ── */
        .rr-paper {
          background: #fff; border-radius: 12px;
          padding: 48px 56px; margin: 0 auto;
          max-width: 820px;
          border: 1.5px solid rgba(44,26,14,0.07);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          position: relative;
        }

        /* ── COMPANY HEADER ── */
        .rr-company-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 32px; padding-bottom: 20px;
          border-bottom: 2px solid #1a5c2e;
        }
        .rr-company-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 700;
          color: #1a5c2e; line-height: 1.2;
          max-width: 220px;
        }
        .rr-company-info {
          text-align: right; font-size: .72rem;
          color: rgba(44,26,14,0.6); line-height: 1.7;
        }
        .rr-company-info strong {
          color: #2c1a0e; font-weight: 600;
        }

        /* ── REPORT TITLE ── */
        .rr-title-section { text-align: center; margin-bottom: 28px; }
        .rr-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.55rem; font-weight: 700;
          color: #1a5c2e; text-transform: uppercase;
          letter-spacing: .02em; margin: 0 0 6px;
        }
        .rr-date-range {
          font-size: .82rem; color: rgba(44,26,14,0.5);
          font-style: italic;
        }

        /* ── TABLE ── */
        .rr-table {
          width: 100%; border-collapse: collapse;
          margin-bottom: 20px; font-size: .82rem;
        }
        .rr-table thead th {
          background: #f0ebe4; color: #2c1a0e;
          font-weight: 700; padding: 12px 14px;
          text-align: left; border-bottom: 2px solid #d4c9bb;
          font-size: .78rem; text-transform: uppercase;
          letter-spacing: .04em;
        }
        .rr-table thead th:last-child { text-align: right; }
        .rr-table tbody td {
          padding: 11px 14px; border-bottom: 1px solid rgba(44,26,14,0.06);
          color: #2c1a0e; vertical-align: middle;
        }
        .rr-table tbody tr:hover { background: #faf6f0; }
        .rr-table tbody td:last-child {
          text-align: right; font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        .rr-table tbody td:first-child { font-weight: 700; color: #1a5c2e; }

        /* ── TOTAL ROW ── */
        .rr-total-row {
          display: flex; justify-content: flex-end; align-items: center;
          gap: 16px; padding: 14px 0;
          border-top: 2px solid #1a5c2e;
          margin-bottom: 20px;
        }
        .rr-total-label {
          font-size: .88rem; font-weight: 700; color: #2c1a0e;
          text-transform: uppercase;
        }
        .rr-total-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 700;
          color: #c0392b;
        }
        .rr-total-currency {
          font-size: .82rem; font-weight: 600; color: #c0392b;
          margin-left: 4px;
        }

        /* ── AMOUNT IN WORDS ── */
        .rr-words {
          font-size: .82rem; color: rgba(44,26,14,0.6);
          margin-bottom: 40px; font-style: italic;
          padding: 10px 16px; background: #faf6f0;
          border-radius: 8px; border-left: 3px solid #1a5c2e;
        }
        .rr-words strong { color: #2c1a0e; font-style: normal; }

        /* ── SIGNATURES ── */
        .rr-signatures {
          display: flex; justify-content: space-between;
          margin-top: 48px; padding-top: 20px;
        }
        .rr-sig-block { text-align: center; min-width: 200px; }
        .rr-sig-title {
          font-size: .82rem; font-weight: 700; color: #2c1a0e;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .rr-sig-hint {
          font-size: .72rem; color: rgba(44,26,14,0.35);
          font-style: italic; margin-bottom: 60px;
        }
        .rr-sig-name {
          font-size: .85rem; font-weight: 600; color: #2c1a0e;
        }

        /* ── LOADING / EMPTY ── */
        .rr-loading {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 0; flex-direction: column; gap: 12px;
        }
        .rr-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2.5px solid rgba(26,92,46,0.15);
          border-top-color: #1a5c2e;
          animation: rrSpin .8s linear infinite;
        }
        @keyframes rrSpin { to { transform: rotate(360deg); } }
        .rr-empty {
          text-align: center; padding: 48px 0;
          font-size: .88rem; color: rgba(44,26,14,0.35);
        }

        /* row number */
        .rr-row-num {
          width: 36px; text-align: center;
          font-weight: 600; color: rgba(44,26,14,0.3);
          font-size: .75rem;
        }

        /* ── PRINT STYLES ── */
        @media print {
          body * { visibility: hidden; }
          .rr-paper, .rr-paper * { visibility: visible; }
          .rr-paper {
            position: absolute; left: 0; top: 0;
            width: 100%; padding: 24px 32px;
            border: none; box-shadow: none; border-radius: 0;
            max-width: 100%;
          }
          .rr-controls { display: none !important; }
          .rr-table { font-size: 11px; }
          .rr-table thead th { padding: 8px 10px; }
          .rr-table tbody td { padding: 7px 10px; }
          .rr-company-header { margin-bottom: 20px; padding-bottom: 14px; }
          .rr-title { font-size: 1.3rem; }
          .rr-signatures { margin-top: 36px; }
          @page { margin: 15mm 10mm; size: A4 portrait; }
        }
      `}</style>

      <div className="rr-wrap">

        {/* ── Controls Bar (hidden on print) ── */}
        <div className="rr-controls">
          <Link to="/admin" className="rr-back-btn">
            <ArrowLeft size={14} />
            Dashboard
          </Link>

          <div className="rr-date-group">
            <Calendar size={14} style={{ color: 'rgba(44,26,14,0.3)' }} />
            <span className="rr-date-label">Từ ngày</span>
            <input
              type="date"
              className="rr-date-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="rr-date-group">
            <span className="rr-date-label">Đến ngày</span>
            <input
              type="date"
              className="rr-date-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            className="rr-search-btn"
            onClick={loadReport}
            disabled={loading}
          >
            <Search size={14} />
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </button>

          {reportData && (
            <button className="rr-print-btn" onClick={handlePrint}>
              <Printer size={14} />
              In báo cáo
            </button>
          )}
        </div>

        {/* ── Report Paper ── */}
        {loading ? (
          <div className="rr-loading">
            <div className="rr-spinner" />
            <span style={{ fontSize: '.82rem', color: 'rgba(44,26,14,0.4)' }}>
              Đang tải dữ liệu báo cáo...
            </span>
          </div>
        ) : reportData ? (
          <div className="rr-paper" ref={printRef}>

            {/* Company Header */}
            <div className="rr-company-header">
              <div className="rr-company-name">
                HIGHLANDS COFFEE ONLINE
              </div>
              <div className="rr-company-info">
                <strong>Mã số thuế:</strong> 0312345678<br />
                <strong>Địa chỉ:</strong> 20 Ngô Tất Tố, Phường 19, Quận Bình Thạnh, TP.<br />
                Hồ Chí Minh<br />
                <strong>Điện thoại:</strong> 1900 6000 | <strong>Email:</strong><br />
                contact@highlands.com.vn
              </div>
            </div>

            {/* Report Title */}
            <div className="rr-title-section">
              <h1 className="rr-title">Báo Cáo Doanh Thu Theo Hóa Đơn</h1>
              <p className="rr-date-range">
                Từ ngày {formatDate(fromDate)} đến ngày {formatDate(toDate)}
              </p>
            </div>

            {/* Data Table */}
            {reportData.orders.length > 0 ? (
              <>
                <table className="rr-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Số HĐ</th>
                      <th>Ngày lập</th>
                      <th>Khách hàng</th>
                      <th>Nhân viên</th>
                      <th style={{ textAlign: 'right' }}>Trị giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.orders.map((order, idx) => (
                      <tr key={order.id}>
                        <td className="rr-row-num">{idx + 1}</td>
                        <td>{order.id}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>{order.customerName || '—'}</td>
                        <td>{order.staffName || '—'}</td>
                        <td>{formatPrice(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div className="rr-total-row">
                  <span className="rr-total-label">Tổng doanh thu trong kỳ:</span>
                  <span className="rr-total-value">
                    {formatPrice(reportData.totalRevenue)}
                    <span className="rr-total-currency">VNĐ</span>
                  </span>
                </div>

                {/* Amount in words */}
                <div className="rr-words">
                  <strong>Bằng chữ:</strong> {numberToVietnameseWords(reportData.totalRevenue)}
                </div>

              </>
            ) : (
              <div className="rr-empty">
                <FileText size={40} style={{ color: 'rgba(44,26,14,0.15)', marginBottom: 12 }} />
                <p>Không có dữ liệu trong khoảng thời gian đã chọn</p>
              </div>
            )}

            {/* Signatures */}
            <div className="rr-signatures">
              <div className="rr-sig-block">
                <div className="rr-sig-title">Người lập biểu</div>
                <div className="rr-sig-hint">(Ký và ghi rõ họ tên)</div>
                <div className="rr-sig-name">{user?.fullName || '—'}</div>
              </div>
              <div className="rr-sig-block">
                <div className="rr-sig-title">Giám đốc xác nhận</div>
                <div className="rr-sig-hint">(Đã ký và đóng dấu)</div>
                <div className="rr-sig-name">Nguyễn Cao Toàn</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
