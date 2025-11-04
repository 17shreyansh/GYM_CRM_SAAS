import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Alert } from 'antd';
import { CheckCircleOutlined, GiftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const SubscriptionPlans = ({ onPlanSelect }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [trialStatus, setTrialStatus] = useState(null);
  const [trialLoading, setTrialLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
    checkTrialStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription/plans');
      setPlans(response.data.plans);
    } catch (error) {
      message.error('Failed to load plans');
    }
    setLoading(false);
  };

  const checkTrialStatus = async () => {
    try {
      const response = await api.get('/subscription/trial-status');
      setTrialStatus(response.data);
    } catch (error) {
      // Trial status check failed, user might not be authenticated
      console.log('Trial status check failed:', error);
    }
  };

  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      const response = await api.post('/subscription/start-trial');
      message.success('🎉 30-day free trial activated! Full access unlocked - no limitations!');
      onPlanSelect({ success: true });
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to start trial');
    }
    setTrialLoading(false);
  };

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    setProcessing(true);

    try {
      const response = await api.post('/subscription/create-order', { plan_id: plan._id });
      
      if (response.data.free_plan) {
        message.success('Free plan activated!');
        onPlanSelect({ success: true });
        return;
      }

      // Razorpay payment integration
      const options = {
        key: response.data.razorpay_key,
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: 'ORDIIN',
        description: `${plan.name} Subscription`,
        order_id: response.data.order.id,
        handler: async (paymentResponse) => {
          try {
            await api.post('/subscription/verify-payment', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              subscription_id: response.data.subscription._id
            });
            message.success('Payment successful! Subscription activated.');
            onPlanSelect({ success: true });
          } catch (error) {
            message.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Gym Owner',
          email: 'owner@gym.com'
        },
        theme: {
          color: '#1890ff'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        message.error('Payment gateway not loaded. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Order creation error:', error.response?.data);
      message.error(error.response?.data?.message || 'Failed to create order');
    }
    setProcessing(false);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" style={{ color: 'hsl(213 94% 68%)' }} />
    </div>
  );

  return (
    <div style={{ 
      background: 'transparent',
      color: 'hsl(240 5% 90%)',
      fontFamily: "'Rajdhani', sans-serif"
    }}>
      <h3 className="gym-register-section-title">
        <CheckCircleOutlined /> Choose Your Subscription Plan
      </h3>
      {(!trialStatus || trialStatus.trial_status === 'expired' || trialStatus.trial_status === 'used') && (
        <p style={{ color: 'hsl(240 5% 65%)', marginBottom: 24, fontFamily: "'Rajdhani', sans-serif", fontSize: '16px' }}>
          Select a subscription plan to access your gym management portal.
        </p>
      )}
      
      {trialStatus && trialStatus.trial_status === 'active' && (
        <p style={{ color: 'hsl(240 5% 65%)', marginBottom: 24, fontFamily: "'Rajdhani', sans-serif", fontSize: '16px' }}>
          Your trial is active! You can upgrade to a paid plan anytime for additional benefits.
        </p>
      )}

      {/* Trial Status Info */}
      {trialStatus && trialStatus.trial_status === 'available' && (
        <Alert
          message={<span style={{ color: 'hsl(142 76% 36%)', fontFamily: "'Rajdhani', sans-serif", fontWeight: '600' }}>Free Trial Available</span>}
          description={<span style={{ color: 'hsl(240 5% 65%)', fontFamily: "'Rajdhani', sans-serif" }}>Your 30-day free trial will start automatically when you complete gym setup. No payment required!</span>}
          type="success"
          icon={<GiftOutlined style={{ color: 'hsl(142 76% 36%)' }} />}
          style={{ 
            marginBottom: 16,
            background: 'hsl(142 76% 36% / 0.1) !important',
            border: '1px solid hsl(142 76% 36% / 0.3) !important',
            borderRadius: '12px !important'
          }}
        />
      )}

      {/* Trial Status Alert */}
      {trialStatus && trialStatus.trial_status === 'active' && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={<span style={{ color: 'hsl(142 76% 36%)', fontFamily: "'Rajdhani', sans-serif", fontWeight: '600' }}>🎉 Free Trial Active!</span>}
            description={
              <div style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                <p style={{ margin: '8px 0', color: 'hsl(240 5% 65%)' }}>
                  Your 30-day free trial is active with full access to all features. {trialStatus.days_remaining} days remaining.
                </p>
                <Button 
                  type="primary" 
                  size="large"
                  className="gym-register-button"
                  style={{ 
                    background: 'hsl(142 76% 36%)', 
                    borderColor: 'hsl(142 76% 36%)',
                    fontSize: '16px',
                    height: '48px',
                    width: '100%',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: '600',
                    marginTop: '12px'
                  }}
                  onClick={() => onPlanSelect({ success: true })}
                >
                  🚀 Continue to Dashboard
                </Button>
              </div>
            }
            type="success"
            icon={<ClockCircleOutlined style={{ color: 'hsl(142 76% 36%)' }} />}
            style={{ 
              background: 'hsl(142 76% 36% / 0.1) !important',
              border: '1px solid hsl(142 76% 36% / 0.3) !important',
              borderRadius: '12px !important'
            }}
          />
        </div>
      )}

      {trialStatus && trialStatus.trial_status === 'expired' && (
        <Alert
          message={<span style={{ color: 'hsl(38 92% 50%)', fontFamily: "'Rajdhani', sans-serif", fontWeight: '600' }}>Trial Expired</span>}
          description={<span style={{ color: 'hsl(240 5% 65%)', fontFamily: "'Rajdhani', sans-serif" }}>Your free trial has expired. Please choose a subscription plan to continue.</span>}
          type="warning"
          icon={<ClockCircleOutlined style={{ color: 'hsl(38 92% 50%)' }} />}
          style={{ 
            marginBottom: 16,
            background: 'hsl(38 92% 50% / 0.1) !important',
            border: '1px solid hsl(38 92% 50% / 0.3) !important',
            borderRadius: '12px !important'
          }}
        />
      )}

      {trialStatus && trialStatus.trial_status === 'used' && (
        <Alert
          message={<span style={{ color: 'hsl(213 94% 68%)', fontFamily: "'Rajdhani', sans-serif", fontWeight: '600' }}>Trial Completed</span>}
          description={<span style={{ color: 'hsl(240 5% 65%)', fontFamily: "'Rajdhani', sans-serif" }}>You have completed your free trial. Please choose a subscription plan to continue.</span>}
          type="info"
          icon={<ClockCircleOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
          style={{ 
            marginBottom: 16,
            background: 'hsl(213 94% 68% / 0.1) !important',
            border: '1px solid hsl(213 94% 68% / 0.3) !important',
            borderRadius: '12px !important'
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map(plan => (
          <Card 
            key={plan._id}
            hoverable
            style={{ 
              border: plan.price === 0 ? '2px solid hsl(142 76% 36%) !important' : '1px solid hsl(213 94% 68% / 0.4) !important',
              background: plan.price === 0 ? 'hsl(142 76% 36% / 0.1) !important' : 'hsl(240 10% 8%) !important',
              borderRadius: '12px !important',
              transition: 'all 0.3s ease !important',
              boxShadow: '0 0 15px hsl(213 94% 68% / 0.2) !important'
            }}
            bodyStyle={{ 
              padding: '24px',
              background: 'transparent !important'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ 
                margin: 0, 
                color: plan.price === 0 ? 'hsl(142 76% 36%)' : 'hsl(240 5% 90%)',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '20px',
                fontWeight: '600'
              }}>
                {plan.name}
              </h4>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: '8px 0',
                color: plan.price === 0 ? 'hsl(142 76% 36%)' : 'hsl(213 94% 68%)',
                fontFamily: "'Rajdhani', sans-serif"
              }}>
                ₹{plan.price}/{plan.duration} days
              </p>
              <p style={{ 
                margin: 0, 
                color: 'hsl(240 5% 65%)',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '16px',
                fontWeight: '500'
              }}>
                {plan.member_limit === 0 ? 'Unlimited members' : `Up to ${plan.member_limit} members`}
              </p>
              {plan.features && (
                <ul style={{ 
                  textAlign: 'left', 
                  marginTop: 16, 
                  color: 'hsl(240 5% 90%)',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: '500',
                  fontSize: '15px'
                }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>✓ {feature}</li>
                  ))}
                </ul>
              )}
              <Button 
                type="primary" 
                size="large"
                className="gym-register-button"
                style={{ 
                  marginTop: 16, 
                  width: '100%',
                  background: plan.price === 0 ? 'hsl(142 76% 36%)' : 'linear-gradient(135deg, hsl(213 94% 68%), hsl(213 94% 58%))',
                  borderColor: plan.price === 0 ? 'hsl(142 76% 36%)' : 'hsl(213 94% 68%)',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: '600',
                  fontSize: '16px',
                  height: '48px'
                }}
                loading={processing && selectedPlan?._id === plan._id}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.price === 0 ? 'Start Free' : 'Subscribe Now'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;