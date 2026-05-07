import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check, Loader2 } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await productAPI.getById(id);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryConfig = {
    'DM001': { emoji: '☕', label: 'Cà Phê', bg: '#2c1a0e', accent: '#6b3a1f' },
    'DM002': { emoji: '🍵', label: 'Trà', bg: '#0e2218', accent: '#1a5c3a' },
    'DM003': { emoji: '🧊', label: 'Đá Xay', bg: '#0e1c2c', accent: '#1a4a72' },
    'DM004': { emoji: '🥐', label: 'Bánh', bg: '#2c1e0a', accent: '#7a4e1a' },
  };

  const config = categoryConfig[product?.categoryId] || { emoji: '☕', label: 'Thức Uống', bg: '#2c1a0e', accent: '#6b3a1f' };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top right, #f5e8e0 0%, #ede8e3 60%, #e8e3de 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{
            width: '36px', height: '36px', color: '#9b2c2c',
            animation: 'spin 1s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: '#9e8e82', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
            Đang tải sản phẩm...
          </p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ── Not found ──
  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top right, #f5e8e0 0%, #ede8e3 60%, #e8e3de 100%)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>😢</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e1410', marginBottom: '8px', fontFamily: "'Playfair Display', serif" }}>
          Không tìm thấy sản phẩm
        </h2>
        <Link to="/menu" style={{ color: '#9b2c2c', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
          ← Quay lại Menu
        </Link>
      </div>
    );
  }

  // ── Main ──
  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: 'radial-gradient(ellipse at top right, #f5e8e0 0%, #f0e8e0 30%, #ede8e3 60%, #e8e3de 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Back link */}
        <Link to="/menu" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#9e8e82', fontSize: '13px', textDecoration: 'none',
          fontWeight: 500, marginBottom: '36px',
          transition: 'color 0.2s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1e1410'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9e8e82'}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          Quay lại Menu
        </Link>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'start',
        }}>

          {/* ── Left: Image panel ── */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: config.bg,
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* Subtle radial glow */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 40%, ${config.accent}55 0%, transparent 65%)`,
              }} />

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}



              {/* Category badge */}
              <div style={{
                position: 'absolute', top: '20px', left: '20px', zIndex: 3,
                background: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '6px 14px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em',
              }}>
                {product.categoryName}
              </div>
            </div>
          </div>

          {/* ── Right: Info panel ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: '0 4px 32px rgba(80,40,20,0.07)',
            border: '1px solid #ede4d8',
          }}>

            {/* Category label */}
            <div style={{ marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#9b2c2c',
              }}>
                {product.categoryName}
              </span>
            </div>

            {/* Product name */}
            <h1 style={{
              fontSize: '30px', fontWeight: 700,
              color: '#1e1410', margin: '0 0 20px',
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1.25,
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: '8px',
              background: '#fdf5f0', border: '1px solid #f5ddd3',
              borderRadius: '12px', padding: '10px 20px', marginBottom: '24px',
            }}>
              <span style={{ fontSize: '26px', fontWeight: 700, color: '#9b2c2c', fontFamily: "'Playfair Display', serif" }}>
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#ede4d8', marginBottom: '20px' }} />

            {/* Description */}
            <p style={{
              fontSize: '14px', color: '#7a6a60', lineHeight: 1.8,
              marginBottom: '28px',
            }}>
              Thức uống được pha chế từ nguyên liệu chọn lọc,
              mang đến trải nghiệm hương vị đặc trưng Highlands Coffee.
              Mỗi ly là một tác phẩm nghệ thuật từ đôi tay barista lành nghề.
            </p>

            {/* Divider */}
            <div style={{ height: '1px', background: '#ede4d8', marginBottom: '24px' }} />

            {/* Quantity */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#7a6a60', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Số lượng
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    border: '1.5px solid #e2d9cc', background: '#fdf9f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#7a6a60', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2d9cc'; e.currentTarget.style.color = '#7a6a60'; }}
                >
                  <Minus style={{ width: '14px', height: '14px' }} />
                </button>

                <span style={{
                  width: '48px', textAlign: 'center',
                  fontSize: '18px', fontWeight: 700, color: '#1e1410',
                }}>
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    border: '1.5px solid #e2d9cc', background: '#fdf9f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#7a6a60', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2d9cc'; e.currentTarget.style.color = '#7a6a60'; }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              {/* Subtotal */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#b5a090', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tổng</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#9b2c2c' }}>
                  {formatPrice(product.price * quantity)}
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={added}
              style={{
                width: '100%', padding: '15px',
                borderRadius: '12px',
                background: added
                  ? 'linear-gradient(135deg, #1a6b3a 0%, #14532d 100%)'
                  : 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
                color: '#fff',
                fontSize: '15px', fontWeight: 600,
                border: 'none', cursor: added ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.3s',
                boxShadow: added
                  ? '0 4px 16px rgba(26,107,58,0.28)'
                  : '0 4px 16px rgba(139,26,26,0.28)',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => { if (!added) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseDown={(e) => { if (!added) e.currentTarget.style.transform = 'scale(0.988)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {added ? (
                <>
                  <Check style={{ width: '18px', height: '18px' }} />
                  Đã Thêm Vào Giỏ Hàng!
                </>
              ) : (
                <>
                  <ShoppingCart style={{ width: '18px', height: '18px' }} />
                  Thêm Vào Giỏ Hàng
                </>
              )}
            </button>

            {/* Trust badges */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '20px',
              marginTop: '20px', paddingTop: '20px',
              borderTop: '1px solid #ede4d8',
            }}>
              {[
                { icon: '🛡️', label: 'Chất lượng đảm bảo' },
                { icon: '⚡', label: 'Pha chế nhanh chóng' },
                { icon: '🌿', label: 'Nguyên liệu tươi' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
                  <div style={{ fontSize: '10px', color: '#b5a090', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
