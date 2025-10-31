import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const user = await login(values.email, values.password);
      
      if (user.role !== 'admin') {
        throw new Error('Invalid admin credentials');
      }

      message.success('Admin login successful');
      navigate('/admin');
    } catch (err) {
      message.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Main Admin Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#dc2626',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>
            👑
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Admin Portal
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Restricted access only
          </p>
        </div>

        {/* Admin Login Form */}
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item 
            name="email" 
            rules={[{ required: true, type: 'email' }]}
            style={{ marginBottom: '16px' }}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Admin Email"
              size="large"
              style={{
                borderRadius: '8px',
                height: '44px',
                fontSize: '16px',
                border: '1px solid #d1d5db'
              }}
            />
          </Form.Item>
          <Form.Item 
            name="password" 
            rules={[{ required: true }]}
            style={{ marginBottom: '24px' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Admin Password"
              size="large"
              style={{
                borderRadius: '8px',
                height: '44px',
                fontSize: '16px',
                border: '1px solid #d1d5db'
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: '44px',
                borderRadius: '8px',
                background: '#dc2626',
                border: 'none',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              Access Admin Portal
            </Button>
          </Form.Item>
        </Form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link 
            to="/" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to main login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;