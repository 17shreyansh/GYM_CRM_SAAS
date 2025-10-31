import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values) => {
    try {
      const user = await login(values.email, values.password);
      if (user.role !== 'admin') {
        message.error('Invalid admin credentials');
        return;
      }
      message.success('Admin login successful');
      navigate('/admin');
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 450 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CrownOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <h2>Admin Portal</h2>
        </div>
        
        <Form onFinish={onLogin} layout="vertical" className="auth-form">
          <Form.Item 
            name="email" 
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Admin Email" size="large" />
          </Form.Item>
          <Form.Item 
            name="password" 
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Admin Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login as Admin
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/gym-login">Gym Owner Login</Link> | <Link to="/member-login">Member Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;