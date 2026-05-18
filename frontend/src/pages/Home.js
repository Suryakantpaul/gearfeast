import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNearbyRestaurants();
  }, []);

  const fetchNearbyRestaurants = async () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await axiosInstance.get(
          `/restaurants/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=10000`
        );
        setRestaurants(response.data);
        setLoading(false);
      }, async () => {
        const response = await axiosInstance.get(
          `/restaurants/nearby?latitude=23.5204&longitude=87.3119&maxDistance=10000`
        );
        setRestaurants(response.data);
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to fetch restaurants');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🍽️ GearFeast</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name}! 👋</span>
          <span style={styles.points}>⭐ {user?.loyaltyPoints || 0} points</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>What are you craving today?</h2>
        <p style={styles.heroSubtitle}>Discover restaurants near you</p>
      </div>

      <div style={styles.content}>
        {loading && <p style={styles.loading}>Finding restaurants near you...</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.grid}>
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              style={styles.card}
              onClick={() => navigate(`/restaurant/${restaurant._id}`)}
            >
              <div style={styles.cardImage}>
                🍴
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{restaurant.name}</h3>
                <p style={styles.cardCuisine}>{restaurant.cuisine}</p>
                <p style={styles.cardDesc}>{restaurant.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.rating}>⭐ {restaurant.rating || 'New'}</span>
                  <span style={styles.delivery}>{restaurant.deliveryTime}</span>
                  <span style={styles.distance}>
                    {restaurant.distance
                      ? `${(restaurant.distance / 1000).toFixed(1)} km`
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {restaurants.length === 0 && !loading && (
          <p style={styles.empty}>No restaurants found nearby.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  logo: { color: '#E24B4A', fontSize: '24px', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { fontSize: '14px', color: '#333' },
  points: { fontSize: '14px', color: '#E24B4A', fontWeight: 'bold' },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  hero: {
    textAlign: 'center',
    padding: '48px 32px',
    backgroundColor: '#E24B4A'
  },
  heroTitle: { color: '#fff', fontSize: '32px', margin: 0 },
  heroSubtitle: { color: '#fff', opacity: 0.9, marginTop: '8px' },
  content: { padding: '32px' },
  loading: { textAlign: 'center', color: '#666' },
  error: { textAlign: 'center', color: 'red' },
  empty: { textAlign: 'center', color: '#666' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'transform 0.2s'
  },
  cardImage: {
    height: '120px',
    backgroundColor: '#ffeaa7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px'
  },
  cardBody: { padding: '16px' },
  cardTitle: { margin: '0 0 4px', fontSize: '18px', color: '#333' },
  cardCuisine: { color: '#E24B4A', fontSize: '13px', margin: '0 0 8px' },
  cardDesc: { color: '#666', fontSize: '13px', margin: '0 0 12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between' },
  rating: { fontSize: '13px', color: '#333' },
  delivery: { fontSize: '13px', color: '#666' },
  distance: { fontSize: '13px', color: '#666' }
};

export default Home;