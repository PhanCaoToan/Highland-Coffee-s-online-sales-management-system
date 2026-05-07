import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import {
  User, Mail, Phone, MapPin, Shield, Star, Save,
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, Award, Briefcase, Calendar
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileAPI.get();
      setProfile(res.data);
      if (user?.role === 'customer') {
        setFormData({
          tenKhachHang: res.data.tenKhachHang || '',
          soDienThoai: res.data.soDienThoai || '',
          diaChiKhachHang: res.data.diaChiKhachHang || '',
        });
      } else {
        setFormData({
          hoTen: res.data.hoTen || '',
          soDienThoai: res.data.soDienThoai || '',
        });
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setMessage({ type: 'error', text: 'Không thể tải thông tin tài khoản' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileAPI.update(formData);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      const updatedUser = {
        ...user,
        fullName: formData.tenKhachHang || formData.hoTen || user.fullName,
      };
      localStorage.setItem('highlands_user', JSON.stringify(updatedUser));
      // Delay reload để user thấy thông báo
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải ít nhất 6 ký tự' });
      return;
    }
    try {
      setSaving(true);
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const isCustomer = user?.role === 'customer';

  if (loading) {
    return (
      <div style={S.loadingContainer}>
        <div style={S.spinner} />
        <p style={S.loadingText}>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div style={S.pageWrapper}>
      <div style={S.container}>

        {/* ── Header Card ── */}
        <div style={S.header}>
          <div style={S.avatarLarge}>
            {(profile?.tenKhachHang || profile?.hoTen || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={S.headerName}>
              {profile?.tenKhachHang || profile?.hoTen || 'Người dùng'}
            </h1>
            <p style={S.headerEmail}>{profile?.email}</p>
            <div style={S.badges}>
              <span style={{
                ...S.roleBadge,
                background: isCustomer ? 'rgba(34,197,94,0.1)' : 'rgba(200,23,29,0.1)',
                color: isCustomer ? '#16a34a' : '#C8171D',
                border: `1px solid ${isCustomer ? 'rgba(34,197,94,0.3)' : 'rgba(200,23,29,0.25)'}`,
              }}>
                <Shield size={10} />
                {profile?.vaiTro?.toUpperCase() || user?.role?.toUpperCase()}
              </span>
              {isCustomer && profile?.diemTichLuy > 0 && (
                <span style={S.pointsBadge}>
                  <Star size={10} fill="#d97706" />
                  {profile.diemTichLuy} điểm
                </span>
              )}
              {!isCustomer && profile?.chucVu && (
                <span style={S.jobBadge}>
                  <Briefcase size={10} />
                  {profile.chucVu}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={S.tabs}>
          {[
            { id: 'info', icon: <User size={14} />, label: 'Thông Tin Cá Nhân' },
            { id: 'password', icon: <Lock size={14} />, label: 'Đổi Mật Khẩu' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...S.tab,
                ...(activeTab === tab.id ? S.tabActive : {}),
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Floating Toast ── */}
        {message && (
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 22px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 600,
            background: message.type === 'success' ? '#fff' : '#fff',
            border: `1.5px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: message.type === 'success' ? '#15803d' : '#be123c',
            boxShadow: message.type === 'success'
              ? '0 8px 32px rgba(34,197,94,0.18)'
              : '0 8px 32px rgba(239,68,68,0.18)',
            animation: 'toastSlideIn 0.4s ease',
            minWidth: '280px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            }}>
              {message.type === 'success' ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
                {message.type === 'success' ? 'Thành công!' : 'Có lỗi xảy ra'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.8 }}>
                {message.text}
              </div>
            </div>
          </div>
        )}

        {/* ── Info Tab ── */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateProfile} style={S.card}>
            <h2 style={S.cardTitle}>Thông tin tài khoản</h2>

            <div style={S.infoGrid}>
              <div style={S.infoItem}>
                <span style={S.infoLabel}>Mã tài khoản</span>
                <span style={S.infoValue}>{profile?.maTaiKhoan}</span>
              </div>
              {isCustomer ? (
                <div style={S.infoItem}>
                  <span style={S.infoLabel}>Mã khách hàng</span>
                  <span style={S.infoValue}>{profile?.maKhachHang}</span>
                </div>
              ) : (
                <>
                  <div style={S.infoItem}>
                    <span style={S.infoLabel}>Mã nhân viên</span>
                    <span style={S.infoValue}>{profile?.maNhanVien}</span>
                  </div>
                  <div style={S.infoItem}>
                    <span style={S.infoLabel}>Chức vụ</span>
                    <span style={S.infoValue}>{profile?.chucVu}</span>
                  </div>
                  <div style={S.infoItem}>
                    <span style={S.infoLabel}>Ngày vào làm</span>
                    <span style={S.infoValue}>
                      {profile?.ngayVaoLam ? new Date(profile.ngayVaoLam).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </div>
                </>
              )}
              <div style={S.infoItem}>
                <span style={S.infoLabel}>Email</span>
                <span style={S.infoValue}>{profile?.email}</span>
              </div>
              {isCustomer && (
                <div style={{ ...S.infoItem, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)' }}>
                  <span style={{ ...S.infoLabel, color: '#92400e' }}>Điểm tích lũy</span>
                  <span style={{ ...S.infoValue, color: '#b45309', fontWeight: 700 }}>
                    ⭐ {profile?.diemTichLuy || 0} điểm
                  </span>
                </div>
              )}
            </div>

            <div style={S.divider} />
            <h3 style={S.sectionTitle}>Chỉnh sửa thông tin</h3>

            <div style={S.formGrid}>
              <div style={S.field}>
                <label style={S.label}>
                  <User size={13} />
                  {isCustomer ? 'Họ và tên' : 'Họ tên nhân viên'}
                </label>
                <input
                  type="text"
                  value={isCustomer ? formData.tenKhachHang : formData.hoTen}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [isCustomer ? 'tenKhachHang' : 'hoTen']: e.target.value,
                  }))}
                  style={S.input}
                  placeholder="Nhập họ tên..."
                  required
                />
              </div>

              <div style={S.field}>
                <label style={S.label}>
                  <Phone size={13} />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData(prev => ({ ...prev, soDienThoai: e.target.value }))}
                  style={S.input}
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              {isCustomer && (
                <div style={{ ...S.field, gridColumn: '1 / -1' }}>
                  <label style={S.label}>
                    <MapPin size={13} />
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    value={formData.diaChiKhachHang}
                    onChange={(e) => setFormData(prev => ({ ...prev, diaChiKhachHang: e.target.value }))}
                    style={{ ...S.input, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Nhập địa chỉ giao hàng..."
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} style={S.submitBtn}>
              {saving ? (
                <span style={S.btnLoading}>
                  <div style={S.btnSpinner} />
                  Đang lưu...
                </span>
              ) : (
                <>
                  <Save size={15} />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Password Tab ── */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={S.card}>
            <h2 style={S.cardTitle}>Đổi mật khẩu</h2>
            <p style={S.cardDesc}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>

            <div style={S.passwordFields}>
              {[
                { key: 'currentPassword', showKey: 'current', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại...' },
                { key: 'newPassword', showKey: 'new', label: 'Mật khẩu mới', placeholder: 'Nhập mật khẩu mới (ít nhất 6 ký tự)...', minLength: 6 },
                { key: 'confirmPassword', showKey: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới...' },
              ].map(({ key, showKey, label, placeholder, minLength }) => (
                <div key={key} style={S.field}>
                  <label style={S.label}>
                    <Lock size={13} />
                    {label}
                  </label>
                  <div style={S.passwordInputWrap}>
                    <input
                      type={showPasswords[showKey] ? 'text' : 'password'}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{
                        ...S.input,
                        paddingRight: '44px',
                        borderColor: key === 'confirmPassword' && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                          ? '#fca5a5' : undefined,
                      }}
                      placeholder={placeholder}
                      required
                      minLength={minLength}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
                      style={S.eyeBtn}
                    >
                      {showPasswords[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {key === 'confirmPassword' && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p style={S.errorHint}>Mật khẩu xác nhận không khớp</p>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving || passwordData.newPassword !== passwordData.confirmPassword}
              style={{
                ...S.submitBtn,
                opacity: passwordData.newPassword !== passwordData.confirmPassword ? 0.5 : 1,
              }}
            >
              {saving ? (
                <span style={S.btnLoading}>
                  <div style={S.btnSpinner} />
                  Đang xử lý...
                </span>
              ) : (
                <>
                  <Lock size={15} />
                  Đổi Mật Khẩu
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        input::placeholder, textarea::placeholder { color: #aaa; }
        input:focus, textarea:focus {
          outline: none;
          border-color: #C8171D !important;
          box-shadow: 0 0 0 3px rgba(200,23,29,0.08);
        }
      `}</style>
    </div>
  );
}

const S = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#F2EDE6',
    paddingTop: '96px',
    paddingBottom: '60px',
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '0 20px',
    animation: 'fadeUp 0.4s ease',
  },

  // ── Header ──
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    padding: '24px 28px',
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  avatarLarge: {
    width: '68px',
    height: '68px',
    borderRadius: '18px',
    background: '#C8171D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 6px 20px rgba(200,23,29,0.28)',
    letterSpacing: '-0.01em',
  },
  headerName: {
    fontSize: '21px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: '0 0 3px',
    letterSpacing: '-0.01em',
  },
  headerEmail: {
    fontSize: '13px',
    color: '#888',
    margin: '0 0 10px',
  },
  badges: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.07em',
  },
  pointsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 700,
    background: 'rgba(217,119,6,0.1)',
    color: '#b45309',
    border: '1px solid rgba(217,119,6,0.2)',
  },
  jobBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 700,
    background: 'rgba(99,102,241,0.08)',
    color: '#6366f1',
    border: '1px solid rgba(99,102,241,0.2)',
  },

  // ── Tabs ──
  tabs: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px',
    padding: '5px',
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '11px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#888',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.01em',
  },
  tabActive: {
    background: '#C8171D',
    color: '#fff',
    boxShadow: '0 3px 10px rgba(200,23,29,0.25)',
  },

  // ── Toast ──
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '11px 15px',
    borderRadius: '11px',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
    animation: 'fadeUp 0.25s ease',
  },

  // ── Card ──
  card: {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    animation: 'fadeUp 0.3s ease',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: '0 0 20px',
    letterSpacing: '-0.01em',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#999',
    margin: '-12px 0 22px',
    lineHeight: 1.6,
  },

  // ── Info Grid ──
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '11px 13px',
    background: '#fafafa',
    borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  infoLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#1a1a1a',
  },

  divider: {
    height: '1px',
    background: 'rgba(0,0,0,0.06)',
    margin: '22px 0',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#666',
    margin: '0 0 16px',
  },

  // ── Form ──
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '11px 13px',
    borderRadius: '10px',
    background: '#fafafa',
    border: '1px solid #e5e5e5',
    color: '#1a1a1a',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  passwordFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  passwordInputWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#bbb',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorHint: {
    fontSize: '11px',
    color: '#dc2626',
    margin: 0,
  },

  // ── Submit Button ──
  submitBtn: {
    marginTop: '22px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px 24px',
    borderRadius: '12px',
    background: '#C8171D',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(200,23,29,0.28)',
    letterSpacing: '0.01em',
  },
  btnLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  btnSpinner: {
    width: '15px',
    height: '15px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },

  // ── Loading ──
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F2EDE6',
    gap: '14px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(200,23,29,0.15)',
    borderTopColor: '#C8171D',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#999',
  },
};
