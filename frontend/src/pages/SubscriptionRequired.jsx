import React from 'react';
import { Card, Button, Result } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';

const SubscriptionRequired = ({ type = 'required' }) => {
  const navigate = useNavigate();

  const handlePlanSelect = (result) => {
    if (result.success) {
      navigate('/gym');
    }
  };

  if (type === 'expired') {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <Result
          status="warning"
          title="Subscription Expired"
          subTitle="Your subscription has expired. Please renew to continue using the gym management portal."
          extra={
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <SubscriptionPlans onPlanSelect={handlePlanSelect} />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '50px 20px', textAlign: 'center' }}>
      <Result
        icon={<CreditCardOutlined style={{ color: '#1890ff' }} />}
        title="Subscription Required"
        subTitle="You need an active subscription to access the gym management portal."
        extra={
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <SubscriptionPlans onPlanSelect={handlePlanSelect} />
          </div>
        }
      />
    </div>
  );
};

export default SubscriptionRequired;