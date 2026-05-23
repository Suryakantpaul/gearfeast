import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Review = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const getWordCountColor = () => {
    if (wordCount >= 50) return '#27AE60';
    if (wordCount >= 25) return '#F39C12';
    if (wordCount >= 10) return '#3498DB';
    return '#999';
  };

  const getWordCountLabel = () => {
    if (wordCount >= 50) return '🔥 Amazing review! Maximum points!';
    if (wordCount >= 25) return '⭐ Great review! Almost there!';
    if (wordCount >= 10) return '👍 Good start! Keep writing!';
    return '✍️ Write at least 10 words to earn points';
  };

  const getProgressWidth = () => {
    return Math.min((wordCount / 50) * 100, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/reviews/${id}`, {
        text, rating, hasMedia: false
      });
      setPointsEarned(res.data.pointsEarned);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit review. Try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successAnimation}>🎉</div>
          <h2 style={styles.successTitle}>Thank you!</h2>
          <p style={styles.successSub}>Your review has been submitted</p>
          <div style={styles.pointsBadge}>
            <span style={styles.pointsIcon}>⭐</span>
            <div>
              <p style={styles.pointsLabel}>Points Earned</p>
              <p style={styles.pointsValue}>+{pointsEarned} pts</p>
            </div>
          </div>
          <p style={styles.successNote}>
            Keep reviewing to earn more loyalty points and unlock exclusive offers!
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
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h2 style={styles.navTitle}>Rate your order</h2>
        <div />
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <span style={styles.headerIcon}>🍽️</span>
            <div>
              <h3 style={styles.cardTitle}>How was your experience?</h3>
              <p style={styles.cardSub}>Your feedback helps others make better choices</p>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div style={styles.ratingSection}>
              <p style={styles.label}>Overall Rating</p>
              <div style={styles.starsRow}>
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    style={{
                      fontSize: '40px',
                      cursor: 'pointer',
                      transition: 'transform 0.1s',
                      transform: star <= (hoveredStar || rating) ? 'scale(1.2)' : 'scale(1)',
                      filter: star <= (hoveredStar || rating) ? 'none' : 'grayscale(100%)'
                    }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p style={styles.ratingLabel}>
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Terrible'}
              </p>
            </div>

            {/* Review Text */}
            <div style={styles.reviewSection}>
              <p style={styles.label}>Write your review</p>
              <textarea
                style={styles.textarea}
                placeholder="Tell us about your experience... Was the food delicious? Was delivery fast? Were the portions good?"
                value={text}
                onChange={e => setText(e.target.value)}
                required
                rows={6}
              />

              {/* Word count progress */}
              <div style={styles.progressWrap}>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${getProgressWidth()}%`,
                    backgroundColor: getWordCountColor()
                  }} />
                </div>
                <p style={{ ...styles.progressLabel, color: getWordCountColor() }}>
                  {getWordCountLabel()} ({wordCount}/50 words)
                </p>
              </div>
            </div>

            {/* Points Preview */}
            <div style={styles.pointsPreview}>
              <div style={styles.pointsPreviewLeft}>
                <span style={{ fontSize: '24px' }}>⭐</span>
                <div>
                  <p style={styles.pointsPreviewLabel}>You'll earn approximately</p>
                  <p style={styles.pointsPreviewValue}>
                    {Math.min(wordCount >= 50 ? 60 : wordCount >= 25 ? 30 : wordCount >= 10 ? 10 : 0, 60)} points
                  </p>
                </div>
              </div>
            </div>

            <button
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review ✓'}
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
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px' },
  cardSub: { color: '#999', fontSize: '13px', margin: 0 },
  errorBox: {
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
  },
  ratingSection: { marginBottom: '24px' },
  label: { fontWeight: '700', color: '#1a1a1a', marginBottom: '12px', fontSize: '15px' },
  starsRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
  ratingLabel: { color: '#E24B4A', fontWeight: '700', fontSize: '16px', margin: 0 },
  reviewSection: { marginBottom: '20px' },
  textarea: {
    width: '100%', padding: '14px', borderRadius: '12px',
    border: '1.5px solid #eee', fontSize: '14px',
    boxSizing: 'border-box', resize: 'vertical',
    outline: 'none', lineHeight: '1.6', color: '#333',
    fontFamily: "'Segoe UI', sans-serif"
  },
  progressWrap: { marginTop: '12px' },
  progressBar: {
    height: '6px', backgroundColor: '#f0f0f0',
    borderRadius: '3px', overflow: 'hidden', marginBottom: '8px'
  },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s, background-color 0.3s' },
  progressLabel: { fontSize: '13px', fontWeight: '600', margin: 0 },
  pointsPreview: {
    backgroundColor: '#fff5f5', borderRadius: '12px',
    padding: '16px', marginBottom: '20px'
  },
  pointsPreviewLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pointsPreviewLabel: { color: '#999', fontSize: '12px', margin: '0 0 2px' },
  pointsPreviewValue: { color: '#E24B4A', fontSize: '20px', fontWeight: '800', margin: 0 },
  submitBtn: {
    width: '100%', padding: '16px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(226,75,74,0.3)'
  },
  successCard: {
    maxWidth: '400px', margin: '80px auto', backgroundColor: '#fff',
    borderRadius: '24px', padding: '40px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.1)', textAlign: 'center'
  },
  successAnimation: { fontSize: '64px', marginBottom: '16px' },
  successTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  successSub: { color: '#999', marginBottom: '24px' },
  pointsBadge: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#fff5f5', borderRadius: '16px',
    padding: '16px 24px', marginBottom: '20px', justifyContent: 'center'
  },
  pointsIcon: { fontSize: '32px' },
  pointsLabel: { color: '#999', fontSize: '13px', margin: '0 0 2px' },
  pointsValue: { color: '#E24B4A', fontSize: '24px', fontWeight: '800', margin: 0 },
  successNote: { color: '#999', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' },
  homeBtn: {
    width: '100%', padding: '14px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer'
  }
};

export default Review;