import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const STATUS_COLORS = {
  PENDING: { bg: '#fff8e1', color: '#f59e0b' },
  CONFIRMED: { bg: '#f0fdf4', color: '#22c55e' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' }
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/bookings/mybookings');
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h2 style={styles.navTitle}>My Bookings</h2>
        <div />
      </nav>

      <div style={styles.content}>
        <h2 style={styles.title}>Table Reservations</h2>
        <p style={styles.subtitle}>Manage your dine-in bookings</p>

        {loading ? (
          <div style={styles.loadingBox}>
            <p style={{ fontSize: '48px' }}>🍽️</p>
            <p style={{ color: '#999' }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ fontSize: '64px' }}>🍽️</p>
            <h3 style={styles.emptyTitle}>No bookings yet!</h3>
            <p style={styles.emptyText}>Book a table at your favourite restaurant</p>
            <button style={styles.bookNowBtn} onClick={() => navigate('/')}>
              Find Restaurants →
            </button>
          </div>
        ) : (
          <div style={styles.bookingsList}>
            {bookings.map(booking => {
              const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.PENDING;
              return (
                <div key={booking._id} style={styles.bookingCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <span style={styles.bookingId}>#{booking._id.slice(-6).toUpperCase()}</span>
                      <span style={styles.bookingDate}>
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {booking.status}
                    </div>
                  </div>

                  <div style={styles.restaurantRow}>
                    <span style={styles.restaurantIcon}>🍴</span>
                    <span style={styles.restaurantName}>
                      {booking.restaurant?.name || 'Restaurant'}
                    </span>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>📅</span>
                      <div>
                        <p style={styles.detailLabel}>Date</p>
                        <p style={styles.detailValue}>{booking.date}</p>
                      </div>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>🕐</span>
                      <div>
                        <p style={styles.detailLabel}>Time</p>
                        <p style={styles.detailValue}>{booking.time}</p>
                      </div>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>👥</span>
                      <div>
                        <p style={styles.detailLabel}>Guests</p>
                        <p style={styles.detailValue}>{booking.guests} people</p>
                      </div>
                    </div>
                  </div>

                  {booking.specialRequest && (
                    <div style={styles.specialRequest}>
                      <span>💬 {booking.specialRequest}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px', backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  backBtn: {
    backgroundColor: 'transparent', border: 'none',
    color: '#E24B4A', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  },
  navTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  content: { maxWidth: '700px', margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  subtitle: { color: '#999', fontSize: '15px', margin: '0 0 32px' },
  loadingBox: { textAlign: 'center', padding: '80px' },
  emptyBox: { textAlign: 'center', padding: '80px' },
  emptyTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '16px 0 8px' },
  emptyText: { color: '#999', marginBottom: '24px' },
  bookNowBtn: {
    padding: '14px 32px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer'
  },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  bookingCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '16px'
  },
  bookingId: { fontSize: '16px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '4px' },
  bookingDate: { fontSize: '12px', color: '#999' },
  statusBadge: {
    padding: '6px 14px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700'
  },
  restaurantRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '16px', padding: '10px 14px',
    backgroundColor: '#f8f8f8', borderRadius: '10px'
  },
  restaurantIcon: { fontSize: '18px' },
  restaurantName: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' },
  detailItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#f8f8f8', padding: '12px', borderRadius: '10px'
  },
  detailIcon: { fontSize: '20px', flexShrink: 0 },
  detailLabel: { fontSize: '11px', color: '#999', margin: '0 0 2px' },
  detailValue: { fontSize: '14px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  specialRequest: {
    backgroundColor: '#fff5f5', padding: '12px 16px',
    borderRadius: '10px', fontSize: '14px', color: '#666'
  }
};

export default MyBookings;