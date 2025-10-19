import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Steps, Row, Col, TimePicker, Checkbox, Spin } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SubscriptionPlans from '../components/SubscriptionPlans';

const GymOwnerRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const [gymData, setGymData] = useState(null);
  const [loading, setLoading] = useState(true);

  const steps = [
    { title: 'Account', icon: <UserOutlined /> },
    { title: 'Gym Setup', icon: <ShopOutlined /> },
    { title: 'Subscription', icon: <CheckCircleOutlined /> }
  ];

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data.user;
      
      if (user.role !== 'gym_owner') {
        setLoading(false);
        return;
      }

      setUserData(user);
      
      try {
        const gymResponse = await api.get('/gym/details');
        setGymData(gymResponse.data.gym);
        
        // Gym exists, check subscription status
        if (gymResponse.data.gym.subscription_status === 'active') {
          navigate('/gym');
          return;
        } else {
          setCurrentStep(2);
        }
      } catch {
        setCurrentStep(1);
      }
    } catch {
      localStorage.removeItem('token');
    }
    
    setLoading(false);
  };

  // Step 1: Create User Account
  const handleUserRegistration = async (values) => {
    try {
      const response = await api.post('/auth/register', { ...values, role: 'gym_owner' });
      localStorage.setItem('token', response.data.token);
      setUserData(response.data.user);
      message.success('Account created successfully!');
      setCurrentStep(1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    }
  };

  // Step 2: Setup Gym
  const handleGymSetup = async (values) => {
    try {
      const processedHours = {};
      if (values.opening_hours) {
        Object.keys(values.opening_hours).forEach(day => {
          const dayData = values.opening_hours[day] || {};
          processedHours[day] = {
            open: dayData.open ? dayData.open.format('HH:mm') : null,
            close: dayData.close ? dayData.close.format('HH:mm') : null,
            closed: dayData.closed || false
          };
        });
      }

      const gymPayload = {
        gym_name: values.gym_name || values.gym_display_name,
        owner_full_name: userData?.name || 'Owner',
        business_email: values.business_email || userData?.email,
        business_phone_number: values.business_phone_number || '',
        registered_address: values.registered_address || `${values.city}, ${values.state} - ${values.pin}`,
        gym_display_name: values.gym_display_name || values.gym_name,
        description: values.description || '',
        location: {
          city: values.city || '',
          state: values.state || '',
          pin: values.pin || ''
        },
        amenities_list: values.amenities_list || [],
        opening_hours: processedHours,
        plan_type: 'basic'
      };

      const response = await api.post('/gym', gymPayload);
      setGymData(response.data.gym);
      message.success('Gym setup completed!');
      setCurrentStep(2);
    } catch (error) {
      console.error('Gym setup error:', error.response?.data);
      message.error(error.response?.data?.message || 'Gym setup failed');
    }
  };

  // Step 3: Handle Subscription
  const handleSubscription = (result) => {
    if (result.success) {
      navigate('/gym');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/login')}
            style={{ marginBottom: 16 }}
          >
            Back to Login
          </Button>
          
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
            <ShopOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Gym Owner Registration
          </h2>
          
          <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
          
          {userData && currentStep > 0 && (
            <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <p style={{ margin: 0, color: '#52c41a' }}>
                ✓ Welcome back! Continuing your registration from step {currentStep + 1}
              </p>
            </Card>
          )}

          {/* Step 1: User Account */}
          {currentStep === 0 && (
            <Form form={form} onFinish={handleUserRegistration} layout="vertical" initialValues={userData}>
              <h3><UserOutlined /> Create Your Account</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                <Input.Password size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block>
                Create Account & Continue
              </Button>
            </Form>
          )}

          {/* Step 2: Gym Setup */}
          {currentStep === 1 && (
            <Form form={form} onFinish={handleGymSetup} layout="vertical" initialValues={gymData}>
              <h3><ShopOutlined /> Setup Your Gym</h3>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="gym_name" label="Gym Name" rules={[{ required: true }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="gym_display_name" label="Display Name" rules={[{ required: true }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="business_email" label="Business Email" rules={[{ required: true, type: 'email' }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="business_phone_number" label="Phone" rules={[{ required: true }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="registered_address" label="Address" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="state" label="State" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="pin" label="PIN" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item name="amenities_list" label="Amenities">
                <Checkbox.Group>
                  <Row>
                    <Col span={8}><Checkbox value="AC">AC</Checkbox></Col>
                    <Col span={8}><Checkbox value="Cardio">Cardio</Checkbox></Col>
                    <Col span={8}><Checkbox value="Weights">Weights</Checkbox></Col>
                    <Col span={8}><Checkbox value="Locker">Lockers</Checkbox></Col>
                    <Col span={8}><Checkbox value="Shower">Showers</Checkbox></Col>
                    <Col span={8}><Checkbox value="Parking">Parking</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <h4>Operating Hours</h4>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const dayKey = day.toLowerCase();
                return (
                  <Row key={day} gutter={16} style={{ marginBottom: 8 }}>
                    <Col span={4}>
                      <div style={{ lineHeight: '32px', fontWeight: 500 }}>{day}</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['opening_hours', dayKey, 'open']}>
                        <TimePicker format="HH:mm" placeholder="Open" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['opening_hours', dayKey, 'close']}>
                        <TimePicker format="HH:mm" placeholder="Close" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['opening_hours', dayKey, 'closed']} valuePropName="checked">
                        <Checkbox>Closed</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                );
              })}

              <Button type="primary" htmlType="submit" size="large" block style={{ marginTop: 24 }}>
                Setup Gym & Continue
              </Button>
            </Form>
          )}

          {/* Step 3: Subscription */}
          {currentStep === 2 && (
            <SubscriptionPlans onPlanSelect={handleSubscription} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default GymOwnerRegister;