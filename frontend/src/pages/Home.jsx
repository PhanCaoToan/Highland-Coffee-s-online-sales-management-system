import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Coffee, Star, MapPin, Users, ChevronDown } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productAPI.getAll({ limit: 8 }),
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

  const categoryIcons = ['☕', '🍵', '🧊', '🥐'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');

        /* ─── TOKENS ─── */
        :root {
          --cream:   #faf6f0;
          --cream-2: #f3ede3;
          --brown:   #2c1a0e;
          --brown-2: #4a2e1a;
          --gold:    #c8914a;
          --gold-l:  #e8b86a;
          --red:     #c0392b;
          --red-d:   #96281b;
          --white:   #ffffff;
          --radius:  20px;
        }

        .hp { font-family: 'Outfit', sans-serif; background: var(--cream); color: var(--brown); overflow-x: hidden; }

        /* ─── GRAIN ─── */
        .hp::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 180px; opacity: .4;
        }

        /* ─── HERO ─── */
        .hero {
          position: relative;
          min-height: 96vh;
          display: flex; align-items: center;
          background: var(--brown);
          overflow: hidden;
          padding-top: 80px;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 70% 50%, rgba(192,57,43,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 10% 80%, rgba(200,145,74,0.15) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 85% 10%, rgba(200,145,74,0.1) 0%, transparent 50%);
        }
        .hero-grid {
          position: absolute; inset: 0; opacity: .025;
          background-image:
            linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px);
          background-size: 52px 52px;
        }
        .hero-blob {
          position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
        }
        .hero-blob-1 { width: 480px; height: 480px; top: -100px; right: 5%; background: rgba(192,57,43,0.22); animation: blobDrift 14s ease-in-out infinite alternate; }
        .hero-blob-2 { width: 360px; height: 360px; bottom: -80px; left: 0; background: rgba(200,145,74,0.18); animation: blobDrift 18s ease-in-out infinite alternate-reverse; }
        @keyframes blobDrift { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,-40px) scale(1.08); } }

        .hero-inner {
          position: relative; z-index: 2;
          width: 100%; max-width: 1280px;
          margin: 0 auto;
          padding: 80px 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) { .hero-inner { grid-template-columns: 1fr; gap: 48px; padding: 60px 24px; } .hero-right { display: none; } }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 100px;
          border: 1px solid rgba(200,145,74,0.35);
          background: rgba(200,145,74,0.1);
          margin-bottom: 28px;
          animation: fadeUp .6s .2s both;
        }
        .hero-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
        .hero-badge span { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.7); letter-spacing: .02em; }

        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.2rem, 6vw, 5.5rem);
          font-weight: 700;
          line-height: 1.04;
          letter-spacing: -.02em;
          color: #fff;
          margin: 0 0 24px;
          animation: fadeUp .6s .4s both;
        }
        .hero-h1 .line-gold {
          background: linear-gradient(120deg, var(--gold) 0%, var(--gold-l) 50%, var(--gold) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-h1 .line-red {
          background: linear-gradient(120deg, #e74c3c 0%, #ff6b6b 50%, #e74c3c 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .hero-p {
          font-size: 1.05rem; font-weight: 300; line-height: 1.75;
          color: rgba(255,255,255,0.48);
          max-width: 480px;
          margin: 0 0 40px;
          animation: fadeUp .6s .6s both;
        }

        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 52px; animation: fadeUp .6s .8s both; }

        .btn-primary-hc {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 32px; border-radius: 14px;
          background: linear-gradient(135deg, var(--red) 0%, var(--red-d) 100%);
          color: #fff; font-weight: 600; font-size: .95rem;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(192,57,43,0.4);
          transition: transform .2s, box-shadow .2s;
        }
        .btn-primary-hc:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(192,57,43,0.5); }

        .btn-outline-hc {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 32px; border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.65); font-weight: 500; font-size: .95rem;
          text-decoration: none; background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          transition: border-color .2s, color .2s, background .2s;
        }
        .btn-outline-hc:hover { border-color: rgba(200,145,74,0.45); color: var(--gold-l); background: rgba(200,145,74,0.08); }

        .hero-stats { display: flex; align-items: center; gap: 32px; animation: fadeUp .6s 1s both; }
        .hero-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.12); }
        .hero-avatars { display: flex; }
        .hero-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--red), var(--gold));
          border: 2px solid var(--brown);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; margin-left: -8px;
        }
        .hero-avatar:first-child { margin-left: 0; }
        .hero-stat-text { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .hero-stars { display: flex; gap: 2px; }
        .hero-star { color: var(--gold-l); font-size: 14px; }
        .hero-rating { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 2px; }

        /* hero right */
        .hero-right { display: flex; justify-content: center; align-items: center; }
        .hero-cup-wrap { position: relative; width: 340px; height: 340px; }
        .hero-ring {
          position: absolute; inset: -32px; border-radius: 50%;
          border: 1px solid rgba(200,145,74,0.15);
          animation: spinRing 20s linear infinite;
        }
        .hero-ring-2 {
          position: absolute; inset: -56px; border-radius: 50%;
          border: 1px dashed rgba(192,57,43,0.12);
          animation: spinRing 30s linear infinite reverse;
        }
        @keyframes spinRing { to { transform: rotate(360deg); } }
        .hero-cup {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .hero-cup-emoji { font-size: 88px; animation: floatAnim 4s ease-in-out infinite; }
        @keyframes floatAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .hero-cup-brand { font-family: 'Cormorant Garamond', serif; font-size: 13px; letter-spacing: .35em; color: var(--gold-l); margin-top: 8px; }
        .hero-cup-sub { font-size: 10px; letter-spacing: .3em; color: rgba(255,255,255,0.25); margin-top: 3px; }
        .hero-badge-float {
          position: absolute;
          padding: 10px 18px; border-radius: 14px;
          background: rgba(30,15,5,0.85); backdrop-filter: blur(16px);
          border: 1px solid rgba(200,145,74,0.2);
          font-size: 13px; font-weight: 600; color: var(--gold-l);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          animation: floatAnim 4s ease-in-out infinite;
        }
        .hero-badge-float-1 { top: 0; right: -16px; animation-delay: .5s; }
        .hero-badge-float-2 { bottom: 8px; left: -20px; animation-delay: 1s; color: rgba(255,255,255,0.7); }

        .scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.2); font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }

        /* ─── STATS STRIP ─── */
        .stats-strip {
          background: var(--white);
          border-bottom: 1px solid rgba(44,26,14,0.08);
          padding: 0;
        }
        .stats-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 640px) { .stats-inner { grid-template-columns: repeat(2, 1fr); } }
        .stat-item {
          padding: 28px 32px;
          display: flex; align-items: center; gap: 16px;
          border-right: 1px solid rgba(44,26,14,0.07);
          animation: fadeUp .5s both;
        }
        .stat-item:last-child { border-right: none; }
        .stat-icon-box {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-icon-box.red { background: rgba(192,57,43,0.1); color: var(--red); }
        .stat-icon-box.gold { background: rgba(200,145,74,0.12); color: var(--gold); }
        .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 700; color: var(--brown); line-height: 1; }
        .stat-lbl { font-size: 11px; color: rgba(44,26,14,0.45); font-weight: 500; margin-top: 2px; letter-spacing: .02em; }

        /* ─── SECTION SHARED ─── */
        .section { padding: 96px 0; }
        .section-inner { max-width: 1280px; margin: 0 auto; padding: 0 48px; }
        @media (max-width: 768px) { .section { padding: 64px 0; } .section-inner { padding: 0 24px; } }

        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase;
          color: var(--red); margin-bottom: 12px;
        }
        .section-eyebrow::before, .section-eyebrow::after {
          content: ''; display: block; height: 1px; width: 24px;
          background: var(--red); opacity: .4;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700; line-height: 1.1;
          color: var(--brown); margin: 0 0 48px;
        }
        .section-title .accent-gold {
          background: linear-gradient(120deg, var(--gold) 0%, var(--gold-l) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .section-title .accent-red {
          background: linear-gradient(120deg, var(--red) 0%, #e74c3c 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ─── CATEGORIES ─── */
        .cat-section { background: var(--cream-2); }
        .cat-header { text-align: center; }
        .cat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
        }
        @media (max-width: 1024px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }

        .cat-card {
          position: relative;
          padding: 36px 28px;
          border-radius: 20px;
          background: var(--white);
          border: 1.5px solid rgba(44,26,14,0.07);
          text-decoration: none;
          display: block;
          overflow: hidden;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          animation: fadeUp .5s both;
        }
        .cat-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(192,57,43,0.04) 0%, transparent 60%);
          opacity: 0; transition: opacity .3s;
        }
        .cat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(44,26,14,0.1); border-color: rgba(192,57,43,0.2); }
        .cat-card:hover::before { opacity: 1; }
        .cat-card:hover .cat-arrow { transform: translateX(4px); color: var(--red); }

        .cat-emoji { font-size: 48px; margin-bottom: 16px; display: block; transition: transform .3s; }
        .cat-card:hover .cat-emoji { transform: scale(1.1); }
        .cat-name { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 700; color: var(--brown); margin: 0 0 6px; }
        .cat-desc { font-size: .82rem; color: rgba(44,26,14,0.45); margin: 0 0 20px; line-height: 1.55; }
        .cat-footer { display: flex; align-items: center; justify-content: space-between; }
        .cat-count-badge {
          font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px;
          background: rgba(192,57,43,0.08); color: var(--red);
        }
        .cat-arrow { color: rgba(44,26,14,0.2); transition: transform .25s, color .25s; }
        .cat-accent-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--red), var(--gold));
          transform: scaleX(0); transform-origin: left; transition: transform .3s;
        }
        .cat-card:hover .cat-accent-line { transform: scaleX(1); }

        /* ─── FEATURED ─── */
        .feat-section { background: var(--cream); }
        .feat-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 48px; }
        .feat-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: .88rem; font-weight: 600; color: var(--red);
          text-decoration: none; padding: 10px 20px;
          border: 1.5px solid rgba(192,57,43,0.2); border-radius: 100px;
          transition: background .2s, border-color .2s;
        }
        .feat-link:hover { background: rgba(192,57,43,0.06); border-color: rgba(192,57,43,0.4); }
        .feat-link svg { transition: transform .2s; }
        .feat-link:hover svg { transform: translateX(3px); }

        .feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .feat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .feat-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }

        .feat-loading { display: flex; justify-content: center; padding: 80px 0; }
        .feat-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 2px solid rgba(192,57,43,0.15);
          border-top-color: var(--red);
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .feat-mobile-cta { display: none; text-align: center; margin-top: 40px; }
        @media (max-width: 768px) { .feat-mobile-cta { display: block; } .feat-header .feat-link { display: none; } }

        /* ─── CTA BANNER ─── */
        .cta-section { background: var(--cream-2); }
        .cta-banner {
          border-radius: 28px; overflow: hidden;
          background: linear-gradient(135deg, var(--brown) 0%, #4a1e0a 50%, var(--brown) 100%);
          position: relative; padding: 72px 48px;
          text-align: center;
        }
        @media (max-width: 768px) { .cta-banner { padding: 52px 28px; } }
        .cta-bg-1 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 20% 50%, rgba(192,57,43,0.25) 0%, transparent 60%),
                      radial-gradient(ellipse 50% 70% at 80% 50%, rgba(200,145,74,0.2) 0%, transparent 55%);
        }
        .cta-inner { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; }
        .cta-emoji { font-size: 64px; display: block; margin-bottom: 24px; animation: floatAnim 4s ease-in-out infinite; }
        .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 700; color: #fff; margin: 0 0 16px; line-height: 1.15; }
        .cta-sub { font-size: .95rem; color: rgba(255,255,255,0.55); margin: 0 0 36px; line-height: 1.7; font-weight: 300; }
        .btn-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 16px 40px; border-radius: 14px;
          background: linear-gradient(135deg, var(--gold) 0%, #a06a2a 100%);
          color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none;
          box-shadow: 0 8px 28px rgba(200,145,74,0.45);
          transition: transform .2s, box-shadow .2s;
        }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(200,145,74,0.55); }
        .btn-cta svg { transition: transform .2s; }
        .btn-cta:hover svg { transform: translateX(4px); }

        /* ─── FADE UP ANIM ─── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="hp">

        {/* ══ HERO ══ */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />

          <div className="hero-inner">
            {/* Left */}
            <div>
              <div className="hero-badge">
                <div className="hero-badge-dot" />
                <span>Đặt hàng online • Giao nhanh 30 phút</span>
              </div>

              <h1 className="hero-h1">
                Hương Vị<br />
                <span className="line-gold">Cao Nguyên</span><br />
                <span className="line-red">Đích Thực</span>
              </h1>

              <p className="hero-p">
                Được chọn lọc từ những hạt cà phê tốt nhất vùng cao nguyên Việt Nam,
                mỗi ly Highlands Coffee là một hành trình khám phá hương vị tinh tế.
              </p>

              <div className="hero-ctas">
                <Link to="/menu" className="btn-primary-hc">
                  Khám Phá Menu
                  <ArrowRight size={17} />
                </Link>
                <a href="#categories" className="btn-outline-hc">
                  <Coffee size={17} />
                  Danh Mục
                </a>
              </div>

              <div className="hero-stats">
                <div>
                  <div className="hero-avatars">
                    {['☕', '🍵', '🧊', '😊'].map((e, i) => (
                      <div key={i} className="hero-avatar">{e}</div>
                    ))}
                  </div>
                  <div className="hero-stat-text">10k+ đánh giá</div>
                </div>
                <div className="hero-stat-divider" />
                <div>
                  <div className="hero-stars">
                    {[...Array(5)].map((_, i) => <span key={i} className="hero-star">★</span>)}
                  </div>
                  <div className="hero-rating">4.9 / 5 sao</div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="hero-right">
              <div className="hero-cup-wrap">
                <div className="hero-ring" />
                <div className="hero-ring-2" />
                <div className="hero-cup">
                  <div className="hero-cup-emoji">☕</div>
                  <div className="hero-cup-brand">HIGHLANDS</div>
                  <div className="hero-cup-sub">COFFEE</div>
                </div>
                <div className="hero-badge-float hero-badge-float-1">100% Arabica</div>
                <div className="hero-badge-float hero-badge-float-2">Pha tươi mỗi ly</div>
              </div>
            </div>
          </div>

          <div className="scroll-hint">
            <ChevronDown size={18} />
            <span>Cuộn xuống</span>
          </div>
        </section>

        {/* ══ STATS STRIP ══ */}
        <div className="stats-strip">
          <div className="stats-inner">
            {[
              { num: '700+', label: 'Cửa Hàng', Icon: MapPin, theme: 'red' },
              { num: '50M+', label: 'Ly Phục Vụ', Icon: Coffee, theme: 'gold' },
              { num: '10K+', label: 'Đánh Giá 5★', Icon: Star, theme: 'red' },
              { num: '15+', label: 'Năm Kinh Nghiệm', Icon: Users, theme: 'gold' },
            ].map((s, i) => (
              <div key={i} className="stat-item" style={{ animationDelay: `${i * .1}s` }}>
                <div className={`stat-icon-box ${s.theme}`}><s.Icon size={19} /></div>
                <div>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CATEGORIES ══ */}
        <section id="categories" className="section cat-section">
          <div className="section-inner">
            <div className="cat-header" style={{ marginBottom: 48 }}>
              <div className="section-eyebrow">Danh mục</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Khám Phá <span className="accent-gold">Thế Giới</span> Highlands
              </h2>
            </div>
            <div className="cat-grid">
              {categories.map((cat, i) => (
                <Link
                  to={`/menu?category=${cat.id}`}
                  key={cat.id}
                  className="cat-card"
                  style={{ animationDelay: `${i * .12}s` }}
                >
                  <span className="cat-emoji">{categoryIcons[i] || '☕'}</span>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-desc">{cat.description}</div>
                  <div className="cat-footer">
                    <span className="cat-count-badge">{cat.productCount} sản phẩm</span>
                    <ArrowRight size={16} className="cat-arrow" />
                  </div>
                  <div className="cat-accent-line" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURED PRODUCTS ══ */}
        <section className="section feat-section">
          <div className="section-inner">
            <div className="feat-header">
              <div>
                <div className="section-eyebrow">Menu nổi bật</div>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  Sản Phẩm <span className="accent-red">Yêu Thích</span>
                </h2>
              </div>
              <Link to="/menu" className="feat-link">
                Xem tất cả <ArrowRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="feat-loading"><div className="feat-spinner" /></div>
            ) : (
              <div className="feat-grid">
                {products.slice(0, 8).map((product, i) => (
                  <div
                    key={product.id}
                    style={{ animation: `fadeUp .5s ${i * .08}s both` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            <div className="feat-mobile-cta">
              <Link to="/menu" className="btn-primary-hc">
                Xem Tất Cả Menu <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ══ */}
        <section className="section cta-section">
          <div className="section-inner">
            <div className="cta-banner">
              <div className="cta-bg-1" />
              <div className="cta-inner">
                <span className="cta-emoji">☕</span>
                <h2 className="cta-title">Đặt Hàng Ngay Hôm Nay</h2>
                <p className="cta-sub">
                  Ưu đãi 10% cho đơn hàng online đầu tiên.<br />
                  Giao hàng tận nơi trong 30 phút.
                </p>
                <Link to="/menu" className="btn-cta">
                  Đặt Hàng Ngay <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
