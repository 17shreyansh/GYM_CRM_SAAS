import React from 'react';
import { Form, Input, Button, Card, message, Tabs, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const MemberLogin = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values) => {
    try {
      const user = await login(values.email, values.password);
      if (user.role !== 'member') {
        message.error('Invalid credentials for member');
        return;
      }
      message.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  const onRegister = async (values) => {
    try {
      const registerData = { ...values, role: 'member' };
      if (values.dateOfBirth) {
        registerData.dateOfBirth = values.dateOfBirth.toISOString();
      }
      const user = await register(registerData);
      message.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 450 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <TeamOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <h2>Member Portal</h2>
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
                  Login to Member Portal
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="Register" key="register">
            <Form onFinish={onRegister} layout="vertical">
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input prefix={<TeamOutlined />} placeholder="Full Name" size="large" />
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
              <Form.Item name="phone">
                <Input prefix={<PhoneOutlined />} placeholder="Phone Number (Optional)" size="large" />
              </Form.Item>
              <Form.Item name="dateOfBirth">
                <DatePicker 
                  prefix={<CalendarOutlined />} 
                  placeholder="Date of Birth (Optional)" 
                  size="large" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password (min 6 chars)" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Register as Member
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/gym-login">Gym Owner Login</Link> | <Link to="/login">Admin Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default MemberLogin;