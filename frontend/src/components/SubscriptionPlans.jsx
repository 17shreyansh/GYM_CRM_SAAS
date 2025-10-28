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
        name: 'Gym Management System',
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

  if (loading) return <Spin size="large" />;

  return (
    <div>
      <h3><CheckCircleOutlined /> Choose Your Subscription Plan</h3>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Select a subscription plan to access your gym management portal.
      </p>

      {/* Trial Option */}
      {trialStatus && trialStatus.trial_status === 'available' && (
        <Card 
          style={{ 
            border: '2px solid #52c41a',
            background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
            marginBottom: 16
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <GiftOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }} />
            <h3 style={{ color: '#52c41a', margin: 0 }}>🎉 Start Your FREE Trial!</h3>
            <p style={{ fontSize: '18px', margin: '8px 0', color: '#389e0d' }}>
              Get 30 days of complete access - No payment required!
            </p>
            <div style={{ 
              background: 'rgba(255, 193, 7, 0.1)', 
              border: '1px solid #ffc107', 
              borderRadius: '8px', 
              padding: '12px', 
              margin: '16px 0',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#e65100' }}>
                🚧 Testing Phase Notice
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                We're in our starting phase! If you encounter any issues, please create a support ticket - we'll fix it ASAP. 
                Got ideas to improve the portal? Share them with us and we'll implement them too!
              </p>
            </div>
            <ul style={{ textAlign: 'left', margin: '16px 0', color: '#666' }}>
              <li>✅ Complete gym management access</li>
              <li>✅ Unlimited members</li>
              <li>✅ All analytics & reports</li>
              <li>✅ Staff management</li>
              <li>✅ All portal features included</li>
              <li>✅ No credit card required</li>
            </ul>
            <Button 
              type="primary" 
              size="large"
              icon={<GiftOutlined />}
              style={{ 
                background: '#52c41a', 
                borderColor: '#52c41a',
                fontSize: '16px',
                height: '48px',
                width: '100%'
              }}
              loading={trialLoading}
              onClick={handleStartTrial}
            >
              🚀 Start My Free Trial - No Limits!
            </Button>
          </div>
        </Card>
      )}

      {/* Trial Status Alert */}
      {trialStatus && trialStatus.trial_status === 'active' && (
        <Alert
          message="Trial Active"
          description={`Your free trial is active. ${trialStatus.days_remaining} days remaining.`}
          type="success"
          icon={<ClockCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {trialStatus && trialStatus.trial_status === 'expired' && (
        <Alert
          message="Trial Expired"
          description="Your free trial has expired. Please choose a subscription plan to continue."
          type="warning"
          style={{ marginBottom: 16 }}
        />
      )}

      {trialStatus && trialStatus.trial_status === 'used' && (
        <Alert
          message="Trial Already Used"
          description="You have already used your free trial. Please choose a subscription plan."
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map(plan => (
          <Card 
            key={plan._id}
            hoverable
            style={{ 
              border: plan.price === 0 ? '2px solid #52c41a' : '1px solid #d9d9d9',
              background: plan.price === 0 ? '#f6ffed' : 'white'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: 0, color: plan.price === 0 ? '#52c41a' : 'inherit' }}>
                {plan.name}
              </h4>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: '8px 0',
                color: plan.price === 0 ? '#52c41a' : 'inherit'
              }}>
                ₹{plan.price}/{plan.duration} days
              </p>
              <p style={{ margin: 0, color: '#666' }}>
                {plan.member_limit === 0 ? 'Unlimited members' : `Up to ${plan.member_limit} members`}
              </p>
              {plan.features && (
                <ul style={{ textAlign: 'left', marginTop: 16, color: '#666' }}>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
              <Button 
                type="primary" 
                size="large"
                style={{ marginTop: 16, width: '100%' }}
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