import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, X, Coffee, Sparkles } from 'lucide-react';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(); }, [activeCategory]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.categoryId = activeCategory;
      const res = await productAPI.getAll(params);
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadFilteredProducts();
  };

  const loadFilteredProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.categoryId = activeCategory;
      if (search) params.search = search;
      const res = await productAPI.getAll(params);
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const setCategory = (catId) => {
    if (catId) setSearchParams({ category: catId });
    else setSearchParams({});
  };

  const categoryIcons = {
    'DM001': '☕',
    'DM002': '🍵',
    'DM003': '🧊',
    'DM004': '🥐'
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .menu-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-top: 80px;
          background: #faf6f1;
          color: #2c1a0e;
          position: relative;
          overflow-x: hidden;
        }

        /* ---- GRAIN OVERLAY ---- */
        .menu-page::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px;
          opacity: 0.35;
        }

        /* ---- AMBIENT BLOBS ---- */
        .blob-1 {
          position: fixed;
          top: -120px;
          left: -80px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192,57,43,0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: driftA 18s ease-in-out infinite alternate;
        }
        .blob-2 {
          position: fixed;
          bottom: 10%;
          right: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,145,74,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: driftB 22s ease-in-out infinite alternate;
        }
        @keyframes driftA { from { transform: translate(0,0) scale(1); } to { transform: translate(40px, 60px) scale(1.1); } }
        @keyframes driftB { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px, -50px) scale(1.08); } }

        /* ---- HERO ---- */
        .menu-hero {
          position: relative;
          z-index: 1;
          padding: 64px 0 48px;
          text-align: center;
        }
        .menu-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #c0392b;
          margin-bottom: 16px;
          padding: 6px 16px;
          border: 1px solid rgba(192,57,43,0.25);
          border-radius: 100px;
          background: rgba(192,57,43,0.07);
        }
        .menu-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.05;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
          color: #2c1a0e;
        }
        .menu-title em {
          font-style: italic;
          background: linear-gradient(135deg, #b8720a 0%, #e8a83a 50%, #b8720a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .menu-subtitle {
          color: rgba(44,26,14,0.5);
          font-size: 0.95rem;
          font-weight: 300;
          margin-bottom: 36px;
          letter-spacing: 0.02em;
        }

        /* ---- SEARCH ---- */
        .search-wrap {
          max-width: 480px;
          margin: 0 auto;
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 16px 52px 16px 52px;
          border-radius: 16px;
          border: 1.5px solid rgba(180,120,60,0.2);
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          color: #2c1a0e;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
          box-sizing: border-box;
          box-shadow: 0 2px 12px rgba(180,120,60,0.08);
        }
        .search-input::placeholder { color: rgba(44,26,14,0.3); }
        .search-input:focus {
          border-color: rgba(180,120,60,0.5);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(200,145,74,0.12), 0 8px 24px rgba(180,120,60,0.12);
        }
        .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: rgba(44,26,14,0.3); width:18px; height:18px; }
        .search-clear { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(44,26,14,0.3); padding: 0; display: flex; align-items: center; }
        .search-clear:hover { color: #c0392b; }

        .cat-bar {
          position: sticky;
          top: 80px;
          z-index: 30;
          background: rgba(250,246,241,0.92);
          backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid rgba(180,120,60,0.12);
          padding: 14px 0;
        }
        .cat-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 0 24px 4px;
          scrollbar-width: none;
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          border: 1.5px solid rgba(180,120,60,0.18);
          background: rgba(255,255,255,0.7);
          color: rgba(44,26,14,0.5);
          transition: all 0.25s;
          flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(180,120,60,0.06);
        }
        .cat-btn:hover {
          border-color: rgba(180,120,60,0.4);
          color: #2c1a0e;
          background: #fff;
          box-shadow: 0 2px 10px rgba(180,120,60,0.12);
        }
        .cat-btn.active {
          background: linear-gradient(135deg, #c0392b, #96281b);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 16px rgba(192,57,43,0.3);
          font-weight: 600;
        }
        .cat-count {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 100px;
          background: rgba(180,120,60,0.1);
          color: rgba(44,26,14,0.5);
          font-weight: 600;
        }
        .cat-btn.active .cat-count { background: rgba(255,255,255,0.25); color: #fff; }

        /* ---- PRODUCTS SECTION ---- */
        .products-section {
          position: relative;
          z-index: 1;
          padding: 40px 0 80px;
        }
        .products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 0 24px;
        }
        @media (min-width: 768px) { .products-header { padding: 0 48px; } }

        .products-count {
          font-size: 0.82rem;
          color: rgba(44,26,14,0.45);
          font-weight: 400;
        }
        .products-count strong { color: #2c1a0e; font-weight: 600; }
        .products-count .cat-label { color: #c0392b; }

        /* ---- DIVIDER ---- */
        .section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
          margin-bottom: 28px;
        }
        @media (min-width: 768px) { .section-divider { padding: 0 48px; } }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(to right, rgba(200,145,74,0.3), transparent); }
        .divider-icon { color: #c0392b; opacity: 0.6; font-size: 12px; }

        /* ---- GRID ---- */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 0 24px;
        }
        @media (min-width: 768px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0 48px; }
        }
        @media (min-width: 1024px) {
          .products-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .product-item {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.5s ease forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---- LOADING ---- */
        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }
        .loading-ring {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(192,57,43,0.15);
          border-top-color: #c0392b;
          animation: spin 0.8s linear infinite;
        }
        .loading-text {
          font-size: 0.82rem;
          color: rgba(44,26,14,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---- EMPTY ---- */
        .empty-wrap {
          text-align: center;
          padding: 80px 24px;
        }
        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
          display: block;
          opacity: 0.5;
        }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #2c1a0e;
        }
        .empty-sub { color: rgba(44,26,14,0.4); font-size: 0.88rem; }

        .gold-strip {
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(192,57,43,0.5), rgba(200,145,74,0.8), rgba(192,57,43,0.5), transparent);
          margin: 0;
        }
      `}</style>

      <div className="menu-page">
        <div className="blob-1" />
        <div className="blob-2" />

        {/* ── HERO ── */}
        <section className="menu-hero">
          <div className="menu-eyebrow">
            <Sparkles size={12} />
            Thực Đơn
          </div>
          <h1 className="menu-title">
            Menu <em>Highlands Coffee</em>
          </h1>
          <p className="menu-subtitle">Khám phá bộ sưu tập thức uống và đồ ăn nhẹ hảo hạng</p>

          {/* Search */}
          <div className="search-wrap">
            <form onSubmit={handleSearch}>
              <Search className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="search-input"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => { setSearch(''); loadProducts(); }}
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>
        </section>

        <div className="gold-strip" />

        {/* ── CATEGORIES ── */}
        <div className="cat-bar">
          <div className="cat-scroll">
            <button
              onClick={() => setCategory('')}
              className={`cat-btn${!activeCategory ? ' active' : ''}`}
            >
              <Coffee size={14} />
              Tất Cả
              <span className="cat-count">{products.length || ''}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`cat-btn${activeCategory === cat.id ? ' active' : ''}`}
              >
                <span>{categoryIcons[cat.id] || '☕'}</span>
                {cat.name}
                <span className="cat-count">{cat.productCount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCTS ── */}
        <section className="products-section">
          {loading ? (
            <div className="loading-wrap">
              <div className="loading-ring" />
              <span className="loading-text">Đang tải...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-wrap">
              <span className="empty-icon">🔍</span>
              <h3 className="empty-title">Không tìm thấy sản phẩm</h3>
              <p className="empty-sub">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <>
              <div className="products-header">
                <p className="products-count">
                  Hiển thị <strong>{products.length}</strong> sản phẩm
                  {activeCategory && categories.find(c => c.id === activeCategory) && (
                    <> trong <span className="cat-label">{categories.find(c => c.id === activeCategory)?.name}</span></>
                  )}
                </p>
              </div>

              <div className="section-divider">
                <div className="divider-line" />
                <span className="divider-icon">✦</span>
                <div className="divider-line" style={{ background: 'linear-gradient(to left, rgba(200,145,74,0.3), transparent)' }} />
              </div>

              <div className="products-grid">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="product-item"
                    style={{ animationDelay: `${0.05 * i}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
