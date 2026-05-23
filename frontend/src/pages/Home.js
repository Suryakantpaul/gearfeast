import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const CUISINE_IMAGES = {
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  Mughlai: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  Italian: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'
};

const BANNERS = [
  { title: '50% OFF', sub: 'on your first order', color: '#E24B4A', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { title: 'Free Delivery', sub: 'on orders above ₹299', color: '#1a1a2e', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' },
  { title: 'New Arrivals', sub: 'Try something different today', color: '#0f3460', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80' },
];

const CATEGORIES = [
  { name: 'Biryani', emoji: '🍚', color: '#FF6B35', bg: '#fff3ee' },
  { name: 'Pizza', emoji: '🍕', color: '#E74C3C', bg: '#fef0f0' },
  { name: 'Chinese', emoji: '🥢', color: '#F39C12', bg: '#fffbf0' },
  { name: 'Indian', emoji: '🍛', color: '#27AE60', bg: '#f0fdf4' },
  { name: 'Desserts', emoji: '🍰', color: '#9B59B6', bg: '#fdf4ff' },
  { name: 'Drinks', emoji: '🥤', color: '#3498DB', bg: '#f0f8ff' },
  { name: 'Burgers', emoji: '🍔', color: '#E67E22', bg: '#fff8f0' },
  { name: 'Rolls', emoji: '🌯', color: '#16A085', bg: '#f0fafa' },
];

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState(0);
  const bannerRef = useRef();

  useEffect(() => {
    fetchNearbyRestaurants();
    const interval = setInterval(() => {
      setBanner(prev => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchNearbyRestaurants = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await axiosInstance.get(
          `/restaurants/nearby?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&maxDistance=10000`
        );
        setRestaurants(res.data);
        setLoading(false);
      }, async () => {
        const res = await axiosInstance.get(
          `/restaurants/nearby?latitude=23.5204&longitude=87.3119&maxDistance=10000`
        );
        setRestaurants(res.data);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* Sticky Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>⚙️ GearFeast</span>
          <div style={styles.locationPill}>
            📍 Durgapur, WB
            <span style={styles.locationArrow}>▾</span>
          </div>
        </div>
        <div style={styles.searchWrap}>
          <span style={styles.searchIconNav}>🔍</span>
          <input
            style={styles.searchInputNav}
            placeholder="Search for restaurants, cuisines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.navRight}>
          <span style={styles.points}>⭐ {user?.loyaltyPoints || 0} pts</span>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Banner Carousel */}
        <div style={styles.bannerWrap}>
          <div style={{
            ...styles.banner,
            backgroundImage: `linear-gradient(to right, ${BANNERS[banner].color}ee, transparent), url(${BANNERS[banner].img})`,
          }}>
            <div style={styles.bannerText}>
              <h2 style={styles.bannerTitle}>{BANNERS[banner].title}</h2>
              <p style={styles.bannerSub}>{BANNERS[banner].sub}</p>
              <button style={styles.bannerBtn}>Order Now</button>
            </div>
          </div>
          <div style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <div key={i} style={{
                ...styles.dot,
                backgroundColor: i === banner ? '#E24B4A' : '#ddd',
                width: i === banner ? '20px' : '8px'
              }} onClick={() => setBanner(i)} />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>What's on your mind?</h3>
          <div style={styles.catRow}>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={styles.catItem} onClick={() => setSearch(cat.name)}>
                <div style={{ ...styles.catIcon, backgroundColor: cat.bg }}>
                  <span style={{ fontSize: '30px' }}>{cat.emoji}</span>
                </div>
                <p style={{ ...styles.catName, color: cat.color }}>{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Offers Strip */}
        <div style={styles.offersStrip}>
          <div style={styles.offerChip}>🔥 Trending</div>
          <div style={styles.offerChip}>⚡ Fast Delivery</div>
          <div style={styles.offerChip}>🎉 New on GearFeast</div>
          <div style={styles.offerChip}>💚 Pure Veg</div>
          <div style={styles.offerChip}>⭐ Top Rated</div>
        </div>

        {/* Restaurants */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              {search ? `Results for "${search}"` : `Restaurants near you`}
            </h3>
            <span style={styles.count}>{filtered.length} places</span>
          </div>

          {loading ? (
            <div style={styles.loadingGrid}>
              {[1,2,3,4].map(i => (
                <div key={i} style={styles.skeleton}>
                  <div style={styles.skeletonImg} />
                  <div style={styles.skeletonBody}>
                    <div style={styles.skeletonLine} />
                    <div style={{ ...styles.skeletonLine, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map(r => (
                <div key={r._id} style={styles.card}
                  onClick={() => navigate(`/restaurant/${r._id}`)}>
                  <div style={styles.cardImgWrap}>
                    <img
                      src={CUISINE_IMAGES[r.cuisine] || CUISINE_IMAGES.default}
                      alt={r.name}
                      style={styles.cardImg}
                    />
                    <div style={styles.cardOverlay} />
                    {r.distance && (
                      <div style={styles.distTag}>
                        📍 {(r.distance/1000).toFixed(1)} km
                      </div>
                    )}
                    <div style={styles.openTag}>
                      {r.isOpen ? '● Open' : '● Closed'}
                    </div>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardRow}>
                      <h3 style={styles.cardName}>{r.name}</h3>
                      <div style={styles.ratingPill}>⭐ {r.rating || '4.2'}</div>
                    </div>
                    <p style={styles.cardCuisine}>{r.cuisine} · {r.deliveryTime}</p>
                    <p style={styles.cardDesc}>{r.description}</p>
                    <div style={styles.cardBottom}>
                      <span style={styles.freeDelivery}>🛵 Free delivery</span>
                      <span style={styles.orderLink}>Order →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div style={styles.emptyBox}>
              <p style={{ fontSize: '48px' }}>😕</p>
              <p style={styles.emptyText}>No restaurants found for "{search}"</p>
              <button style={styles.clearBtn} onClick={() => setSearch('')}>Clear search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '12px 32px', backgroundColor: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    position: 'sticky', top: 0, zIndex: 100
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
  logo: { color: '#E24B4A', fontSize: '22px', fontWeight: '800', whiteSpace: 'nowrap' },
  locationPill: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '13px', color: '#333', fontWeight: '600',
    backgroundColor: '#f8f8f8', padding: '6px 12px',
    borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap'
  },
  locationArrow: { color: '#E24B4A', fontSize: '10px' },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center',
    backgroundColor: '#f4f4f4', borderRadius: '12px',
    padding: '10px 16px', gap: '8px'
  },
  searchIconNav: { fontSize: '16px', flexShrink: 0 },
  searchInputNav: {
    border: 'none', outline: 'none', backgroundColor: 'transparent',
    fontSize: '14px', width: '100%', color: '#333'
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  points: {
    fontSize: '13px', color: '#E24B4A', fontWeight: '700',
    backgroundColor: '#fff5f5', padding: '5px 12px', borderRadius: '20px'
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#E24B4A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px'
  },
  logoutBtn: {
    padding: '7px 16px', backgroundColor: 'transparent',
    color: '#E24B4A', border: '1.5px solid #E24B4A',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
  },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' },
  bannerWrap: { marginBottom: '32px' },
  banner: {
    height: '200px', borderRadius: '20px',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', padding: '32px',
    transition: 'background-image 0.5s ease'
  },
  bannerText: {},
  bannerTitle: { color: '#fff', fontSize: '36px', fontWeight: '800', margin: '0 0 4px' },
  bannerSub: { color: 'rgba(255,255,255,0.9)', margin: '0 0 16px', fontSize: '16px' },
  bannerBtn: {
    padding: '10px 24px', backgroundColor: '#fff',
    color: '#E24B4A', border: 'none', borderRadius: '8px',
    fontWeight: '700', cursor: 'pointer', fontSize: '14px'
  },
  bannerDots: { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' },
  dot: { height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s' },
  section: { marginBottom: '32px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  count: { fontSize: '14px', color: '#999' },
  catRow: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' },
  catItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '80px' },
  catIcon: {
    width: '70px', height: '70px', borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px'
  },
  catName: { fontSize: '12px', margin: 0, fontWeight: '600' },
  offersStrip: { display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '32px', paddingBottom: '4px' },
  offerChip: {
    whiteSpace: 'nowrap', padding: '8px 18px',
    backgroundColor: '#fff', border: '1.5px solid #eee',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    color: '#333', cursor: 'pointer'
  },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '24px' },
  skeleton: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden' },
  skeletonImg: { height: '180px', backgroundColor: '#f0f0f0', animation: 'pulse 1.5s infinite' },
  skeletonBody: { padding: '16px' },
  skeletonLine: { height: '14px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '10px', width: '80%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '24px' },
  card: {
    backgroundColor: '#fff', borderRadius: '16px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    cursor: 'pointer', overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardImgWrap: { position: 'relative', height: '180px' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
  },
  distTag: {
    position: 'absolute', bottom: '10px', left: '12px',
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
    padding: '3px 10px', borderRadius: '20px', fontSize: '12px'
  },
  openTag: {
    position: 'absolute', top: '12px', right: '12px',
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#4ade80',
    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
  },
  cardBody: { padding: '16px' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  cardName: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a1a' },
  ratingPill: {
    backgroundColor: '#E8F5E9', color: '#2E7D32',
    padding: '3px 10px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '700'
  },
  cardCuisine: { color: '#888', fontSize: '13px', margin: '0 0 6px' },
  cardDesc: { color: '#aaa', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  freeDelivery: { fontSize: '13px', color: '#27AE60', fontWeight: '600' },
  orderLink: { fontSize: '13px', color: '#E24B4A', fontWeight: '700' },
  emptyBox: { textAlign: 'center', padding: '60px' },
  emptyText: { color: '#999', fontSize: '16px', marginBottom: '16px' },
  clearBtn: {
    padding: '10px 24px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600'
  }
};

export default Home;