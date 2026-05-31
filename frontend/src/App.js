import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import OrderTracking from './pages/OrderTracking';
import Review from './pages/Review';
import MerchantDashboard from './pages/MerchantDashboard';
import MyOrders from './pages/MyOrders';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const RoleBasedHome = () => {
  const { user } = useAuth();
  if (user?.role === 'restaurant') return <Navigate to="/merchant" />;
  if (user?.role === 'courier') return <Navigate to="/courier" />;
  return <Home />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <RoleBasedHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/restaurant/:id"
        element={
          <PrivateRoute>
            <RestaurantDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/order/:id"
        element={
          <PrivateRoute>
            <OrderTracking />
          </PrivateRoute>
        }
      />
      <Route
        path="/review/:id"
        element={
          <PrivateRoute>
            <Review />
          </PrivateRoute>
        }
      />
      <Route
        path="/merchant"
        element={
          <PrivateRoute>
            <MerchantDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/myorders"
        element={
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;