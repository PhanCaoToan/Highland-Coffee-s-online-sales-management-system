import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Plus, Edit3, Trash2, X, Save, Package, Loader2, Search, Coffee } from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', image: '', categoryId: '', stock: '100',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', image: '', categoryId: categories[0]?.id || '', stock: '100' });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      image: product.image || '',
      categoryId: String(product.categoryId),
      stock: String(product.stock),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form, price: parseFloat(form.price), categoryId: form.categoryId };
      delete data.stock;
      if (editing) {
        await productAPI.update(editing.id, data);
      } else {
        await productAPI.create(data);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await productAPI.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-[#B22830] animate-spin" />
        <p className="text-[#C9A96E] font-medium animate-pulse">Đang tải dữ liệu thực đơn...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#C9A96E' }}>
            Quản Lý <span className="text-[#B22830]">Sản Phẩm</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-1 w-12 bg-[#B22830] rounded-full"></span>
            <p className="text-[#C9A96E]/80 font-semibold uppercase text-xs tracking-widest">
              Hiện có {products.length} sản phẩm trong thực đơn
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-[#B22830] hover:bg-[#8b1a1f] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Table Container - ĐÃ SỬA PHẦN NÀY */}
      <div className="bg-[#1a1a1a] border border-[#C9A96E]/20 rounded-2xl overflow-hidden shadow-2xl p-2">
        {/* p-2 giúp tạo khoảng cách nhỏ giữa bảng và viền bo, tránh bị đè lên phần tử bên trong */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            {/* border-separate giúp các dòng có khoảng cách và không dính vào mép viền */}
            <thead>
              <tr className="text-[#C9A96E] text-[10px] uppercase font-bold tracking-[0.2em]">
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Giá niêm yết</th>
                <th className="p-4">Tồn kho</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A96E]/5">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={product.image || '/images/placeholder.jpg'}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#C9A96E]/20 group-hover:border-[#C9A96E]/50 transition-all"
                          onError={(e) => { e.target.src = `https://placehold.co/100x100/2D1215/C9A96E?text=☕`; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white group-hover:text-[#C9A96E] transition-colors truncate">{product.name}</p>
                        <p className="text-white/30 text-[11px] line-clamp-1 italic">{product.description || 'Chưa có mô tả'}</p>
                      </div>
                    </div>
                  </td>
                  {/* ... (các <td> còn lại giữ nguyên giống code trước) */}
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-lg bg-[#C9A96E]/10 text-[#C9A96E] text-[10px] font-bold border border-[#C9A96E]/20">
                      {product.categoryName}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-bold text-sm">{formatPrice(product.price)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                      <span className="text-xs text-white/70">{product.stock}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Modern Design */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/70 animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1a1a1a] border border-[#C9A96E]/30 rounded-[2.5rem] p-10 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B22830] flex items-center justify-center shadow-lg">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {editing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-9 h-9 text-white/40" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[#C9A96E] text-xs font-bold uppercase tracking-widest ml-1">Tên sản phẩm</label>
                  <input
                    type="text" required
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition-all"
                    placeholder="VD: Phin Sữa Đá"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#C9A96E] text-xs font-bold uppercase tracking-widest ml-1">Mô tả ngắn</label>
                  <textarea
                    rows={3}
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#C9A96E] focus:outline-none resize-none transition-all"
                    placeholder="Hương vị đậm đà..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[#C9A96E] text-xs font-bold uppercase tracking-widest ml-1">Giá bán (VNĐ)</label>
                    <input
                      type="number" required min="0"
                      value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#C9A96E] focus:outline-none transition-all"
                      placeholder="39000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#C9A96E] text-xs font-bold uppercase tracking-widest ml-1">Tồn kho</label>
                    <input
                      type="number" min="0"
                      value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#C9A96E] focus:outline-none transition-all"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[#C9A96E] text-xs font-bold uppercase tracking-widest ml-1">Danh mục thực đơn</label>
                  <select
                    required
                    value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#C9A96E] focus:outline-none appearance-none transition-all"
                  >
                    <option value="" className="bg-[#1a1a1a]">Chọn loại đồ uống/thức ăn</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[#C9A96E] text-xs font-bold uppercase tracking-widest ml-1">Link ảnh sản phẩm</label>
                  <input
                    type="text"
                    value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#C9A96E] focus:outline-none transition-all"
                    placeholder="https://highlands.com/hinh-anh.jpg"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full bg-[#B22830] hover:bg-[#8b1a1f] text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5" />
                    {editing ? 'Lưu thay đổi' : 'Xác nhận thêm sản phẩm'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}