import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const SubscriptionPlans = ({ onPlanSelect }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
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