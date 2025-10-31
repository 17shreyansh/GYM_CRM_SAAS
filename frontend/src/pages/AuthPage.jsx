import React, { useState } from 'react';
import { Form, Input, Button, Tabs, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const loginField = activeTab === 'gym' ? values.username : values.email;
      const user = await login(loginField, values.password);
      
      if (activeTab === 'member' && user.role !== 'member') {
        throw new Error('Invalid member credentials');
      }
      if (activeTab === 'gym' && user.role !== 'gym_owner') {
        throw new Error('Invalid gym owner credentials');
      }

      message.success('Login successful');
      if (user.role === 'member') {
        navigate('/dashboard');
      } else if (user.role === 'gym_owner') {
        navigate('/gym');
      }
    } catch (err) {
      const errorData = err.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = {};
        errorData.errors.forEach(error => {
          if (error.field) {
            fieldErrors[error.field] = error.message;
          }
        });
        
        loginForm.setFields(
          Object.entries(fieldErrors).map(([field, message]) => ({
            name: field,
            errors: [message]
          }))
        );
        
        setError('Please correct the errors below');
      } else {
        // Display specific backend error messages
        const errorMessage = errorData?.message || err.message || 'Authentication failed';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const registerData = {
        ...values,
        role: activeTab === 'member' ? 'member' : 'gym_owner'
      };
      
      await register(registerData);
      message.success('Registration successful');
      
      if (activeTab === 'member') {
        navigate('/dashboard');
      } else {
        navigate('/gym-owner-register');
      }
    } catch (err) {
      const errorData = err.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = {};
        errorData.errors.forEach(error => {
          if (error.field) {
            fieldErrors[error.field] = error.message;
          }
        });
        
        registerForm.setFields(
          Object.entries(fieldErrors).map(([field, message]) => ({
            name: field,
            errors: [message]
          }))
        );
        
        setError('Please correct the errors below');
      } else {
        // Display specific backend error messages
        const errorMessage = errorData?.message || err.message || 'Registration failed';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-cyber" style={{ position: 'absolute', inset: 0 }} />
        <div className="circuit-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
        <div className="grid-background" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>

      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(${45 + i * 45}deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)`,
            animation: `pulse ${4 + i * 0.5}s infinite alternate`
          }}
        />
      ))}

      <div className="auth-header">
        <h1 className="auth-title">ORDIIN</h1>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h2 className="auth-card-title">Welcome Back</h2>
          <p className="auth-card-subtitle">Sign in to your gym management platform</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            icon={<ExclamationCircleOutlined />}
            showIcon
            closable
            onClose={() => setError(null)}
            style={{
              marginBottom: '1rem',
              background: 'hsl(0 84% 60% / 0.1)',
              border: '1px solid hsl(0 84% 60% / 0.2)',
              borderRadius: '0.5rem',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: '500'
            }}
          />
        )}

        <div className="auth-tab-selector">
          <button
            type="button"
            onClick={() => {
              setActiveTab('member');
              setError(null);
              loginForm.resetFields();
              registerForm.resetFields();
            }}
            className={`auth-tab-button ${activeTab === 'member' ? 'active' : ''}`}
          >
            Member
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('gym');
              setError(null);
              loginForm.resetFields();
              registerForm.resetFields();
            }}
            className={`auth-tab-button ${activeTab === 'gym' ? 'active' : ''}`}
          >
            Gym Owner
          </button>
        </div>

        <Tabs
          defaultActiveKey="login"
          centered
          className="auth-tabs"
          onChange={() => {
            setError(null);
            loginForm.resetFields();
            registerForm.resetFields();
          }}
          items={[
            {
              key: 'login',
              label: <span style={{ color: 'hsl(240 5% 90%)', fontFamily: "'Rajdhani', sans-serif" }}>Sign In</span>,
              children: (
                <Form form={loginForm} onFinish={handleSubmit} layout="vertical">
                  <Form.Item 
                    name={activeTab === 'gym' ? 'username' : 'email'}
                    rules={activeTab === 'gym' ? [{ required: true }] : [{ required: true, type: 'email' }]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                      placeholder={activeTab === 'gym' ? 'Enter your username' : 'Enter your email'}
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item 
                    name="password" 
                    rules={[{ required: true }]}
                    style={{ marginBottom: '24px' }}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                      placeholder="Enter your password"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      className="auth-button"
                    >
                      Sign In as {activeTab === 'member' ? 'Member' : 'Gym Owner'}
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'register',
              label: <span style={{ color: 'hsl(240 5% 90%)', fontFamily: "'Rajdhani', sans-serif" }}>Sign Up</span>,
              children: (
                <Form form={registerForm} onFinish={handleRegister} layout="vertical">
                  <Form.Item name="name" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                    <Input
                      prefix={<UserOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                      placeholder="Full Name"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item name="username" rules={[{ required: true, pattern: /^[a-zA-Z0-9_]+$/ }]} style={{ marginBottom: '16px' }}>
                    <Input
                      prefix={<UserOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                      placeholder="Username"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]} style={{ marginBottom: '16px' }}>
                    <Input
                      prefix={<UserOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                      placeholder="Email"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                  {activeTab === 'gym' && (
                    <Form.Item name="phone" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                      <Input
                        prefix={<PhoneOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                        placeholder="Phone Number"
                        size="large"
                        className="auth-input"
                      />
                    </Form.Item>
                  )}
                  <Form.Item name="password" rules={[{ required: true, min: 6 }]} style={{ marginBottom: '24px' }}>
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'hsl(213 94% 68%)' }} />}
                      placeholder="Password (min 6 chars)"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      className="auth-button"
                    >
                      Create {activeTab === 'member' ? 'Member' : 'Gym Owner'} Account
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </div>

      <Link to="/admin-login" className="auth-admin-link">
        A
      </Link>
    </div>
  );
};

export default AuthPage;