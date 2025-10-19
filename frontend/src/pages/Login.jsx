import React from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values) => {
    try {
      const user = await login(values.email, values.password);
      message.success('Login successful');
      navigate(user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  const onMemberRegister = async (values) => {
    try {
      const user = await register({ ...values, role: 'member' });
      message.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 450 }}>
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
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="Member Register" key="member">
            <Form onFinish={onMemberRegister} layout="vertical">
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input prefix={<TeamOutlined />} placeholder="Full Name" size="large" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
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
          
          <Tabs.TabPane tab="Gym Owner" key="gym_owner">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <ShopOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <h3>Start Your Gym Business</h3>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Register your gym and manage members, plans, and payments all in one place.
              </p>
              <Button 
                type="primary" 
                size="large" 
                block
                onClick={() => navigate('/gym-owner-register')}
                icon={<ShopOutlined />}
              >
                Register Your Gym
              </Button>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;