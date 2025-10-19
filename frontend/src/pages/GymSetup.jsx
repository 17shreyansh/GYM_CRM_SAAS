import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, TimePicker, Upload, message, Select, Tabs, Space, Tag, Steps, Row, Col, Checkbox, Switch } from 'antd';
import { UploadOutlined, PlusOutlined, CameraOutlined, BankOutlined, EnvironmentOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';
import FileUpload from '../components/FileUpload';

const { TabPane } = Tabs;
const { Option } = Select;

const GymSetup = () => {
  const [form] = Form.useForm();
  const [gym, setGym] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoFileList, setLogoFileList] = useState([]);
  const [bannerFileList, setBannerFileList] = useState([]);
  const [galleryFileList, setGalleryFileList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchGym();
  }, []);

  const fetchGym = async () => {
    try {
      const response = await api.get('/gym/details');
      if (response.data?.gym) {
        const gymData = response.data.gym;
        setGym(gymData);
        setIsEditing(true);
        
        // Process opening hours to convert time strings to dayjs objects
        if (gymData.opening_hours) {
          const processedHours = {};
          Object.keys(gymData.opening_hours).forEach(day => {
            const dayData = gymData.opening_hours[day];
            processedHours[day] = {
              ...dayData,
              open: dayData.open ? dayjs(dayData.open, 'HH:mm') : null,
              close: dayData.close ? dayjs(dayData.close, 'HH:mm') : null
            };
          });
          gymData.opening_hours = processedHours;
        }
        
        // Process existing images
        if (gymData.gym_logo) {
          setLogoFileList([{
            uid: '-1',
            name: 'logo.jpg',
            status: 'done',
            url: gymData.gym_logo,
            thumbUrl: gymData.gym_logo
          }]);
        }
        
        if (gymData.banner_images && gymData.banner_images.length > 0) {
          setBannerFileList(gymData.banner_images.map((url, index) => ({
            uid: `-banner-${index}`,
            name: `banner-${index}.jpg`,
            status: 'done',
            url,
            thumbUrl: url
          })));
        }
        
        if (gymData.gallery_images && gymData.gallery_images.length > 0) {
          setGalleryFileList(gymData.gallery_images.map((url, index) => ({
            uid: `-gallery-${index}`,
            name: `gallery-${index}.jpg`,
            status: 'done',
            url,
            thumbUrl: url
          })));
        }
        
        form.setFieldsValue(gymData);
      }
    } catch (error) {
      // Gym doesn't exist yet, show registration form
      console.log('No gym found, showing registration form');
    }
  };

  const onFinishRegistration = async (values) => {
    try {
      // Process form data
      const formData = {
        ...values,
        amenities_list: values.amenities_list || [],
        services_offered: values.services_offered || []
      };
      
      // Convert opening hours dayjs objects to strings
      if (formData.opening_hours) {
        Object.keys(formData.opening_hours).forEach(day => {
          const dayData = formData.opening_hours[day];
          if (dayData.open) {
            dayData.open = dayData.open.format('HH:mm');
          }
          if (dayData.close) {
            dayData.close = dayData.close.format('HH:mm');
          }
        });
      }
      
      const response = await api.post('/gym', formData);
      message.success('Gym registered successfully! Awaiting admin approval.');
      fetchGym();
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Failed to register gym');
    }
  };

  const onFinishUpdate = async (values) => {
    try {
      // Convert opening hours dayjs objects to strings
      if (values.opening_hours) {
        Object.keys(values.opening_hours).forEach(day => {
          const dayData = values.opening_hours[day];
          if (dayData.open && dayData.open.format) {
            dayData.open = dayData.open.format('HH:mm');
          }
          if (dayData.close && dayData.close.format) {
            dayData.close = dayData.close.format('HH:mm');
          }
        });
      }
      
      await api.patch(`/gym/details/${gym._id}`, values);
      message.success('Gym details updated successfully');
      fetchGym();
    } catch (error) {
      message.error('Failed to update gym');
    }
  };

  const steps = [
    { title: 'Business Info', icon: <BankOutlined /> },
    { title: 'Gym Details', icon: <EnvironmentOutlined /> },
    { title: 'Media & Hours', icon: <CameraOutlined /> },
    { title: 'Online Presence', icon: <GlobalOutlined /> }
  ];

  const handleUploadSuccess = () => {
    fetchGym(); // Refresh gym data after upload
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  if (!gym) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card title="Gym Registration - Complete Setup" style={{ marginBottom: 24 }}>
          <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
          
          <Form form={form} onFinish={onFinishRegistration} layout="vertical">
            {/* Step 1: Business Information */}
            {currentStep === 0 && (
              <div>
                <h2 style={{ color: '#1890ff', marginBottom: 24 }}><BankOutlined /> Business Information</h2>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="gym_name" label="Official Gym Name" rules={[{ required: true }]}>
                      <Input size="large" placeholder="Legal business name" />
                    </Form.Item>
                    
                    <Form.Item name="owner_full_name" label="Owner Full Name" rules={[{ required: true }]}>
                      <Input size="large" placeholder="Full legal name" />
                    </Form.Item>
                    
                    <Form.Item name="business_email" label="Business Email" rules={[{ required: true, type: 'email' }]}>
                      <Input size="large" placeholder="business@gym.com" />
                    </Form.Item>
                    
                    <Form.Item name="business_phone_number" label="Business Phone" rules={[{ required: true }]}>
                      <Input size="large" placeholder="+91-9876543210" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="registered_address" label="Registered Address" rules={[{ required: true }]}>
                      <Input.TextArea rows={4} placeholder="Complete business address" />
                    </Form.Item>
                    
                    <Form.Item name="gst_number" label="GST Number">
                      <Input size="large" placeholder="27ABCDE1234F1Z5" />
                    </Form.Item>
                    
                    <Form.Item name="pan_number" label="PAN Number">
                      <Input size="large" placeholder="ABCDE1234F" />
                    </Form.Item>
                    
                    <Form.Item name="plan_type" label="Subscription Plan" rules={[{ required: true }]}>
                      <Select size="large" placeholder="Choose plan">
                        <Option value="basic">Basic - ₹999/month</Option>
                        <Option value="premium">Premium - ₹1999/month</Option>
                        <Option value="enterprise">Enterprise - ₹2999/month</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}

            {/* Step 2: Gym Details */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ color: '#1890ff', marginBottom: 24 }}><EnvironmentOutlined /> Gym Details & Location</h2>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="gym_display_name" label="Display Name" rules={[{ required: true }]}>
                      <Input size="large" placeholder="Customer-facing name" />
                    </Form.Item>
                    
                    <Form.Item name="description" label="Short Description">
                      <Input.TextArea rows={3} placeholder="Brief gym description" />
                    </Form.Item>
                    
                    <Form.Item name="about" label="About Your Gym">
                      <Input.TextArea rows={4} placeholder="Detailed information" />
                    </Form.Item>
                    
                    <Form.Item label="Location" required>
                      <Input.Group compact>
                        <Form.Item name={['location', 'city']} style={{ width: '40%' }} rules={[{ required: true }]}>
                          <Input placeholder="City" />
                        </Form.Item>
                        <Form.Item name={['location', 'state']} style={{ width: '30%' }} rules={[{ required: true }]}>
                          <Input placeholder="State" />
                        </Form.Item>
                        <Form.Item name={['location', 'pin']} style={{ width: '30%' }} rules={[{ required: true }]}>
                          <Input placeholder="PIN" />
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="amenities_list" label="Amenities">
                      <Checkbox.Group style={{ width: '100%' }}>
                        <Row>
                          <Col span={12}><Checkbox value="AC">Air Conditioning</Checkbox></Col>
                          <Col span={12}><Checkbox value="Steam">Steam Room</Checkbox></Col>
                          <Col span={12}><Checkbox value="Cardio">Cardio Equipment</Checkbox></Col>
                          <Col span={12}><Checkbox value="Weights">Weight Training</Checkbox></Col>
                          <Col span={12}><Checkbox value="Pool">Swimming Pool</Checkbox></Col>
                          <Col span={12}><Checkbox value="Parking">Parking</Checkbox></Col>
                          <Col span={12}><Checkbox value="Locker">Lockers</Checkbox></Col>
                          <Col span={12}><Checkbox value="Shower">Showers</Checkbox></Col>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                    
                    <Form.Item name="services_offered" label="Services">
                      <Checkbox.Group style={{ width: '100%' }}>
                        <Row>
                          <Col span={12}><Checkbox value="Personal Training">Personal Training</Checkbox></Col>
                          <Col span={12}><Checkbox value="Group Classes">Group Classes</Checkbox></Col>
                          <Col span={12}><Checkbox value="Yoga">Yoga</Checkbox></Col>
                          <Col span={12}><Checkbox value="Zumba">Zumba</Checkbox></Col>
                          <Col span={12}><Checkbox value="Nutrition">Nutrition</Checkbox></Col>
                          <Col span={12}><Checkbox value="Physiotherapy">Physiotherapy</Checkbox></Col>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}

            {/* Step 3: Media & Operating Hours */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ color: '#1890ff', marginBottom: 24 }}><CameraOutlined /> Media & Operating Hours</h2>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="Gym Logo">
                      <FileUpload
                        gymId={gym?._id || 'temp'}
                        category="logo"
                        fileList={logoFileList}
                        setFileList={setLogoFileList}
                        maxCount={1}
                        token={token}
                        gymName={form.getFieldValue('gym_display_name') || form.getFieldValue('gym_name')}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    </Form.Item>
                    
                    <Form.Item label="Banner Images">
                      <FileUpload
                        gymId={gym?._id || 'temp'}
                        category="banners"
                        fileList={bannerFileList}
                        setFileList={setBannerFileList}
                        maxCount={3}
                        token={token}
                        gymName={form.getFieldValue('gym_display_name') || form.getFieldValue('gym_name')}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    </Form.Item>
                    
                    <Form.Item label="Gallery Images">
                      <FileUpload
                        gymId={gym?._id || 'temp'}
                        category="gallery"
                        fileList={galleryFileList}
                        setFileList={setGalleryFileList}
                        maxCount={10}
                        token={token}
                        gymName={form.getFieldValue('gym_display_name') || form.getFieldValue('gym_name')}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <h3><ClockCircleOutlined /> Operating Hours</h3>
                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const dayKey = day.toLowerCase();
                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, padding: '8px 0' }}>
                            <div style={{ width: 80, fontWeight: 500 }}>{day}</div>
                            <Form.Item name={['opening_hours', dayKey, 'closed']} valuePropName="checked" style={{ margin: 0, marginRight: 16 }}>
                              <Switch size="small" />
                            </Form.Item>
                            <Form.Item 
                              noStyle 
                              shouldUpdate={(prev, curr) => prev.opening_hours?.[dayKey]?.closed !== curr.opening_hours?.[dayKey]?.closed}
                            >
                              {({ getFieldValue }) => {
                                const isClosed = getFieldValue(['opening_hours', dayKey, 'closed']);
                                return !isClosed ? (
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Form.Item name={['opening_hours', dayKey, 'open']} style={{ margin: 0 }}>
                                      <TimePicker format="HH:mm" placeholder="Open" size="small" />
                                    </Form.Item>
                                    <span>to</span>
                                    <Form.Item name={['opening_hours', dayKey, 'close']} style={{ margin: 0 }}>
                                      <TimePicker format="HH:mm" placeholder="Close" size="small" />
                                    </Form.Item>
                                  </div>
                                ) : (
                                  <span style={{ color: '#999', fontStyle: 'italic' }}>Closed</span>
                                );
                              }}
                            </Form.Item>
                          </div>
                        );
                      })}
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Step 4: Online Presence */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ color: '#1890ff', marginBottom: 24 }}><GlobalOutlined /> Online Presence & Settings</h2>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name={['social_media_links', 'website']} label="Website">
                      <Input size="large" placeholder="https://yourgym.com" />
                    </Form.Item>
                    
                    <Form.Item name={['social_media_links', 'facebook']} label="Facebook">
                      <Input size="large" placeholder="https://facebook.com/yourgym" />
                    </Form.Item>
                    
                    <Form.Item name={['social_media_links', 'instagram']} label="Instagram">
                      <Input size="large" placeholder="https://instagram.com/yourgym" />
                    </Form.Item>
                    
                    <Form.Item name={['social_media_links', 'youtube']} label="YouTube">
                      <Input size="large" placeholder="https://youtube.com/yourgym" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <h3>Booking Preferences</h3>
                    <Form.Item name={['booking_options', 'walk_in']} valuePropName="checked" initialValue={true}>
                      <Checkbox>Allow Walk-in Customers</Checkbox>
                    </Form.Item>
                    
                    <Form.Item name={['booking_options', 'online']} valuePropName="checked" initialValue={true}>
                      <Checkbox>Enable Online Booking</Checkbox>
                    </Form.Item>
                    
                    <div style={{ marginTop: 32, padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
                      <h4>Registration Summary</h4>
                      <p>• Business information completed</p>
                      <p>• Gym details and location set</p>
                      <p>• Media and hours configured</p>
                      <p>• Online presence established</p>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Space size="large">
                {currentStep > 0 && (
                  <Button size="large" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="primary" size="large" onClick={nextStep}>
                    Next Step
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="primary" size="large" htmlType="submit">
                    Complete Registration
                  </Button>
                )}
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EnvironmentOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Gym Management</span>
          </div>
        }
        extra={
          <Space>
            <div className={`status-badge ${gym.status === 'approved' ? 'success' : 'warning'}`}>
              {gym.status?.toUpperCase()}
            </div>
            <div className={`status-badge ${gym.verified ? 'success' : 'error'}`}>
              {gym.verified ? 'VERIFIED' : 'UNVERIFIED'}
            </div>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Basic Details" key="1">
            <Form form={form} onFinish={onFinishUpdate} layout="vertical">
              <Row gutter={[24, 16]}>
                <Col xs={24} lg={12}>
                  <Form.Item name="gym_display_name" label="Display Name">
                    <Input size="large" placeholder="Name shown to customers" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item label="Location">
                    <Input.Group compact>
                      <Form.Item name={['location', 'city']} style={{ width: '40%' }}>
                        <Input placeholder="City" />
                      </Form.Item>
                      <Form.Item name={['location', 'state']} style={{ width: '30%' }}>
                        <Input placeholder="State" />
                      </Form.Item>
                      <Form.Item name={['location', 'pin']} style={{ width: '30%' }}>
                        <Input placeholder="PIN" />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Brief description of your gym" />
              </Form.Item>
              
              <Form.Item name="about" label="About">
                <Input.TextArea rows={4} placeholder="Detailed information about your gym" />
              </Form.Item>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} lg={12}>
                  <Form.Item name="amenities_list" label="Amenities">
                    <Select mode="tags" placeholder="Add amenities" size="large">
                      <Option value="AC">Air Conditioning</Option>
                      <Option value="Steam">Steam Room</Option>
                      <Option value="Cardio">Cardio Equipment</Option>
                      <Option value="Weights">Weight Training</Option>
                      <Option value="Pool">Swimming Pool</Option>
                      <Option value="Parking">Parking</Option>
                      <Option value="Locker">Lockers</Option>
                      <Option value="Shower">Showers</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item name="services_offered" label="Services">
                    <Select mode="tags" placeholder="Services offered" size="large">
                      <Option value="Personal Training">Personal Training</Option>
                      <Option value="Group Classes">Group Classes</Option>
                      <Option value="Yoga">Yoga</Option>
                      <Option value="Zumba">Zumba</Option>
                      <Option value="Nutrition">Nutrition Counseling</Option>
                      <Option value="Physiotherapy">Physiotherapy</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item style={{ marginTop: 32 }}>
                <Button type="primary" htmlType="submit" size="large">
                  Update Details
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Operating Hours" key="2">
            <Form form={form} onFinish={onFinishUpdate} layout="vertical">
              <Card title="Weekly Schedule" size="small">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const dayKey = day.toLowerCase();
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ width: 100, fontWeight: 500 }}>{day}</div>
                      <Form.Item name={['opening_hours', dayKey, 'closed']} valuePropName="checked" style={{ margin: 0, marginRight: 20 }}>
                        <Switch checkedChildren="Closed" unCheckedChildren="Open" />
                      </Form.Item>
                      <Form.Item 
                        noStyle 
                        shouldUpdate={(prev, curr) => prev.opening_hours?.[dayKey]?.closed !== curr.opening_hours?.[dayKey]?.closed}
                      >
                        {({ getFieldValue }) => {
                          const isClosed = getFieldValue(['opening_hours', dayKey, 'closed']);
                          return !isClosed ? (
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <Form.Item name={['opening_hours', dayKey, 'open']} style={{ margin: 0 }}>
                                <TimePicker format="HH:mm" placeholder="Opening time" />
                              </Form.Item>
                              <span style={{ color: '#666' }}>to</span>
                              <Form.Item name={['opening_hours', dayKey, 'close']} style={{ margin: 0 }}>
                                <TimePicker format="HH:mm" placeholder="Closing time" />
                              </Form.Item>
                            </div>
                          ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>Closed all day</span>
                          );
                        }}
                      </Form.Item>
                    </div>
                  );
                })}
              </Card>
              
              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" size="large">
                  Update Operating Hours
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Media & Social" key="3">
            <Form form={form} onFinish={onFinishUpdate} layout="vertical">
              <Form.Item label="Gym Logo">
                <FileUpload
                  gymId={gym._id}
                  category="logo"
                  fileList={logoFileList}
                  setFileList={setLogoFileList}
                  maxCount={1}
                  token={token}
                  gymName={gym.gym_display_name || gym.gym_name}
                  onUploadSuccess={handleUploadSuccess}
                />
              </Form.Item>
              
              <Form.Item label="Banner Images">
                <FileUpload
                  gymId={gym._id}
                  category="banners"
                  fileList={bannerFileList}
                  setFileList={setBannerFileList}
                  maxCount={3}
                  token={token}
                  gymName={gym.gym_display_name || gym.gym_name}
                  onUploadSuccess={handleUploadSuccess}
                />
              </Form.Item>
              
              <Form.Item label="Gallery Images">
                <FileUpload
                  gymId={gym._id}
                  category="gallery"
                  fileList={galleryFileList}
                  setFileList={setGalleryFileList}
                  maxCount={10}
                  token={token}
                  gymName={gym.gym_display_name || gym.gym_name}
                  onUploadSuccess={handleUploadSuccess}
                />
              </Form.Item>
              
              <Form.Item label="Social Media">
                <Form.Item name={['social_media_links', 'facebook']}>
                  <Input placeholder="Facebook URL" />
                </Form.Item>
                <Form.Item name={['social_media_links', 'instagram']}>
                  <Input placeholder="Instagram URL" />
                </Form.Item>
                <Form.Item name={['social_media_links', 'website']}>
                  <Input placeholder="Website URL" />
                </Form.Item>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Media
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default GymSetup;