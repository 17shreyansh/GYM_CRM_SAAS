import React from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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

  const onRegister = async (values) => {
    try {
      const user = await register(values);
      message.success('Registration successful');
      navigate(user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Tabs defaultActiveKey="login">
          <Tabs.TabPane tab="Login" key="login">
            <Form onFinish={onLogin}>
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Register" key="register">
            <Form onFinish={onRegister}>
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input placeholder="Full Name" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
                <Input.Password placeholder="Password" />
              </Form.Item>
              <Form.Item name="role" rules={[{ required: true }]}>
                <select style={{ width: '100%', padding: '8px' }}>
                  <option value="member">Member</option>
                  <option value="gym_owner">Gym Owner</option>
                </select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Register
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;