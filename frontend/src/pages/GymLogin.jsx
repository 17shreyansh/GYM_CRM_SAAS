import React, { useState } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, ArrowRightOutlined, TeamOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GymLogin = () => {
  const navigate = useNavigate();
  const { gymLogin, getRedirectPath } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();


  const onLogin = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      await gymLogin(values.username, values.password);
      message.success('Welcome to your gym portal!');
      navigate(getRedirectPath());
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Handle validation errors from backend
        const fieldErrors = {};
        errorData.errors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        
        // Set field-specific errors
        form.setFields(
          Object.entries(fieldErrors).map(([field, message]) => ({
            name: field,
            errors: [message]
          }))
        );
        
        setError('Please correct the errors below');
      } else {
        // Handle general errors
        const errorMessage = errorData?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
      }
    }
    setLoading(false);
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const backgroundStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
    opacity: 0.3
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '24px',
    padding: '48px',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)',
    position: 'relative',
    zIndex: 10
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const iconStyle = {
    fontSize: '64px',
    color: '#3b82f6',
    marginBottom: '16px',
    display: 'block'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    fontSize: '16px'
  };

  const toggleContainerStyle = {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '6px',
    marginBottom: '32px'
  };

  const toggleButtonStyle = (active) => ({
    flex: 1,
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: active ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
    color: active ? 'white' : 'rgba(255, 255, 255, 0.7)',
    boxShadow: active ? '0 8px 25px rgba(59, 130, 246, 0.3)' : 'none'
  });

  const memberLinkStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '32px',
    fontSize: '15px',
    fontWeight: '500'
  };

  const registerInfoStyle = {
    textAlign: 'center',
    padding: '32px 0'
  };

  const registerTitleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px'
  };

  const registerDescStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '32px',
    lineHeight: '1.6'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'hsl(240 10% 3.9%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'Rajdhani, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Circuit Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(hsl(213 94% 68% / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(213 94% 68% / 0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: '-1px -1px'
      }} />
      
      {/* Animated Glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '20%',
        width: '20rem',
        height: '20rem',
        background: 'hsl(213 94% 68% / 0.15)',
        borderRadius: '50%',
        filter: 'blur(4rem)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      
      <div style={{
        width: '100%',
        maxWidth: '26rem',
        background: 'hsl(240 10% 7%)',
        border: '1px solid hsl(213 94% 68% / 0.2)',
        borderRadius: '0.5rem',
        padding: '3rem 2rem',
        boxShadow: '0 0 20px hsl(213 94% 68% / 0.3), 0 0 40px hsl(213 94% 68% / 0.15)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/src/assets/logo.png" alt="ORDIIN" style={{ height: '3rem', marginBottom: '0.5rem' }} />
          <ShopOutlined style={{
            fontSize: '3rem',
            color: 'hsl(213 94% 68%)',
            marginBottom: '1rem',
            display: 'block',
            textShadow: '0 0 16px hsl(213 94% 68% / 0.3)'
          }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'hsl(240 5% 90%)',
            margin: '0 0 0.5rem 0',
            fontFamily: 'Orbitron, sans-serif'
          }}>ORDIIN GYM PORTAL</h1>
          <p style={{
            color: 'hsl(240 5% 65%)',
            margin: 0,
            fontSize: '1rem'
          }}>Manage your fitness empire</p>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: 'hsl(240 10% 10%)',
          borderRadius: '1rem',
          padding: '0.375rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: isLogin ? 'hsl(213 94% 68%)' : 'transparent',
              color: isLogin ? 'hsl(0 0% 100%)' : 'hsl(240 5% 65%)',
              boxShadow: isLogin ? '0 0 8px hsl(213 94% 68% / 0.25)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: !isLogin ? 'hsl(213 94% 68%)' : 'transparent',
              color: !isLogin ? 'hsl(0 0% 100%)' : 'hsl(240 5% 65%)',
              boxShadow: !isLogin ? '0 0 8px hsl(213 94% 68% / 0.25)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message={error}
            type="error"
            icon={<ExclamationCircleOutlined />}
            showIcon
            closable
            onClose={() => setError(null)}
            style={{
              marginBottom: '1.5rem',
              background: 'hsl(0 84% 60% / 0.1)',
              border: '1px solid hsl(0 84% 60% / 0.2)',
              borderRadius: '0.5rem',
              color: 'hsl(0 84% 60%)'
            }}
          />
        )}

        {/* Forms */}
        {isLogin ? (
          <Form form={form} onFinish={onLogin} layout="vertical">
            <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
              <Input
                prefix={<UserOutlined style={{ color: 'hsl(240 5% 65%)' }} />}
                placeholder="Username"
                size="large"
                style={{
                  background: 'hsl(240 10% 10%)',
                  border: '1px solid hsl(213 94% 68% / 0.2)',
                  borderRadius: '0.5rem',
                  color: 'hsl(240 5% 90%)',
                  height: '3.25rem'
                }}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: 'hsl(240 5% 65%)' }} />}
                placeholder="Password"
                size="large"
                style={{
                  background: 'hsl(240 10% 10%)',
                  border: '1px solid hsl(213 94% 68% / 0.2)',
                  borderRadius: '0.5rem',
                  color: 'hsl(240 5% 90%)',
                  height: '3.25rem'
                }}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                width: '100%',
                background: 'hsl(213 94% 68%)',
                border: 'none',
                borderRadius: '0.5rem',
                height: '3.25rem',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 0 20px hsl(213 94% 68% / 0.4)'
              }}
            >
              Access Portal <ArrowRightOutlined />
            </Button>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'hsl(240 5% 90%)',
              marginBottom: '1rem',
              fontFamily: 'Orbitron, sans-serif'
            }}>Start Your Gym Business</h3>
            <p style={{
              color: 'hsl(240 5% 65%)',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Register your gym with unique username and bank details for seamless payment processing.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/gym-register')}
              style={{
                background: 'linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(142 72% 29%) 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                height: '3.25rem',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 0 20px hsl(142 76% 36% / 0.4)',
                width: '100%'
              }}
            >
              <ShopOutlined /> Register Your Gym
            </Button>
          </div>
        )}

        {/* Member Link */}
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.25rem',
            background: 'hsl(240 10% 10%)',
            border: '1px solid hsl(213 94% 68% / 0.15)',
            borderRadius: '0.5rem',
            color: 'hsl(240 5% 65%)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '2rem',
            fontSize: '0.9375rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'hsl(240 10% 12%)';
            e.target.style.color = 'hsl(240 5% 90%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'hsl(240 10% 10%)';
            e.target.style.color = 'hsl(240 5% 65%)';
          }}
        >
          <TeamOutlined />
          Member/User Portal
        </button>
      </div>

      <style>{`
        .ant-input::placeholder,
        .ant-input-password input::placeholder {
          color: hsl(240 5% 65%) !important;
          opacity: 1 !important;
        }
        
        .ant-form-item-explain-error {
          color: hsl(0 84% 60%) !important;
          font-size: 0.875rem !important;
          margin-top: 0.5rem !important;
        }
        
        .ant-form-item-has-error .ant-input,
        .ant-form-item-has-error .ant-input-password .ant-input {
          border-color: hsl(0 84% 60%) !important;
          box-shadow: 0 0 0 2px hsl(0 84% 60% / 0.2) !important;
        }
        
        .ant-alert-error {
          background: hsl(0 84% 60% / 0.1) !important;
          border: 1px solid hsl(0 84% 60% / 0.2) !important;
        }
        
        .ant-alert-error .ant-alert-message {
          color: hsl(0 84% 60%) !important;
        }
        
        .ant-alert-error .ant-alert-icon {
          color: hsl(0 84% 60%) !important;
        }
        
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(10px, -20px, 0); }
          66% { transform: translate3d(-10px, 10px, 0); }
        }
        @media (max-width: 640px) {
          .container { padding: 1rem; }
          .card { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default GymLogin;