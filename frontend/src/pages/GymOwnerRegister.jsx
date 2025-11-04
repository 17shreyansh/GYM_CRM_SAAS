import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Steps, Row, Col, Checkbox, Spin } from 'antd';
import { UserOutlined, ShopOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SubscriptionPlans from '../components/SubscriptionPlans';
import '../styles/gym-register.css';

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
        const existingGym = gymResponse.data.gym;
        setGymData(existingGym);
        
        if (existingGym.subscription_status === 'active' || existingGym.trial_status === 'active') {
          navigate('/gym');
          return;
        } else {
          setCurrentStep(2);
        }
      } catch (gymError) {
        setCurrentStep(1);
      }
    } catch {
      // User not authenticated, continue with registration
    }
    
    setLoading(false);
  };

  const handleUserRegistration = async (values) => {
    try {
      const response = await api.post('/auth/register', { ...values, role: 'gym_owner' });
      setUserData(response.data.user);
      message.success('Account created successfully!');
      setCurrentStep(1);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      message.error(errorMessage);
    }
  };

  const handleGymSetup = async (values) => {
    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append('gym_name', values.gym_name || values.gym_display_name);
      formData.append('owner_full_name', userData?.name || 'Owner');
      formData.append('business_email', values.business_email || userData?.email);
      formData.append('business_phone_number', values.business_phone_number || '');
      formData.append('registered_address', values.registered_address || `${values.city}, ${values.state} - ${values.pin}`);
      formData.append('gym_display_name', values.gym_display_name || values.gym_name);
      formData.append('description', values.description || '');
      formData.append('location', JSON.stringify({
        city: values.city || '',
        state: values.state || '',
        pin: values.pin || ''
      }));
      formData.append('amenities_list', JSON.stringify(values.amenities_list || []));
      formData.append('bank_details', JSON.stringify(values.bank_details || {}));
      formData.append('plan_type', 'basic');
      
      // Add QR code file
      const qrFile = document.querySelector('input[type="file"]').files[0];
      if (qrFile) {
        formData.append('qr_code', qrFile);
      }

      let response;
      if (gymData && gymData._id) {
        response = await api.patch(`/gym/details/${gymData._id}?initial_setup=true`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        try {
          response = await api.post('/gym', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (createError) {
          if (createError.response?.status === 400 && createError.response?.data?.gym) {
            setGymData(createError.response.data.gym);
            message.success('Gym setup completed!');
            setCurrentStep(2);
            return;
          }
          throw createError;
        }
      }
      
      setGymData(response.data.gym);
      message.success('Gym setup completed!');
      setCurrentStep(2);
    } catch (error) {
      console.error('Gym setup error:', error.response?.data);
      message.error(error.response?.data?.message || 'Gym setup failed');
    }
  };

  const handleSubscription = (result) => {
    if (result.success) {
      navigate('/gym');
    }
  };

  // Check if user should skip subscription step due to active trial
  useEffect(() => {
    if (gymData && currentStep === 2) {
      // Check if gym has active trial
      if (gymData.trial_status === 'active') {
        navigate('/gym');
      }
    }
  }, [gymData, currentStep, navigate]);

  if (loading) {
    return (
      <div className="gym-register-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="gym-register-container">
      <div className="gym-register-background">
        <div className="gradient-cyber" style={{ position: 'absolute', inset: 0 }} />
        <div className="circuit-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
        <div className="grid-background" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>

      <div className="gym-register-wrapper">
        <div className="gym-register-card">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={async () => {
              try {
                await api.post('/auth/logout');
              } catch (error) {
                console.log('Logout error:', error);
              }
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="gym-register-back"
          >
            Back to Login
          </Button>
          
          <div className="gym-register-header">
            <h2 className="gym-register-title">
              <ShopOutlined />
              Gym Owner Registration
            </h2>
          </div>
          
          <Steps current={currentStep} items={steps} className="gym-register-steps" />
          
          {userData && currentStep > 0 && (
            <div className="gym-register-success-card">
              <p className="gym-register-success-text">
                ✓ Welcome back! Continuing your registration from step {currentStep + 1}
              </p>
            </div>
          )}

          {/* Step 1: User Account */}
          {currentStep === 0 && (
            <Form form={form} onFinish={handleUserRegistration} layout="vertical" initialValues={userData}>
              <h3 className="gym-register-section-title">
                <UserOutlined /> Create Your Account
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="name" 
                    label={<span className="gym-register-form-label">Full Name</span>} 
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="Enter your full name" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="username" 
                    label={<span className="gym-register-form-label">Username</span>}
                    rules={[
                      { required: true, message: 'Username is required' },
                      { min: 3, message: 'Username must be at least 3 characters' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' }
                    ]}
                  >
                    <Input 
                      size="large" 
                      placeholder="e.g. john_doe123" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="email" 
                    label={<span className="gym-register-form-label">Email Address</span>} 
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email address' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="your.email@example.com" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="phone" 
                    label={<span className="gym-register-form-label">Phone Number</span>} 
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="+91 98765 43210" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item 
                name="password" 
                label={<span className="gym-register-form-label">Password</span>} 
                rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
              >
                <Input.Password 
                  size="large" 
                  placeholder="Create a strong password" 
                  className="gym-register-input" 
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block className="gym-register-button">
                Create Account & Continue
              </Button>
            </Form>
          )}

          {/* Step 2: Gym Setup */}
          {currentStep === 1 && (
            <Form form={form} onFinish={handleGymSetup} layout="vertical" initialValues={gymData}>
              <h3 className="gym-register-section-title">
                <ShopOutlined /> Setup Your Gym
              </h3>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="gym_name" 
                    label={<span className="gym-register-form-label">Gym Name (Legal)</span>} 
                    rules={[{ required: true, message: 'Please enter your gym name' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="e.g. PowerFit Gym Pvt Ltd" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="gym_display_name" 
                    label={<span className="gym-register-form-label">Display Name</span>} 
                    rules={[{ required: true, message: 'Please enter display name' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="e.g. PowerFit Gym" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="business_email" 
                    label={<span className="gym-register-form-label">Business Email</span>} 
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid business email' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="info@yourgym.com" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="business_phone_number" 
                    label={<span className="gym-register-form-label">Business Phone</span>} 
                    rules={[{ required: true, message: 'Please enter business phone number' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="+91 98765 43210" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                name="registered_address" 
                label={<span className="gym-register-form-label">Complete Address</span>} 
                rules={[{ required: true, message: 'Please enter your gym address' }]}
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Enter complete address with landmarks" 
                  className="gym-register-textarea" 
                />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Form.Item 
                    name="city" 
                    label={<span className="gym-register-form-label">City</span>} 
                    rules={[{ required: true, message: 'Please enter city' }]}
                  >
                    <Input 
                      placeholder="e.g. Mumbai" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item 
                    name="state" 
                    label={<span className="gym-register-form-label">State</span>} 
                    rules={[{ required: true, message: 'Please enter state' }]}
                  >
                    <Input 
                      placeholder="e.g. Maharashtra" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item 
                    name="pin" 
                    label={<span className="gym-register-form-label">PIN Code</span>} 
                    rules={[{ required: true, message: 'Please enter PIN code' }]}
                  >
                    <Input 
                      placeholder="400001" 
                      className="gym-register-input" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                name="description" 
                label={<span className="gym-register-form-label">Gym Description (Optional)</span>}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Describe your gym, facilities, and what makes it special..." 
                  className="gym-register-textarea" 
                />
              </Form.Item>

              <div className="gym-register-subsection">
                <h4>Payment Details</h4>
                <div className="gym-register-warning">
                  ⚠️ Payment QR codes will be used by members to pay membership fees. Ensure accuracy.
                </div>
                <Form.Item 
                  name="qr_code" 
                  label={<span className="gym-register-form-label">Upload Payment QR Code</span>}
                  rules={[{ required: true, message: 'QR code is required for member payments' }]}
                >
                  <div className="gym-register-qr-upload">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="qr-upload"
                      className="gym-register-file-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            document.getElementById('qr-preview').src = event.target.result;
                            document.getElementById('qr-preview').style.display = 'block';
                            document.querySelector('.gym-register-upload-text').textContent = file.name;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="qr-upload" className="gym-register-upload-label">
                      <div className="gym-register-upload-icon">📷</div>
                      <div className="gym-register-upload-text">Click to upload QR code image</div>
                      <div className="gym-register-upload-hint">PNG, JPG up to 5MB</div>
                    </label>
                    <img id="qr-preview" className="gym-register-qr-preview" style={{ display: 'none' }} alt="QR Preview" />
                  </div>
                </Form.Item>
              </div>

              <div className="gym-register-subsection">
                <h4>Bank Details (Optional)</h4>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name={['bank_details', 'account_holder_name']} 
                      label={<span className="gym-register-form-label">Account Holder Name</span>}
                    >
                      <Input 
                        placeholder="As per bank records" 
                        className="gym-register-input" 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name={['bank_details', 'account_number']} 
                      label={<span className="gym-register-form-label">Account Number</span>}
                    >
                      <Input 
                        placeholder="Enter account number" 
                        className="gym-register-input" 
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item 
                      name={['bank_details', 'bank_name']} 
                      label={<span className="gym-register-form-label">Bank Name</span>}
                    >
                      <Input 
                        placeholder="e.g. State Bank of India" 
                        className="gym-register-input" 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item 
                      name={['bank_details', 'ifsc_code']} 
                      label={<span className="gym-register-form-label">IFSC Code</span>}
                    >
                      <Input 
                        placeholder="e.g. SBIN0001234" 
                        className="gym-register-input" 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item 
                      name={['bank_details', 'branch_name']} 
                      label={<span className="gym-register-form-label">Branch Name</span>}
                    >
                      <Input 
                        placeholder="e.g. Andheri West" 
                        className="gym-register-input" 
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Form.Item name="amenities_list" label={<span className="gym-register-form-label">Amenities</span>}>
                <Checkbox.Group>
                  <Row gutter={[8, 8]}>
                    <Col xs={12} sm={8}><Checkbox value="AC" className="gym-register-checkbox">Air Conditioning</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Cardio" className="gym-register-checkbox">Cardio Equipment</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Weights" className="gym-register-checkbox">Weight Training</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Locker" className="gym-register-checkbox">Lockers</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Shower" className="gym-register-checkbox">Shower Rooms</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Parking" className="gym-register-checkbox">Parking Space</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="WiFi" className="gym-register-checkbox">Free WiFi</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Personal Training" className="gym-register-checkbox">Personal Training</Checkbox></Col>
                    <Col xs={12} sm={8}><Checkbox value="Group Classes" className="gym-register-checkbox">Group Classes</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>



              <Button type="primary" htmlType="submit" size="large" block className="gym-register-button" style={{ marginTop: 24 }}>
                Setup Gym & Continue
              </Button>
            </Form>
          )}

          {/* Step 3: Subscription */}
          {currentStep === 2 && (
            <SubscriptionPlans onPlanSelect={handleSubscription} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GymOwnerRegister;