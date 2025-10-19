import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, Upload, message, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import dayjs from 'dayjs';

const MemberProfile = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchPayments();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
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
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  const paymentColumns = [
    { title: 'Date', dataIndex: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { title: 'Gym', dataIndex: ['gym', 'name'] },
    { title: 'Amount', dataIndex: 'amount', render: (amount) => `₹${amount}` },
    { title: 'Source', dataIndex: 'source' },
    { title: 'Status', dataIndex: 'status' }
  ];

  return (
    <div>
      <Card title="Profile" style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={onFinish} layout="vertical" initialValues={user}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          
          <Form.Item name="dateOfBirth" label="Date of Birth">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="healthInfo" label="Health Information">
            <Input.TextArea placeholder="Any health conditions, allergies, etc." />
          </Form.Item>
          
          <Form.Item name="photo" label="Profile Photo">
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Payment History">
        <Table dataSource={payments} columns={paymentColumns} rowKey="_id" />
      </Card>
    </div>
  );
};

export default MemberProfile;