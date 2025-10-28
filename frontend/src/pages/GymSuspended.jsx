import React from 'react';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GymSuspended = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'var(--background-color)'
    }}>
      <Result
        icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        title="Gym Suspended"
        subTitle="Your gym has been suspended by the administrator. Please contact support for assistance."
        extra={[
          <Button type="primary" key="support" onClick={() => navigate('/support')}>
            Contact Support
          </Button>,
          <Button key="logout" onClick={logout}>
            Logout
          </Button>
        ]}
      />
    </div>
  );
};

export default GymSuspended;