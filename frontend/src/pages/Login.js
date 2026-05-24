import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const FOOD_EMOJIS = ['🍕', '🍔', '🍜', '🍣', '🌮', '🍛', '🥗', '🍰'];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Floating food emojis background */}
      {FOOD_EMOJIS.map((emoji, i) => (
        <div key={i} style={{
          ...styles.floatingEmoji,
          left: `${10 + i * 12}%`,
          animationDelay: `${i * 0.5}s`,
          fontSize: `${24 + (i % 3) * 8}px`,
          top: `${10 + (i % 4) * 20}%`
        }}>
          {emoji}
        </div>
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.15; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.25; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div style={styles.container}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftInner}>
            <div style={styles.logoWrap}>
              <span style={styles.logoIcon}>⚙️</span>
              <span style={styles.logoText}>GearFeast</span>
            </div>

            <h1 style={styles.heroTitle}>
              Food you love,<br />
              <span style={styles.heroHighlight}>delivered fast</span> 🚀
            </h1>

            <p style={styles.heroSub}>
              Discover amazing restaurants near you and get food delivered in 30 minutes or less.
            </p>

            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>100+</span>
                <span style={styles.statLabel}>Restaurants</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>30min</span>
                <span style={styles.statLabel}>Avg delivery</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>4.8⭐</span>
                <span style={styles.statLabel}>Rating</span>
              </div>
            </div>

            <div style={styles.featureList}>
              {[
                { icon: '🛵', text: 'Free delivery on all orders' },
                { icon: '⭐', text: 'Earn loyalty points every order' },
                { icon: '🔴', text: 'Real time order tracking' },
                { icon: '💳', text: 'Secure & easy payments' },
              ].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            {/* Top decoration */}
            <div style={styles.formTop}>
              <div style={styles.formTopDot} />
              <div style={{ ...styles.formTopDot, backgroundColor: '#ffd93d' }} />
              <div style={{ ...styles.formTopDot, backgroundColor: '#6bcb77' }} />
            </div>

            <div style={styles.formHeader}>
              <div style={styles.welcomeIcon}>👋</div>
              <h2 style={styles.formTitle}>Welcome back!</h2>
              <p style={styles.formSub}>Sign in to your GearFeast account</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email address</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focused === 'email' ? '#E24B4A' : '#eee',
                  boxShadow: focused === 'email' ? '0 0 0 3px rgba(226,75,74,0.1)' : 'none'
                }}>
                  <span style={styles.inputIcon}>📧</span>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  {email && <span style={styles.validIcon}>✓</span>}
                </div>
              </div>

              {/* Password */}
              <div style={styles.inputGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Password</label>
                </div>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focused === 'password' ? '#E24B4A' : '#eee',
                  boxShadow: focused === 'password' ? '0 0 0 3px rgba(226,75,74,0.1)' : 'none'
                }}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    style={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.8 : 1,
                  transform: loading ? 'scale(0.98)' : 'scale(1)'
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <span>Sign In → </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>New to GearFeast?</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Register */}
            <Link to="/register" style={styles.registerBtn}>
              Create a free account 🎉
            </Link>

            <p style={styles.terms}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff5f5 0%, #fff 50%, #fff5f5 100%)',
    fontFamily: "'Segoe UI', sans-serif",
    overflow: 'hidden',
    position: 'relative'
  },
  floatingEmoji: {
    position: 'fixed',
    animation: 'float 4s ease-in-out infinite',
    zIndex: 0,
    pointerEvents: 'none'
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #E24B4A 0%, #ff6b6b 50%, #ff8c69 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
    position: 'relative',
    overflow: 'hidden'
  },
  leftInner: { maxWidth: '440px', color: '#fff', animation: 'slideIn 0.6s ease' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
  logoIcon: { fontSize: '32px' },
  logoText: { fontSize: '28px', fontWeight: '800', color: '#fff' },
  heroTitle: { fontSize: '44px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px', color: '#fff' },
  heroHighlight: { color: '#ffd93d' },
  heroSub: { fontSize: '17px', opacity: 0.9, margin: '0 0 40px', lineHeight: '1.6' },
  statsRow: {
    display: 'flex', alignItems: 'center', gap: '24px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '20px 24px', borderRadius: '16px',
    marginBottom: '32px', backdropFilter: 'blur(8px)'
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontSize: '22px', fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' },
  statDivider: { width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.3)' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: '12px 18px', borderRadius: '12px',
    backdropFilter: 'blur(4px)'
  },
  featureIcon: { fontSize: '20px' },
  featureText: { fontSize: '15px', fontWeight: '500', color: '#fff' },
  rightPanel: {
    width: '520px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px', backgroundColor: '#fff'
  },
  formCard: {
    width: '100%', animation: 'slideIn 0.6s ease 0.2s both'
  },
  formTop: { display: 'flex', gap: '6px', marginBottom: '32px' },
  formTopDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E24B4A' },
  formHeader: { textAlign: 'center', marginBottom: '32px' },
  welcomeIcon: { fontSize: '48px', marginBottom: '12px' },
  formTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  formSub: { color: '#999', fontSize: '15px', margin: 0 },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '12px 16px', borderRadius: '12px',
    marginBottom: '20px', fontSize: '14px', fontWeight: '500',
    border: '1px solid #ffd0d0'
  },
  inputGroup: { marginBottom: '20px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { display: 'block', fontWeight: '700', color: '#333', marginBottom: '8px', fontSize: '14px' },
  inputBox: {
    display: 'flex', alignItems: 'center',
    border: '2px solid #eee', borderRadius: '14px',
    padding: '14px 16px', backgroundColor: '#fafafa',
    transition: 'all 0.2s'
  },
  inputIcon: { fontSize: '18px', marginRight: '10px', flexShrink: 0 },
  input: {
    flex: 1, border: 'none', outline: 'none',
    backgroundColor: 'transparent', fontSize: '15px',
    color: '#333', fontFamily: "'Segoe UI', sans-serif"
  },
  validIcon: { color: '#27AE60', fontWeight: '700', fontSize: '16px' },
  eyeBtn: {
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '18px', padding: 0
  },
  submitBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #E24B4A, #ff6b6b)',
    color: '#fff', border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(226,75,74,0.35)',
    transition: 'all 0.2s', marginTop: '8px',
    letterSpacing: '0.3px'
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '12px',
    margin: '28px 0 16px'
  },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#eee' },
  dividerText: { color: '#999', fontSize: '13px', whiteSpace: 'nowrap' },
  registerBtn: {
    display: 'block', width: '100%', padding: '14px',
    backgroundColor: '#fff', color: '#E24B4A',
    border: '2px solid #E24B4A', borderRadius: '14px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    textAlign: 'center', textDecoration: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s'
  },
  terms: { color: '#bbb', fontSize: '12px', textAlign: 'center', marginTop: '20px', lineHeight: '1.5' }
};

export default Login;