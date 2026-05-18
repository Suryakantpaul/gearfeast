import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Review = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(`/reviews/${id}`, {
        text,
        rating,
        hasMedia: false
      });
      setPointsEarned(res.data.pointsEarned);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit review. Try again.');
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Review Submitted!</h2>
          <p style={styles.successText}>
            You earned <strong style={{ color: '#E24B4A' }}>{pointsEarned} loyalty points!</strong>
          </p>
          <button style={styles.button} onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Leave a Review</h2>
        <p style={styles.subtitle}>
          Write a detailed review and earn loyalty points! ⭐
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.ratingRow}>
            <label style={styles.label}>Rating</label>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: '32px',
                    cursor: 'pointer',
                    opacity: star <= rating ? 1 : 0.3
                  }}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>

          <label style={styles.label}>Your Review</label>
          <textarea
            style={styles.textarea}
            placeholder="Describe your experience in detail... The more you write, the more points you earn!"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={6}
          />

          <div style={styles.hint}>
            <p style={styles.hintText}>
              💡 Word count: {text.trim() === '' ? 0 : text.trim().split(/\s+/).length}
            </p>
            <p style={styles.hintText}>
              {text.trim().split(/\s+/).length >= 50
                ? '🔥 Maximum points!'
                : text.trim().split(/\s+/).length >= 25
                ? '⭐ Great review!'
                : text.trim().split(/\s+/).length >= 10
                ? '👍 Keep going!'
                : '✍️ Write more to earn more points!'}
            </p>
          </div>

          <button style={styles.button} type="submit">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '500px'
  },
  title: { fontSize: '24px', color: '#333', margin: '0 0 8px' },
  subtitle: { color: '#666', marginBottom: '24px', fontSize: '14px' },
  error: { color: 'red', marginBottom: '12px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' },
  ratingRow: { marginBottom: '20px' },
  stars: { display: 'flex', gap: '4px' },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    marginBottom: '12px'
  },
  hint: {
    backgroundColor: '#fff5f5',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  hintText: { margin: '4px 0', fontSize: '13px', color: '#666' },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  successIcon: { fontSize: '64px', textAlign: 'center', marginBottom: '16px' },
  successTitle: { textAlign: 'center', fontSize: '24px', color: '#333', marginBottom: '8px' },
  successText: { textAlign: 'center', color: '#666', marginBottom: '24px' }
};

export default Review;
