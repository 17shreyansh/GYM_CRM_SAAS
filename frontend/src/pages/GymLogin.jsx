import React from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, BankOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const GymLogin = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values) => {
    try {
      const user = await login(values.email, values.password);
      if (user.role !== 'gym_owner') {
        message.error('Invalid credentials for gym owner');
        return;
      }
      message.success('Login successful');
      
      // Check if gym registration is complete
      try {
        await api.get('/gym/details');
        navigate('/gym');
      } catch (error) {
        if (error.response?.status === 404) {
          navigate('/gym-owner-register');
        } else {
          navigate('/gym');
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  const onRegister = async (values) => {
    try {
      const user = await register({ ...values, role: 'gym_owner' });
      message.success('Registration successful');
      navigate('/gym-owner-register');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 450 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShopOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <h2>Gym Owner Portal</h2>
        </div>
        
        <Tabs defaultActiveKey="login">
          <Tabs.TabPane tab="Login" key="login">
            <Form onFinish={onLogin} layout="vertical">
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Login to Gym Portal
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="Register" key="register">
            <Form onFinish={onRegister} layout="vertical">
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
              </Form.Item>
              <Form.Item 
                name="username" 
                rules={[
                  { required: true, message: 'Username is required' },
                  { min: 3, message: 'Username must be at least 3 characters' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username (letters, numbers, _ only)" size="large" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
              </Form.Item>
              <Form.Item name="phone" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} placeholder="Phone Number" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password (min 6 chars)" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Register Gym Owner
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/member-login">Member Login</Link> | <Link to="/login">Admin Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default GymLogin;