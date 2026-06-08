import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
];

const TableBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/bookings', {
        restaurant: id,
        date,
        time,
        guests,
        specialRequest
      });
      setBooked(true);
    } catch (err) {
      setError('Booking failed. Please try again.');
    }
    setLoading(false);
  };

  if (booked) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Table Booked!</h2>
          <p style={styles.successSub}>Your table has been reserved successfully</p>
          <div style={styles.bookingDetails}>
            <div style={styles.detailRow}>
              <span style={styles.detailIcon}>📅</span>
              <span style={styles.detailText}>{date}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailIcon}>🕐</span>
              <span style={styles.detailText}>{time}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailIcon}>👥</span>
              <span style={styles.detailText}>{guests} Guests</span>
            </div>
          </div>
          <p style={styles.confirmNote}>
            You'll receive a confirmation shortly. Status: <strong style={{ color: '#f59e0b' }}>Pending</strong>
          </p>
          <button style={styles.homeBtn} onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={styles.navTitle}>Reserve a Table</h2>
        <div />
      </nav>

      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.headerIcon}>🍽️</span>
            <div>
              <h3 style={styles.cardTitle}>Book a Table</h3>
              <p style={styles.cardSub}>Reserve your spot at the restaurant</p>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Date */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>📅 Select Date</label>
              <input
                style={styles.input}
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Time Slots */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>🕐 Select Time</label>
              <div style={styles.timeGrid}>
                {TIME_SLOTS.map(slot => (
                  <div
                    key={slot}
                    style={{
                      ...styles.timeSlot,
                      backgroundColor: time === slot ? '#E24B4A' : '#fff',
                      color: time === slot ? '#fff' : '#333',
                      border: time === slot ? 'none' : '1.5px solid #eee'
                    }}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>👥 Number of Guests</label>
              <div style={styles.guestsRow}>
                <button
                  type="button"
                  style={styles.guestBtn}
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                >−</button>
                <span style={styles.guestNum}>{guests}</span>
                <button
                  type="button"
                  style={styles.guestBtn}
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                >+</button>
                <span style={styles.guestLabel}>
                  {guests === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
            </div>

            {/* Special Request */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>💬 Special Request (optional)</label>
              <textarea
                style={styles.textarea}
                placeholder="Any special requirements? Birthday celebration, dietary restrictions..."
                value={specialRequest}
                onChange={e => setSpecialRequest(e.target.value)}
                rows={3}
              />
            </div>

            {/* Summary */}
            {date && time && (
              <div style={styles.summary}>
                <h4 style={styles.summaryTitle}>Booking Summary</h4>
                <div style={styles.summaryRow}>
                  <span>Date</span>
                  <span style={styles.summaryValue}>{date}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Time</span>
                  <span style={styles.summaryValue}>{time}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Guests</span>
                  <span style={styles.summaryValue}>{guests} people</span>
                </div>
              </div>
            )}

            <button
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1
              }}
              type="submit"
              disabled={loading || !date || !time}
            >
              {loading ? 'Booking...' : '🍽️ Confirm Reservation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  backBtn: {
    backgroundColor: 'transparent', border: 'none',
    color: '#E24B4A', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  },
  navTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  content: { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' },
  card: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
  },
  cardHeader: { display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' },
  headerIcon: { fontSize: '48px' },
  cardTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px' },
  cardSub: { color: '#999', fontSize: '14px', margin: 0 },
  errorBox: {
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '12px 16px', borderRadius: '10px',
    marginBottom: '16px', fontSize: '14px'
  },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontWeight: '700', color: '#333', marginBottom: '10px', fontSize: '14px' },
  input: {
    width: '100%', padding: '14px 16px',
    border: '2px solid #eee', borderRadius: '12px',
    fontSize: '15px', outline: 'none',
    boxSizing: 'border-box', color: '#333',
    fontFamily: "'Segoe UI', sans-serif"
  },
  timeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px'
  },
  timeSlot: {
    padding: '10px', borderRadius: '10px',
    textAlign: 'center', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
    transition: 'all 0.2s'
  },
  guestsRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  guestBtn: {
    width: '40px', height: '40px', borderRadius: '10px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', fontSize: '20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700'
  },
  guestNum: { fontSize: '24px', fontWeight: '800', color: '#1a1a1a', minWidth: '32px', textAlign: 'center' },
  guestLabel: { fontSize: '15px', color: '#666' },
  textarea: {
    width: '100%', padding: '14px 16px',
    border: '2px solid #eee', borderRadius: '12px',
    fontSize: '14px', outline: 'none', resize: 'vertical',
    boxSizing: 'border-box', color: '#333',
    fontFamily: "'Segoe UI', sans-serif"
  },
  summary: {
    backgroundColor: '#fff5f5', borderRadius: '12px',
    padding: '16px', marginBottom: '20px'
  },
  summaryTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 12px' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '14px', color: '#666', marginBottom: '8px'
  },
  summaryValue: { fontWeight: '700', color: '#1a1a1a' },
  submitBtn: {
    width: '100%', padding: '16px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(226,75,74,0.3)'
  },
  successCard: {
    maxWidth: '420px', margin: '80px auto',
    backgroundColor: '#fff', borderRadius: '24px',
    padding: '40px', boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  successIcon: { fontSize: '64px', marginBottom: '16px' },
  successTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  successSub: { color: '#999', marginBottom: '24px' },
  bookingDetails: {
    backgroundColor: '#f8f8f8', borderRadius: '16px',
    padding: '20px', marginBottom: '20px'
  },
  detailRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  detailIcon: { fontSize: '20px' },
  detailText: { fontSize: '16px', fontWeight: '600', color: '#333' },
  confirmNote: { color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' },
  homeBtn: {
    width: '100%', padding: '14px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer'
  }
};

export default TableBooking;