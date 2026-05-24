import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Email may already be in use.');
    }
    setLoading(false);
  };

  const ROLES = [
    { value: 'customer', label: 'Customer', icon: '🛒', desc: 'Order food' },
    { value: 'restaurant', label: 'Restaurant', icon: '🍴', desc: 'Manage orders' },
    { value: 'courier', label: 'Courier', icon: '🚴', desc: 'Deliver food' },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
              Join thousands of<br />
              <span style={styles.heroHighlight}>happy foodies</span> 🍕
            </h1>
            <p style={styles.heroSub}>
              Create your free account and start ordering from the best restaurants near you.
            </p>
            <div style={styles.benefitsList}>
              {[
                { icon: '🎁', title: 'Welcome bonus', desc: 'Get 100 loyalty points on signup' },
                { icon: '🛵', title: 'Free delivery', desc: 'On all your orders' },
                { icon: '⭐', title: 'Earn points', desc: 'Every order & review earns points' },
                { icon: '🔴', title: 'Live tracking', desc: 'Track your order in real time' },
              ].map((b, i) => (
                <div key={i} style={styles.benefitItem}>
                  <div style={styles.benefitIcon}>{b.icon}</div>
                  <div>
                    <p style={styles.benefitTitle}>{b.title}</p>
                    <p style={styles.benefitDesc}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.welcomeIcon}>🎉</div>
              <h2 style={styles.formTitle}>Create account</h2>
              <p style={styles.formSub}>It's free and takes less than a minute</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focused === 'name' ? '#E24B4A' : '#eee',
                  boxShadow: focused === 'name' ? '0 0 0 3px rgba(226,75,74,0.1)' : 'none'
                }}>
                  <span style={styles.inputIcon}>👤</span>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  {name && <span style={styles.validIcon}>✓</span>}
                </div>
              </div>

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
                <label style={styles.label}>Password</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focused === 'password' ? '#E24B4A' : '#eee',
                  boxShadow: focused === 'password' ? '0 0 0 3px rgba(226,75,74,0.1)' : 'none'
                }}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    style={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
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
                {password && (
                  <div style={styles.strengthBar}>
                    <div style={{
                      ...styles.strengthFill,
                      width: password.length >= 8 ? '100%' : password.length >= 6 ? '60%' : '30%',
                      backgroundColor: password.length >= 8 ? '#27AE60' : password.length >= 6 ? '#F39C12' : '#E24B4A'
                    }} />
                    <span style={styles.strengthLabel}>
                      {password.length >= 8 ? '💪 Strong' : password.length >= 6 ? '👍 Good' : '⚠️ Weak'}
                    </span>
                  </div>
                )}
              </div>

              {/* Role */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>I am a...</label>
                <div style={styles.rolesGrid}>
                  {ROLES.map(r => (
                    <div
                      key={r.value}
                      style={{
                        ...styles.roleCard,
                        borderColor: role === r.value ? '#E24B4A' : '#eee',
                        backgroundColor: role === r.value ? '#fff5f5' : '#fafafa',
                        boxShadow: role === r.value ? '0 0 0 3px rgba(226,75,74,0.1)' : 'none'
                      }}
                      onClick={() => setRole(r.value)}
                    >
                      <span style={styles.roleIcon}>{r.icon}</span>
                      <p style={{
                        ...styles.roleLabel,
                        color: role === r.value ? '#E24B4A' : '#333'
                      }}>{r.label}</p>
                      <p style={styles.roleDesc}>{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.8 : 1
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account 🎉'}
              </button>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>Already have an account?</span>
              <div style={styles.dividerLine} />
            </div>

            <Link to="/login" style={styles.loginBtn}>
              Sign in instead →
            </Link>

            <p style={styles.terms}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
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
    fontFamily: "'Segoe UI', sans-serif",
    overflow: 'hidden'
  },
  container: { display: 'flex', minHeight: '100vh' },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '60px 48px'
  },
  leftInner: { maxWidth: '440px', color: '#fff', animation: 'slideIn 0.6s ease' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
  logoIcon: { fontSize: '32px' },
  logoText: { fontSize: '28px', fontWeight: '800', color: '#fff' },
  heroTitle: { fontSize: '40px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px', color: '#fff' },
  heroHighlight: { color: '#E24B4A' },
  heroSub: { fontSize: '16px', opacity: 0.8, margin: '0 0 40px', lineHeight: '1.6' },
  benefitsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  benefitItem: {
    display: 'flex', alignItems: 'center', gap: '16px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: '16px 20px', borderRadius: '14px',
    backdropFilter: 'blur(4px)'
  },
  benefitIcon: { fontSize: '28px', flexShrink: 0 },
  benefitTitle: { color: '#fff', fontWeight: '700', margin: '0 0 2px', fontSize: '15px' },
  benefitDesc: { color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '13px' },
  rightPanel: {
    width: '540px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px', backgroundColor: '#f8f8f8',
    overflowY: 'auto'
  },
  formCard: { width: '100%', animation: 'slideIn 0.6s ease 0.2s both' },
  formHeader: { textAlign: 'center', marginBottom: '28px' },
  welcomeIcon: { fontSize: '48px', marginBottom: '12px' },
  formTitle: { fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  formSub: { color: '#999', fontSize: '14px', margin: 0 },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '12px 16px', borderRadius: '12px',
    marginBottom: '20px', fontSize: '14px', fontWeight: '500',
    border: '1px solid #ffd0d0'
  },
  inputGroup: { marginBottom: '18px' },
  label: { display: 'block', fontWeight: '700', color: '#333', marginBottom: '8px', fontSize: '14px' },
  inputBox: {
    display: 'flex', alignItems: 'center',
    border: '2px solid #eee', borderRadius: '14px',
    padding: '13px 16px', backgroundColor: '#fff',
    transition: 'all 0.2s'
  },
  inputIcon: { fontSize: '18px', marginRight: '10px', flexShrink: 0 },
  input: {
    flex: 1, border: 'none', outline: 'none',
    backgroundColor: 'transparent', fontSize: '15px',
    color: '#333', fontFamily: "'Segoe UI', sans-serif"
  },
  validIcon: { color: '#27AE60', fontWeight: '700', fontSize: '16px' },
  eyeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 },
  strengthBar: { marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  strengthFill: { height: '4px', borderRadius: '2px', transition: 'all 0.3s', flex: 1 },
  strengthLabel: { fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  rolesGrid: { display: 'flex', gap: '10px' },
  roleCard: {
    flex: 1, padding: '14px 10px', borderRadius: '14px',
    border: '2px solid #eee', cursor: 'pointer',
    textAlign: 'center', transition: 'all 0.2s'
  },
  roleIcon: { fontSize: '28px', display: 'block', marginBottom: '6px' },
  roleLabel: { fontSize: '13px', fontWeight: '700', margin: '0 0 2px' },
  roleDesc: { fontSize: '11px', color: '#999', margin: 0 },
  submitBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #E24B4A, #ff6b6b)',
    color: '#fff', border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(226,75,74,0.35)',
    transition: 'all 0.2s', marginTop: '8px'
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '12px',
    margin: '24px 0 16px'
  },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#eee' },
  dividerText: { color: '#999', fontSize: '12px', whiteSpace: 'nowrap' },
  loginBtn: {
    display: 'block', width: '100%', padding: '14px',
    backgroundColor: '#fff', color: '#E24B4A',
    border: '2px solid #E24B4A', borderRadius: '14px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    textAlign: 'center', textDecoration: 'none',
    boxSizing: 'border-box'
  },
  terms: { color: '#bbb', fontSize: '12px', textAlign: 'center', marginTop: '16px', lineHeight: '1.5' }
};

export default Register;