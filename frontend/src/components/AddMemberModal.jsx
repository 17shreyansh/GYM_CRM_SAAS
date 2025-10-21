import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Row, Col, Radio, DatePicker, InputNumber, Divider, message } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;
const { TextArea } = Input;

const AddMemberModal = ({ visible, onCancel, onSuccess, users, plans }) => {
  const [form] = Form.useForm();
  const [memberType, setMemberType] = useState('online');
  const [planType, setPlanType] = useState('predefined');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setMemberType('online');
      setPlanType('predefined');
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        memberType,
        planType,
        joinMethod: values.joinMethod,
        paymentStatus: values.paymentStatus
      };

      if (memberType === 'online') {
        payload.userId = values.userId;
      } else {
        payload.offlineDetails = {
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
          emergencyContact: values.emergencyContact,
          dateOfBirth: values.dateOfBirth?.toDate(),
          healthInfo: values.healthInfo
        };
      }

      if (planType === 'predefined') {
        payload.planId = values.planId;
      } else {
        payload.customPlan = {
          name: values.customPlanName,
          price: values.customPrice,
          duration: values.customDuration,
          description: values.customDescription
        };
      }

      await api.post('/gym/members', payload);
      message.success('Member added successfully');
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add member');
    }
    setLoading(false);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined style={{ color: 'var(--primary-color)' }} />
          <span>Add New Member</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: '24px' }}>
        {/* Member Type Selection */}
        <Form.Item label="Member Type">
          <Radio.Group value={memberType} onChange={(e) => setMemberType(e.target.value)}>
            <Radio.Button value="online">
              <UserOutlined /> Online Member
            </Radio.Button>
            <Radio.Button value="offline">
              <TeamOutlined /> Offline Member
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Online Member Fields */}
        {memberType === 'online' && (
          <Form.Item 
            name="userId" 
            label="Select User" 
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select 
              placeholder="Select user to add as member"
              size="large"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.name} - {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Offline Member Fields */}
        {memberType === 'offline' && (
          <>
            <Divider orientation="left">Member Details</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="name" 
                  label="Full Name" 
                  rules={[{ required: true, message: 'Please enter member name' }]}
                >
                  <Input placeholder="Enter full name" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="phone" 
                  label="Phone Number" 
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                  ]}
                >
                  <Input placeholder="Enter phone number" size="large" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="Email (Optional)">
                  <Input placeholder="Enter email address" size="large" type="email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dateOfBirth" label="Date of Birth (Optional)">
                  <DatePicker placeholder="Select date of birth" size="large" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="address" label="Address (Optional)">
              <TextArea placeholder="Enter address" rows={2} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="emergencyContact" label="Emergency Contact (Optional)">
                  <Input placeholder="Emergency contact number" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="healthInfo" label="Health Info (Optional)">
                  <Input placeholder="Any health conditions" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Divider orientation="left">Plan Selection</Divider>

        {/* Plan Type Selection */}
        <Form.Item label="Plan Type">
          <Radio.Group value={planType} onChange={(e) => setPlanType(e.target.value)}>
            <Radio.Button value="predefined">
              <CalendarOutlined /> Predefined Plan
            </Radio.Button>
            <Radio.Button value="custom">
              <DollarOutlined /> Custom Plan
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Predefined Plan Selection */}
        {planType === 'predefined' && (
          <Form.Item 
            name="planId" 
            label="Select Plan" 
            rules={[{ required: true, message: 'Please select a plan' }]}
          >
            <Select 
              placeholder="Select membership plan"
              size="large"
            >
              {plans.map(plan => (
                <Option key={plan._id} value={plan._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{plan.name}</span>
                    <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>
                      ₹{plan.price.toLocaleString()} ({plan.duration} days)
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Custom Plan Fields */}
        {planType === 'custom' && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="customPlanName" 
                  label="Plan Name" 
                  rules={[{ required: true, message: 'Please enter plan name' }]}
                >
                  <Input placeholder="Enter plan name" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="customPrice" 
                  label="Price (₹)" 
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber 
                    placeholder="Enter price" 
                    size="large" 
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="customDuration" 
                  label="Duration (Days)" 
                  rules={[{ required: true, message: 'Please enter duration' }]}
                >
                  <InputNumber 
                    placeholder="Enter duration in days" 
                    size="large" 
                    style={{ width: '100%' }}
                    min={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="customDescription" label="Description (Optional)">
                  <Input placeholder="Plan description" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Divider orientation="left">Payment Details</Divider>

        {/* Payment Details */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="joinMethod" 
              label="Join Method" 
              rules={[{ required: true, message: 'Please select join method' }]}
            >
              <Select placeholder="Select join method" size="large">
                <Option value="cash">Cash Payment</Option>
                <Option value="online">Online Payment</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="paymentStatus" 
              label="Payment Status" 
              rules={[{ required: true, message: 'Please select payment status' }]}
            >
              <Select placeholder="Select payment status" size="large">
                <Option value="paid">Paid</Option>
                <Option value="unpaid">Unpaid</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Form Actions */}
        <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Add Member
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMemberModal;