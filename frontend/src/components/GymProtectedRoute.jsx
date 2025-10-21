import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const GymProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);

  useEffect(() => {
    if (user?.role === 'gym_owner') {
      checkSubscription();
    } else {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      // Try to fetch gym dashboard which requires subscription
      await api.get('/gym/dashboard');
      setHasValidSubscription(true);
    } catch (error) {
      if (error.response?.data?.subscription_required || error.response?.data?.subscription_expired) {
        setHasValidSubscription(false);
      } else {
        // Other errors, assume subscription is valid
        setHasValidSubscription(true);
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'gym_owner' && !hasValidSubscription) {
    return <Navigate to="/subscription-required" />;
  }

  return children;
};

export default GymProtectedRoute;