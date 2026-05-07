import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseAPI } from '../../services/api';
import {
  Package, Plus, Eye, Trash2, X, Save, Loader2,
  CheckCircle, XCircle, Clock, Warehouse
} from 'lucide-react';

export default function ManageWarehouse() {
  const [receipts, setReceipts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    supplier: '',
    note: '',
    items: [{ materialId: '', unitPrice: '', quantity: '' }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [receiptRes, materialRes] = await Promise.all([
        warehouseAPI.getAll(),
        warehouseAPI.getMaterials(),
      ]);
      setReceipts(receiptRes.data);
      setMaterials(materialRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  // Form handlers
  const addItem = () => {
    setForm({ ...form, items: [...form.items, { materialId: '', unitPrice: '', quantity: '' }] });
  };

  const removeItem = (idx) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const newItems = [...form.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const openCreate = () => {
    setForm({ supplier: '', note: '', items: [{ materialId: '', unitPrice: '', quantity: '' }] });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        supplier: form.supplier,
        note: form.note || null,
        items: form.items.map(item => ({
          materialId: item.materialId,
          unitPrice: parseFloat(item.unitPrice),
          quantity: parseFloat(item.quantity),
        })),
      };
      await warehouseAPI.create(data);
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái sang "${status}"?`)) return;
    setUpdatingId(id);
    try {
      await warehouseAPI.updateStatus(id, status);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu nhập này?')) return;
    try {
      await warehouseAPI.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const calcTotal = () => {
    return form.items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      const qty = parseFloat(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  };

  const filteredReceipts = filter === 'all'
    ? receipts
    : receipts.filter(r => r.status === filter);

  const filterButtons = [
    { key: 'all', label: 'Tất cả', count: receipts.length },
    { key: 'Chờ duyệt', label: 'Chờ duyệt', count: receipts.filter(r => r.status === 'Chờ duyệt').length },
    { key: 'Đã duyệt', label: 'Đã duyệt', count: receipts.filter(r => r.status === 'Đã duyệt').length },
    { key: 'Đã nhập', label: 'Đã nhập', count: receipts.filter(r => r.status === 'Đã nhập').length },
    { key: 'Đã hủy', label: 'Đã hủy', count: receipts.filter(r => r.status === 'Đã hủy').length },
  ];

  const statusBadgeClass = (status) => ({
    'Chờ duyệt': 'wh-badge wh-badge-pending',
    'Đã duyệt': 'wh-badge wh-badge-approved',
    'Đã nhập': 'wh-badge wh-badge-imported',
    'Đã hủy': 'wh-badge wh-badge-cancelled',
  }[status] || 'wh-badge wh-badge-pending');

  const statusFlow = {
    'Chờ duyệt': ['Đã duyệt', 'Đã hủy'],
    'Đã duyệt': ['Đã nhập', 'Đã hủy'],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '2.5px solid rgba(192,57,43,0.15)',
          borderTopColor: '#c0392b',
          animation: 'whSpin .8s linear infinite',
        }} />
        <style>{`@keyframes whSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .wh-wrap { font-family: 'Outfit', sans-serif; color: #2c1a0e; }

        /* ── HEADER ── */
        .wh-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .wh-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 700; color: #2c1a0e;
          margin: 0 0 4px; letter-spacing: -.01em;
        }
        .wh-title span {
          background: linear-gradient(120deg, #c0392b, #e74c3c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .wh-subtitle { font-size: .85rem; color: rgba(44,26,14,0.4); font-weight: 400; }

        .wh-btn-create {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px; border-radius: 14px;
          font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 600;
          background: linear-gradient(135deg, #c0392b, #96281b);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(192,57,43,0.3);
          transition: all .2s;
        }
        .wh-btn-create:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(192,57,43,0.4); }

        /* ── FILTER BAR ── */
        .wh-filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 24px; scrollbar-width: none; }
        .wh-filters::-webkit-scrollbar { display: none; }
        .wh-filter-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: .82rem; font-weight: 500;
          white-space: nowrap; cursor: pointer; flex-shrink: 0;
          border: 1.5px solid rgba(44,26,14,0.1);
          background: #fff; color: rgba(44,26,14,0.5);
          transition: all .2s;
          box-shadow: 0 1px 4px rgba(44,26,14,0.05);
        }
        .wh-filter-btn:hover { border-color: rgba(192,57,43,0.3); color: #2c1a0e; }
        .wh-filter-btn.active {
          background: linear-gradient(135deg, #c0392b, #96281b);
          border-color: transparent; color: #fff;
          box-shadow: 0 4px 14px rgba(192,57,43,0.3);
        }
        .wh-filter-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 20px; height: 20px; padding: 0 5px; border-radius: 100px;
          font-size: 10px; font-weight: 700;
          background: rgba(44,26,14,0.08); color: rgba(44,26,14,0.5);
        }
        .wh-filter-btn.active .wh-filter-count { background: rgba(255,255,255,0.25); color: #fff; }

        /* ── CARD ── */
        .wh-card {
          background: #fff;
          border: 1.5px solid rgba(44,26,14,0.07);
          border-radius: 18px;
          padding: 20px 24px;
          margin-bottom: 12px;
          transition: box-shadow .2s, border-color .2s;
          animation: whFadeUp .35s both;
        }
        .wh-card:hover { box-shadow: 0 6px 24px rgba(44,26,14,0.08); border-color: rgba(44,26,14,0.12); }
        @keyframes whFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

        .wh-card-top {
          display: flex; flex-direction: column; gap: 14px;
        }
        @media (min-width: 768px) { .wh-card-top { flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; } }

        .wh-card-left { display: flex; align-items: center; gap: 14px; flex: 1; }
        .wh-card-icon {
          width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
          background: rgba(192,57,43,0.08);
          display: flex; align-items: center; justify-content: center;
          color: #c0392b;
        }
        .wh-card-id { font-weight: 700; font-size: 1rem; color: #2c1a0e; margin-bottom: 4px; }
        .wh-card-meta { display: flex; align-items: center; gap: 8px; font-size: .78rem; color: rgba(44,26,14,0.4); flex-wrap: wrap; }
        .wh-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(44,26,14,0.2); }

        .wh-card-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .wh-total { font-weight: 700; font-size: 1.05rem; color: #c8914a; white-space: nowrap; }

        /* ── BADGES ── */
        .wh-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 100px;
          font-size: 11px; font-weight: 600;
        }
        .wh-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
        .wh-badge-pending   { background: rgba(234,179,8,0.1);   color: #a16207; }
        .wh-badge-pending::before   { background: #ca8a04; }
        .wh-badge-approved  { background: rgba(59,130,246,0.1);  color: #1d4ed8; }
        .wh-badge-approved::before  { background: #3b82f6; }
        .wh-badge-imported  { background: rgba(34,197,94,0.1);   color: #15803d; }
        .wh-badge-imported::before  { background: #22c55e; }
        .wh-badge-cancelled { background: rgba(192,57,43,0.08);  color: #c0392b; }
        .wh-badge-cancelled::before { background: #c0392b; }

        /* ── BUTTONS ── */
        .wh-btn-action {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-family: 'Outfit', sans-serif; font-size: .78rem; font-weight: 600;
          border: none; cursor: pointer; transition: background .2s;
        }
        .wh-btn-approve { background: rgba(59,130,246,0.1); color: #1d4ed8; }
        .wh-btn-approve:hover { background: rgba(59,130,246,0.18); }
        .wh-btn-import  { background: rgba(34,197,94,0.1); color: #16a34a; }
        .wh-btn-import:hover { background: rgba(34,197,94,0.18); }
        .wh-btn-reject  { background: rgba(192,57,43,0.08); color: #c0392b; }
        .wh-btn-reject:hover { background: rgba(192,57,43,0.15); }
        .wh-btn-delete  { background: rgba(192,57,43,0.08); color: #c0392b; }
        .wh-btn-delete:hover { background: rgba(192,57,43,0.15); }
        .wh-btn-view    { background: rgba(44,26,14,0.05); color: rgba(44,26,14,0.5); }
        .wh-btn-view:hover   { background: rgba(44,26,14,0.1); color: #2c1a0e; }

        .wh-btn-action:disabled { opacity: .5; cursor: not-allowed; }

        @keyframes whSpin { to { transform: rotate(360deg); } }
        .wh-spin { animation: whSpin .7s linear infinite; }

        /* ── EMPTY ── */
        .wh-empty { text-align: center; padding: 64px 0; }
        .wh-empty-icon { color: rgba(44,26,14,0.12); margin: 0 auto 16px; display: block; }
        .wh-empty-text { font-size: .9rem; color: rgba(44,26,14,0.35); }

        /* ── MODAL ── */
        .wh-modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          animation: whFadeIn .2s;
        }
        @keyframes whFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .wh-modal {
          background: #fff; border-radius: 24px;
          padding: 32px; width: 95%; max-width: 680px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          animation: whSlideUp .3s;
        }
        @keyframes whSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

        .wh-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .wh-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: #2c1a0e; margin: 0; }
        .wh-modal-close {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; cursor: pointer; background: rgba(44,26,14,0.05);
          display: flex; align-items: center; justify-content: center;
          color: rgba(44,26,14,0.4); transition: all .2s;
        }
        .wh-modal-close:hover { background: rgba(192,57,43,0.1); color: #c0392b; }

        .wh-form-group { margin-bottom: 18px; }
        .wh-form-label { display: block; font-size: .82rem; font-weight: 600; color: rgba(44,26,14,0.55); margin-bottom: 8px; }
        .wh-form-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid rgba(44,26,14,0.12);
          font-family: 'Outfit', sans-serif; font-size: .875rem; color: #2c1a0e;
          background: #faf8f5; transition: all .2s;
          box-sizing: border-box;
        }
        .wh-form-input:focus { outline: none; border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
        .wh-form-input::placeholder { color: rgba(44,26,14,0.25); }

        .wh-items-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .wh-items-title { font-weight: 700; font-size: .95rem; color: #2c1a0e; }

        .wh-item-row {
          display: grid; grid-template-columns: 1fr 120px 120px 36px; gap: 10px;
          padding: 14px; border-radius: 14px; margin-bottom: 10px;
          background: #faf8f5; border: 1px solid rgba(44,26,14,0.08);
          align-items: end;
        }
        @media (max-width: 640px) { .wh-item-row { grid-template-columns: 1fr; } }

        .wh-item-remove {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; cursor: pointer; background: rgba(192,57,43,0.08);
          color: #c0392b; display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .wh-item-remove:hover { background: rgba(192,57,43,0.18); }
        .wh-item-remove:disabled { opacity: .3; cursor: not-allowed; }

        .wh-btn-add-item {
          display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px;
          border-radius: 12px; border: 1.5px dashed rgba(44,26,14,0.15);
          background: transparent; color: rgba(44,26,14,0.45);
          font-family: 'Outfit', sans-serif; font-size: .82rem; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .wh-btn-add-item:hover { border-color: #c0392b; color: #c0392b; }

        .wh-form-total {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-radius: 14px; margin-top: 18px;
          background: rgba(200,145,74,0.08); border: 1px solid rgba(200,145,74,0.15);
        }
        .wh-form-total-label { font-size: .9rem; font-weight: 600; color: rgba(44,26,14,0.6); }
        .wh-form-total-val { font-size: 1.2rem; font-weight: 800; color: #c8914a; }

        .wh-btn-submit {
          width: 100%; padding: 14px; border-radius: 14px; margin-top: 20px;
          font-family: 'Outfit', sans-serif; font-size: .9rem; font-weight: 700;
          background: linear-gradient(135deg, #c0392b, #96281b);
          color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(192,57,43,0.3);
          transition: all .2s;
        }
        .wh-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(192,57,43,0.4); }
        .wh-btn-submit:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <div className="wh-wrap">
        {/* Header */}
        <div className="wh-header">
          <div>
            <h1 className="wh-title">Nhập <span>Nguyên Vật Liệu</span></h1>
            <p className="wh-subtitle">{receipts.length} phiếu nhập trong hệ thống</p>
          </div>
          <button onClick={openCreate} className="wh-btn-create">
            <Plus size={18} />
            Tạo Phiếu Nhập
          </button>
        </div>

        {/* Filters */}
        <div className="wh-filters">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`wh-filter-btn${filter === btn.key ? ' active' : ''}`}
            >
              {btn.label}
              {btn.count > 0 && <span className="wh-filter-count">{btn.count}</span>}
            </button>
          ))}
        </div>

        {/* Receipt List */}
        <div>
          {filteredReceipts.length === 0 ? (
            <div className="wh-empty">
              <Package size={52} className="wh-empty-icon" />
              <p className="wh-empty-text">Không có phiếu nhập nào</p>
            </div>
          ) : (
            filteredReceipts.map((receipt, idx) => (
              <div key={receipt.id} className="wh-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                <div className="wh-card-top">
                  <div className="wh-card-left">
                    <div className="wh-card-icon"><Warehouse size={20} /></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className="wh-card-id">Phiếu #{receipt.id}</span>
                        <span className={statusBadgeClass(receipt.status)}>{receipt.status}</span>
                      </div>
                      <div className="wh-card-meta">
                        <span>🏭 {receipt.supplier}</span>
                        <span className="wh-meta-dot" />
                        <span>📦 {receipt.itemCount} NVL</span>
                        <span className="wh-meta-dot" />
                        <span>📅 {formatDate(receipt.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="wh-card-right">
                    <span className="wh-total">{formatPrice(receipt.totalAmount)}</span>

                    {/* Action buttons based on status */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate(`/admin/warehouse/${receipt.id}`)}
                        className="wh-btn-action wh-btn-view"
                      >
                        <Eye size={14} /> Chi tiết
                      </button>

                      {statusFlow[receipt.status]?.map(nextStatus => (
                        <button
                          key={nextStatus}
                          onClick={() => updateStatus(receipt.id, nextStatus)}
                          disabled={updatingId === receipt.id}
                          className={`wh-btn-action ${
                            nextStatus === 'Đã duyệt' ? 'wh-btn-approve' :
                            nextStatus === 'Đã nhập' ? 'wh-btn-import' :
                            'wh-btn-reject'
                          }`}
                        >
                          {updatingId === receipt.id
                            ? <Loader2 size={14} className="wh-spin" />
                            : nextStatus === 'Đã hủy' ? <XCircle size={14} /> : <CheckCircle size={14} />
                          }
                          {nextStatus}
                        </button>
                      ))}

                      {receipt.status === 'Chờ duyệt' && (
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="wh-btn-action wh-btn-delete"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="wh-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="wh-modal">
            <div className="wh-modal-header">
              <h2 className="wh-modal-title">Tạo Phiếu Nhập Kho</h2>
              <button onClick={() => setShowModal(false)} className="wh-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="wh-form-group">
                <label className="wh-form-label">Nhà cung cấp *</label>
                <input
                  type="text" required
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="wh-form-input"
                  placeholder="VD: Công ty Cà Phê Trung Nguyên"
                />
              </div>

              <div className="wh-form-group">
                <label className="wh-form-label">Ghi chú</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="wh-form-input"
                  placeholder="Ghi chú phiếu nhập (tùy chọn)"
                />
              </div>

              {/* Items */}
              <div className="wh-items-header">
                <span className="wh-items-title">Chi tiết nguyên vật liệu</span>
                <button type="button" onClick={addItem} className="wh-btn-add-item">
                  <Plus size={14} /> Thêm NVL
                </button>
              </div>

              {form.items.map((item, idx) => (
                <div key={idx} className="wh-item-row">
                  <div>
                    <label className="wh-form-label">Nguyên vật liệu</label>
                    <select
                      required
                      value={item.materialId}
                      onChange={(e) => updateItem(idx, 'materialId', e.target.value)}
                      className="wh-form-input"
                    >
                      <option value="">Chọn NVL</option>
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.unit}) - Tồn: {m.stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="wh-form-label">Đơn giá</label>
                    <input
                      type="number" required min="0" step="any"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                      className="wh-form-input"
                      placeholder="VNĐ"
                    />
                  </div>
                  <div>
                    <label className="wh-form-label">Số lượng</label>
                    <input
                      type="number" required min="0.01" step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="wh-form-input"
                      placeholder="SL"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length <= 1}
                    className="wh-item-remove"
                    style={{ alignSelf: 'end' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* Total */}
              <div className="wh-form-total">
                <span className="wh-form-total-label">Tổng giá trị nhập</span>
                <span className="wh-form-total-val">{formatPrice(calcTotal())}</span>
              </div>

              <button type="submit" disabled={submitting} className="wh-btn-submit">
                {submitting ? <Loader2 size={18} className="wh-spin" /> : (
                  <><Save size={18} /> Tạo Phiếu Nhập</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
