import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, Upload, message, Table, Row, Col, Avatar, Tag, Tabs } from 'antd';
import { UploadOutlined, UserOutlined, CreditCardOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const MemberProfile = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPayments();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      form.setFieldsValue({
        ...response.data,
        dateOfBirth: response.data.dateOfBirth ? dayjs(response.data.dateOfBirth) : null
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/user/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const onFinish = async (values) => {
    try {
      await api.put('/user/profile', {
        ...values,
        dateOfBirth: values.dateOfBirth?.toISOString()
      });
      message.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    setUploading(true);
    try {
      const response = await api.post('/user/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Photo uploaded successfully');
      fetchProfile();
    } catch (error) {
      message.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload
  };

  const paymentColumns = [
    { title: 'Date', dataIndex: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { title: 'Gym', dataIndex: ['gym', 'name'] },
    { title: 'Amount', dataIndex: 'amount', render: (amount) => `₹${amount}` },
    { title: 'Method', dataIndex: 'source', render: (source) => (
      <Tag color={source === 'razorpay' ? 'blue' : 'green'}>
        {source === 'razorpay' ? 'Online' : 'Cash'}
      </Tag>
    )},
    { title: 'Status', dataIndex: 'status', render: (status) => (
      <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
        {status}
      </Tag>
    )}
  ];

  return (
    <div>
      <Row gutter={24}>
        <Col span={8}>
          <Card title="Profile Picture" style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar 
              size={120} 
              src={profile.photo} 
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <br />
            <Upload
              beforeUpload={handlePhotoUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? 'Uploading...' : 'Change Photo'}
              </Button>
            </Upload>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title="Personal Information">
            <Tabs defaultActiveKey="1">
              <TabPane tab={<span><UserOutlined />Profile</span>} key="1">
                <Form form={form} onFinish={onFinish} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="email" label="Email">
                        <Input disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="phone" label="Phone Number">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="dateOfBirth" label="Date of Birth">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item name="healthInfo" label="Health Information">
                    <Input.TextArea 
                      rows={4}
                      placeholder="Any health conditions, allergies, medical history, etc."
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Update Profile
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane tab={<span><CreditCardOutlined />Payment History</span>} key="2">
                <Table 
                  dataSource={payments} 
                  columns={paymentColumns} 
                  rowKey="_id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberProfile;