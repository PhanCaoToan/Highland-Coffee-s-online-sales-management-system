import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(form.email, form.password);
      const role = result?.role || result?.user?.role;
      if (role === 'admin' || role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
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
        maxWidth: '520px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '52px 48px 44px',
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
            Đăng Nhập
          </h1>
          <p style={{ fontSize: '14px', color: '#9e8e82', margin: 0 }}>
            Chào mừng bạn quay trở lại Highlands Coffee
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
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#7a6a60',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              <Mail style={{ width: '13px', height: '13px' }} />
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#9b2c2c';
                e.target.style.boxShadow = '0 0 0 3px rgba(155,44,44,0.1)';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e0d6';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#f9f5f1';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#7a6a60',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              <Lock style={{ width: '13px', height: '13px' }} />
              Mật Khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '48px' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#9b2c2c';
                  e.target.style.boxShadow = '0 0 0 3px rgba(155,44,44,0.1)';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e0d6';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#f9f5f1';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
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
                  ? <EyeOff style={{ width: '18px', height: '18px' }} />
                  : <Eye style={{ width: '18px', height: '18px' }} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link to="/forgot-password" style={{
              fontSize: '13px',
              color: '#9b2c2c',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit — đỏ đậm như hình 2 */}
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
                  <LogIn style={{ width: '18px', height: '18px' }} />
                  Đăng Nhập
                </>
              )}
          </button>
        </form>

        {/* Register */}
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#ede4da' }} />
            <span style={{ fontSize: '13px', color: '#b8a89a' }}>Chưa có tài khoản?</span>
            <div style={{ flex: 1, height: '1px', background: '#ede4da' }} />
          </div>
          <Link to="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#9b2c2c',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}>
            Đăng ký ngay →
          </Link>
        </div>

        {/* Demo box — giữ cấu trúc, ẩn đi */}
        <div style={{ marginTop: '16px' }} />
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
