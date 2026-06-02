import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <span style={styles.logo}>⚙️ GearFeast</span>
        <div />
      </nav>

      <div style={styles.content}>
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarBig}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.name}>{user?.name}</h2>
          <p style={styles.email}>{user?.email}</p>
          <div style={styles.roleBadge}>
            {user?.role === 'customer' ? '🛒' : user?.role === 'restaurant' ? '🍴' : '🚴'}
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⭐</span>
            <p style={styles.statNum}>{user?.loyaltyPoints || 0}</p>
            <p style={styles.statLabel}>Loyalty Points</p>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📦</span>
            <p style={styles.statNum}>0</p>
            <p style={styles.statLabel}>Total Orders</p>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⭐</span>
            <p style={styles.statNum}>0</p>
            <p style={styles.statLabel}>Reviews Given</p>
          </div>
        </div>

        {/* Menu Items */}
        <div style={styles.menuCard}>
          <div style={styles.menuItem} onClick={() => navigate('/myorders')}>
            <span style={styles.menuIcon}>📦</span>
            <span style={styles.menuText}>My Orders</span>
            <span style={styles.menuArrow}>→</span>
          </div>
          <div style={styles.menuDivider} />
          <div style={styles.menuItem}>
            <span style={styles.menuIcon}>⭐</span>
            <span style={styles.menuText}>Loyalty Points — {user?.loyaltyPoints || 0} pts</span>
            <span style={styles.menuArrow}>→</span>
          </div>
          <div style={styles.menuDivider} />
          <div style={styles.menuItem}>
            <span style={styles.menuIcon}>📍</span>
            <span style={styles.menuText}>Saved Addresses</span>
            <span style={styles.menuArrow}>→</span>
          </div>
          <div style={styles.menuDivider} />
          <div style={styles.menuItem}>
            <span style={styles.menuIcon}>🔔</span>
            <span style={styles.menuText}>Notifications</span>
            <span style={styles.menuArrow}>→</span>
          </div>
          <div style={styles.menuDivider} />
          <div style={styles.menuItem}>
            <span style={styles.menuIcon}>❓</span>
            <span style={styles.menuText}>Help & Support</span>
            <span style={styles.menuArrow}>→</span>
          </div>
        </div>

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
          🚪 Logout
        </button>

        <p style={styles.version}>GearFeast v1.0 • Made with ❤️</p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 24px', backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  backBtn: {
    backgroundColor: 'transparent', border: 'none',
    color: '#E24B4A', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  },
  logo: { color: '#E24B4A', fontSize: '20px', fontWeight: '800' },
  content: { maxWidth: '480px', margin: '0 auto', padding: '24px 16px' },
  profileHeader: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '32px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px'
  },
  avatarBig: {
    width: '80px', height: '80px', borderRadius: '50%',
    backgroundColor: '#E24B4A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '36px', margin: '0 auto 16px'
  },
  name: { fontSize: '24px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 4px' },
  email: { color: '#999', fontSize: '14px', margin: '0 0 16px' },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '6px 16px', borderRadius: '20px',
    fontSize: '13px', fontWeight: '700'
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', marginBottom: '16px'
  },
  statCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    padding: '20px 12px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  statIcon: { fontSize: '24px', display: 'block', marginBottom: '8px' },
  statNum: { fontSize: '24px', fontWeight: '800', color: '#E24B4A', margin: '0 0 4px' },
  statLabel: { fontSize: '12px', color: '#999', margin: 0 },
  menuCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: '16px'
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 20px', cursor: 'pointer'
  },
  menuIcon: { fontSize: '20px', flexShrink: 0 },
  menuText: { flex: 1, fontSize: '15px', color: '#333', fontWeight: '500' },
  menuArrow: { color: '#999', fontSize: '16px' },
  menuDivider: { height: '1px', backgroundColor: '#f0f0f0', margin: '0 20px' },
  logoutBtn: {
    width: '100%', padding: '16px',
    backgroundColor: '#fff', color: '#E24B4A',
    border: '2px solid #E24B4A', borderRadius: '16px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    marginBottom: '16px'
  },
  version: { textAlign: 'center', color: '#ccc', fontSize: '13px' }
};

export default Profile;