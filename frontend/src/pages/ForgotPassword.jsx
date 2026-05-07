import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  // Steps: 1 = enter email, 2 = verify phone, 3 = new password, 4 = success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

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

  // Step 1: Check email exists
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password/check-email', { email });
      setMaskedPhone(res.data.maskedPhone);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kiểm tra email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify phone
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password/verify-phone', { email, phone });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Xác minh thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', { email, phone, newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const StepIndicator = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '32px',
    }}>
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            background: step > s ? 'linear-gradient(135deg, #2d8a4e, #1a6b38)'
              : step === s ? 'linear-gradient(135deg, #a82020, #8b1a1a)'
              : '#f0e8e0',
            color: step >= s ? '#fff' : '#b8a89a',
            boxShadow: step === s ? '0 3px 12px rgba(139,26,26,0.25)' : 'none',
          }}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && (
            <div style={{
              width: '40px',
              height: '2px',
              borderRadius: '1px',
              background: step > s ? '#2d8a4e' : '#e8e0d6',
              transition: 'background 0.3s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = {
      1: { icon: <Mail style={{ width: 20, height: 20 }} />, title: 'Nhập Email', desc: 'Nhập email đã đăng ký tài khoản của bạn' },
      2: { icon: <ShieldCheck style={{ width: 20, height: 20 }} />, title: 'Xác Minh', desc: `Nhập số điện thoại đã đăng ký (${maskedPhone})` },
      3: { icon: <KeyRound style={{ width: 20, height: 20 }} />, title: 'Mật Khẩu Mới', desc: 'Tạo mật khẩu mới cho tài khoản của bạn' },
    };
    if (step === 4) return null;
    const t = titles[step];
    return (
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(168,32,32,0.08), rgba(139,26,26,0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          color: '#9b2c2c',
        }}>
          {t.icon}
        </div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#1e1410',
          margin: '0 0 6px',
          fontFamily: "'Inter', sans-serif",
        }}>{t.title}</h2>
        <p style={{ fontSize: '13px', color: '#9e8e82', margin: 0 }}>{t.desc}</p>
      </div>
    );
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
        padding: '48px 48px 40px',
        boxShadow: '0 8px 48px rgba(80,40,20,0.08), 0 1px 4px rgba(80,40,20,0.04)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1e1410',
            fontFamily: "'Playfair Display', serif",
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            Quên Mật Khẩu
          </h1>
          <p style={{ fontSize: '13px', color: '#9e8e82', margin: '0 0 24px' }}>
            Khôi phục tài khoản Highlands Coffee của bạn
          </p>
        </div>

        {step < 4 && <StepIndicator />}

        {renderStepTitle()}

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

        {/* ─── Step 1: Email ─── */}
        {step === 1 && (
          <form onSubmit={handleCheckEmail}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '11px', fontWeight: 700, color: '#7a6a60',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
              }}>
                <Mail style={{ width: '13px', height: '13px' }} />
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px', borderRadius: '10px',
              background: loading ? '#c0736a' : 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
              color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 16px rgba(139,26,26,0.30)',
              transition: 'opacity 0.2s, transform 0.15s',
            }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading
                ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                : 'Tiếp tục'}
            </button>
          </form>
        )}

        {/* ─── Step 2: Verify Phone ─── */}
        {step === 2 && (
          <form onSubmit={handleVerifyPhone}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '11px', fontWeight: 700, color: '#7a6a60',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
              }}>
                <Phone style={{ width: '13px', height: '13px' }} />
                Số điện thoại
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập đầy đủ số điện thoại"
                maxLength={10}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <p style={{ fontSize: '12px', color: '#b8a89a', margin: '8px 0 0', lineHeight: '1.5' }}>
                💡 Nhập số điện thoại bạn đã đăng ký khi tạo tài khoản để xác minh danh tính.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => { setStep(1); setError(''); }}
                style={{
                  flex: '0 0 auto', padding: '15px 18px', borderRadius: '10px',
                  border: '1.5px solid #e8e0d6', background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7a6a60', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e0d6'; e.currentTarget.style.color = '#7a6a60'; }}
              >
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
              </button>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '15px', borderRadius: '10px',
                background: loading ? '#c0736a' : 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
                color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(139,26,26,0.30)',
                transition: 'opacity 0.2s, transform 0.15s',
              }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {loading
                  ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  : 'Xác minh'}
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 3: New Password ─── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '11px', fontWeight: 700, color: '#7a6a60',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
              }}>
                <Lock style={{ width: '13px', height: '13px' }} />
                Mật khẩu mới
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#b0a098', padding: '4px', display: 'flex',
                  }}>
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '11px', fontWeight: 700, color: '#7a6a60',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
              }}>
                <Lock style={{ width: '13px', height: '13px' }} />
                Xác nhận mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#b0a098', padding: '4px', display: 'flex',
                  }}>
                  {showConfirm ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>
            {/* Password strength indicator */}
            {newPassword && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: newPassword.length >= i * 3
                        ? newPassword.length >= 10 ? '#2d8a4e' : newPassword.length >= 6 ? '#d4a017' : '#c0392b'
                        : '#e8e0d6',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{
                  fontSize: '11px', margin: 0,
                  color: newPassword.length >= 10 ? '#2d8a4e' : newPassword.length >= 6 ? '#d4a017' : '#c0392b',
                }}>
                  {newPassword.length >= 10 ? '🟢 Mật khẩu mạnh' : newPassword.length >= 6 ? '🟡 Mật khẩu trung bình' : '🔴 Mật khẩu yếu'}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => { setStep(2); setError(''); }}
                style={{
                  flex: '0 0 auto', padding: '15px 18px', borderRadius: '10px',
                  border: '1.5px solid #e8e0d6', background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7a6a60', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e0d6'; e.currentTarget.style.color = '#7a6a60'; }}
              >
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
              </button>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '15px', borderRadius: '10px',
                background: loading ? '#c0736a' : 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
                color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(139,26,26,0.30)',
                transition: 'opacity 0.2s, transform 0.15s',
              }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {loading
                  ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 4: Success ─── */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(45,138,78,0.1), rgba(26,107,56,0.18))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle style={{ width: '36px', height: '36px', color: '#2d8a4e' }} />
            </div>
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: '#1e1410', margin: '0 0 8px',
              fontFamily: "'Inter', sans-serif",
            }}>
              Thành công!
            </h2>
            <p style={{ fontSize: '14px', color: '#9e8e82', margin: '0 0 28px', lineHeight: '1.6' }}>
              Mật khẩu của bạn đã được đặt lại thành công.
              <br />Hãy đăng nhập với mật khẩu mới.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', width: '100%', padding: '15px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
              color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(139,26,26,0.30)',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Đăng nhập ngay →
            </Link>
          </div>
        )}

        {/* Back to login */}
        {step < 4 && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ede4da' }} />
              <span style={{ fontSize: '13px', color: '#b8a89a' }}>Đã nhớ mật khẩu?</span>
              <div style={{ flex: 1, height: '1px', background: '#ede4da' }} />
            </div>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#9b2c2c', fontWeight: 600, fontSize: '14px',
              textDecoration: 'none', letterSpacing: '0.01em',
            }}>
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>

      {/* Floating Success Toast */}
      {step === 4 && (
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
            <CheckCircle style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>
              Đặt lại mật khẩu thành công!
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.75 }}>
              Bạn có thể đăng nhập với mật khẩu mới
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

