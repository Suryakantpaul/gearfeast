import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&q=80',
    title: "India's #1 food delivery app",
    sub: 'Order from the best restaurants near you'
  },
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80',
    title: 'Fresh food, fast delivery',
    sub: 'Get your favourite meals in 30 minutes'
  },
  {
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1600&q=80',
    title: 'Discover amazing restaurants',
    sub: 'Explore cuisines from around the world'
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { transform: scale(1.05); }
          to { transform: scale(1); }
        }
      `}</style>

      {/* Background Slideshow */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          style={{
            ...styles.slide,
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0
          }}
        >
          <img src={slide.img} alt="" style={styles.slideImg} />
        </div>
      ))}

      {/* Dark overlay */}
      <div style={styles.overlay} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          ⚙️ <span style={styles.logoText}>GearFeast</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink}>About</span>
          <span style={styles.navLink}>Partner with us</span>
          <span style={styles.navLink}>Get the app</span>
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>
            Login
          </button>
          <button style={styles.signupBtn} onClick={() => navigate('/register')}>
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle} key={current}>
            {SLIDES[current].title}
          </h1>
          <p style={styles.heroSub}>
            {SLIDES[current].sub}
          </p>

          {/* Search Box */}
          <div style={styles.searchBox}>
            <div style={styles.locationBox}>
              <span style={styles.searchIcon}>📍</span>
              <input
                style={styles.locationInput}
                placeholder="Enter your delivery location"
              />
            </div>
            <button
              style={styles.searchBtn}
              onClick={() => navigate('/login')}
            >
              Find Food
            </button>
          </div>

          {/* Slide dots */}
          <div style={styles.dots}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
                  width: i === current ? '24px' : '8px'
                }}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statNum}>4+</span>
          <span style={styles.statLabel}>Restaurants</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statNum}>30min</span>
          <span style={styles.statLabel}>Average delivery</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statNum}>4.8⭐</span>
          <span style={styles.statLabel}>Customer rating</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statNum}>FREE</span>
          <span style={styles.statLabel}>Delivery</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    height: '100vh', position: 'relative',
    overflow: 'hidden', fontFamily: "'Segoe UI', sans-serif"
  },
  slide: {
    position: 'absolute', inset: 0,
    transition: 'opacity 1s ease',
  },
  slideImg: {
    width: '100%', height: '100%', objectFit: 'cover',
    animation: 'zoomIn 8s ease infinite alternate'
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
    zIndex: 2
  },
  navbar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 48px', zIndex: 10
  },
  navLogo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '24px', color: '#fff'
  },
  logoText: { fontWeight: '800', fontSize: '24px' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '24px' },
  navLink: {
    color: 'rgba(255,255,255,0.9)', fontSize: '15px',
    cursor: 'pointer', fontWeight: '500'
  },
  loginBtn: {
    padding: '8px 24px', backgroundColor: 'transparent',
    color: '#fff', border: '2px solid #fff',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '15px', fontWeight: '600'
  },
  signupBtn: {
    padding: '8px 24px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '15px', fontWeight: '600',
    boxShadow: '0 4px 16px rgba(226,75,74,0.4)'
  },
  hero: {
    position: 'absolute', inset: 0, zIndex: 5,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '0 24px'
  },
  heroContent: { textAlign: 'center', maxWidth: '700px' },
  heroTitle: {
    fontSize: '52px', fontWeight: '800', color: '#fff',
    margin: '0 0 16px', lineHeight: '1.2',
    animation: 'fadeIn 0.8s ease',
    textShadow: '0 2px 20px rgba(0,0,0,0.3)'
  },
  heroSub: {
    fontSize: '20px', color: 'rgba(255,255,255,0.9)',
    margin: '0 0 40px', animation: 'fadeIn 0.8s ease 0.2s both'
  },
  searchBox: {
    display: 'flex', backgroundColor: '#fff',
    borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    animation: 'fadeIn 0.8s ease 0.4s both',
    marginBottom: '32px'
  },
  locationBox: {
    display: 'flex', alignItems: 'center',
    flex: 1, padding: '16px 20px', gap: '10px'
  },
  searchIcon: { fontSize: '20px', flexShrink: 0 },
  locationInput: {
    border: 'none', outline: 'none',
    fontSize: '16px', color: '#333',
    width: '100%', fontFamily: "'Segoe UI', sans-serif"
  },
  searchBtn: {
    padding: '16px 32px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '16px', fontWeight: '700',
    transition: 'background 0.2s'
  },
  dots: { display: 'flex', justifyContent: 'center', gap: '6px' },
  dot: {
    height: '8px', borderRadius: '4px',
    cursor: 'pointer', transition: 'all 0.3s'
  },
  stats: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '48px', padding: '24px 48px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)', zIndex: 10
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statNum: { fontSize: '24px', fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  statDivider: { width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)' }
};

export default Landing;