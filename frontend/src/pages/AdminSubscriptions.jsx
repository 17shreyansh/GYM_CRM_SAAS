import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AdminSubscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscription/admin/plans');
      setPlans(response.data.plans);
    } catch (error) {
      message.error('Failed to fetch plans');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Submitting values:', values);
      if (editingPlan) {
        await api.patch(`/subscription/admin/plans/${editingPlan._id}`, values);
        message.success('Plan updated successfully');
      } else {
        await api.post('/subscription/admin/plans', values);
        message.success('Plan created successfully');
      }
      fetchPlans();
      handleCancel();
    } catch (error) {
      console.error('Submit error:', error.response?.data);
      message.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      ...plan,
      features: plan.features ? plan.features.join(', ') : ''
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Plan',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await api.delete(`/subscription/admin/plans/${id}`);
          message.success('Plan deleted');
          fetchPlans();
        } catch (error) {
          message.error('Failed to delete plan');
        }
      }
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingPlan(null);
    form.resetFields();
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price (₹)', dataIndex: 'price', key: 'price', render: (price) => `₹${price}` },
    { title: 'Duration (days)', dataIndex: 'duration', key: 'duration' },
    { title: 'Member Limit', dataIndex: 'member_limit', key: 'member_limit', render: (limit) => limit === 0 ? 'Unlimited' : limit },
    { title: 'Type', dataIndex: 'is_trial', key: 'is_trial', render: (isTrial) => isTrial ? <Tag color="green">Trial</Tag> : <Tag color="blue">Regular</Tag> },
    { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (active) => active ? 'Yes' : 'No' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card 
        title="Subscription Plans Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Add Plan
          </Button>
        }
      >
        <Table columns={columns} dataSource={plans} rowKey="_id" loading={loading} />
      </Card>

      <Modal
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Plan Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="Duration (days)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="member_limit" label="Member Limit (0 = unlimited)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="features" label="Features (comma separated)">
            <Input.TextArea rows={3} placeholder="Feature 1, Feature 2, Feature 3" />
          </Form.Item>
          <Form.Item name="is_trial" label="Trial Plan" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSubscriptions;