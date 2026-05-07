import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, UserPlus, Loader2, CheckCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenKhachHang: '', email: '', password: '', confirmPassword: '', soDienThoai: '', diaChi: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e8e0d6',
    fontSize: '15px',
    color: '#3a2e28',
    outline: 'none',
    background: '#f9f5f1',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#7a6a60',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  };

  const iconStyle = { width: '13px', height: '13px' };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#9b2c2c';
    e.target.style.boxShadow = '0 0 0 3px rgba(155,44,44,0.1)';
    e.target.style.background = '#fff';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#e8e0d6';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#f9f5f1';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse at top right, #f5e8e0 0%, #f0e8e0 30%, #ede8e3 60%, #e8e3de 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '48px 44px 40px',
        boxShadow: '0 8px 48px rgba(80,40,20,0.08), 0 1px 4px rgba(80,40,20,0.04)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1e1410',
            fontFamily: "'Playfair Display', serif",
            margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}>
            Đăng Ký
          </h1>
          <p style={{ fontSize: '14px', color: '#9e8e82', margin: 0 }}>
            Chào mừng bạn gia nhập Highlands Coffee
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: '#fff5f5',
            border: '1px solid #fcd5d5',
            color: '#c0392b',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Họ và tên */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              <User style={iconStyle} /> Họ và tên *
            </label>
            <input
              type="text" required
              value={form.tenKhachHang}
              onChange={(e) => setForm({ ...form, tenKhachHang: e.target.value })}
              placeholder="Nguyễn Văn A"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              <Mail style={iconStyle} /> Email *
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Mật khẩu & Xác nhận */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
          }}>
            <div>
              <label style={labelStyle}>
                <Lock style={iconStyle} /> Mật khẩu *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#b0a098',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                <Lock style={iconStyle} /> Xác nhận *
              </label>
              <input
                type={showPassword ? 'text' : 'password'} required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, #e8e0d6, transparent)',
            margin: '4px 0 24px',
          }} />

          {/* SĐT & Địa chỉ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '28px',
          }}>
            <div>
              <label style={labelStyle}>
                <Phone style={iconStyle} /> Số điện thoại
              </label>
              <input
                type="tel"
                value={form.soDienThoai}
                onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                placeholder="0901234567"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <MapPin style={iconStyle} /> Địa chỉ
              </label>
              <input
                type="text"
                value={form.diaChi}
                onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                placeholder="TP. Hồ Chí Minh"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              background: loading ? '#c0736a' : 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.02em',
              transition: 'opacity 0.2s, transform 0.15s',
              boxShadow: '0 4px 16px rgba(139,26,26,0.30)',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.988)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading
              ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              : (
                <>
                  <UserPlus style={{ width: '18px', height: '18px' }} />
                  Đăng Ký
                </>
              )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#ede4da' }} />
            <span style={{ fontSize: '13px', color: '#b8a89a' }}>Đã có tài khoản?</span>
            <div style={{ flex: 1, height: '1px', background: '#ede4da' }} />
          </div>
          <Link to="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#9b2c2c',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}>
            Đăng nhập ngay →
          </Link>
        </div>
      </div>

      {/* Floating Success Toast */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderRadius: '14px',
          background: '#fff',
          border: '1.5px solid #86efac',
          color: '#15803d',
          boxShadow: '0 8px 32px rgba(34,197,94,0.2)',
          animation: 'toastSlideIn 0.4s ease',
          minWidth: '300px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>
              Đăng ký thành công!
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.75 }}>
              Đang chuyển đến trang chủ...
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}