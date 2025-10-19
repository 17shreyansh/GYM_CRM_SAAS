import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Space, Tag, message, Row, Col, Statistic, Empty, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const PlanManagement = () => {
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
      const response = await api.get('/gym/plans');
      setPlans(response.data.plans);
    } catch (error) {
      message.error('Failed to fetch plans');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPlan) {
        await api.patch(`/gym/plans/${editingPlan._id}`, values);
        message.success('Plan updated successfully');
      } else {
        await api.post('/gym/plans', values);
        message.success('Plan created successfully');
      }
      fetchPlans();
      handleCancel();
    } catch (error) {
      message.error('Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue(plan);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Plan',
      content: 'Are you sure you want to delete this plan? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/gym/plans/${id}`);
          message.success('Plan deleted successfully');
          fetchPlans();
        } catch (error) {
          message.error('Failed to delete plan');
        }
      }
    });
  };

  const toggleStatus = async (plan) => {
    try {
      await api.patch(`/gym/plans/${plan._id}`, { ...plan, isActive: !plan.isActive });
      message.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchPlans();
    } catch (error) {
      message.error('Failed to update plan status');
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingPlan(null);
    form.resetFields();
  };

  const getStats = () => {
    const totalPlans = plans.length;
    const activePlans = plans.filter(plan => plan.isActive).length;
    const avgPrice = plans.length > 0 ? Math.round(plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length) : 0;
    const avgDuration = plans.length > 0 ? Math.round(plans.reduce((sum, plan) => sum + plan.duration, 0) / plans.length) : 0;
    
    return { totalPlans, activePlans, avgPrice, avgDuration };
  };

  const stats = getStats();

  const columns = [
    {
      title: 'Plan Details',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {text}
          </div>
          {record.description && (
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {record.description}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarOutlined style={{ color: 'var(--success-color)' }} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>₹{price.toLocaleString()}</span>
        </div>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CalendarOutlined style={{ color: 'var(--primary-color)' }} />
          <span style={{ fontWeight: 500 }}>{duration} days</span>
        </div>
      ),
      sorter: (a, b) => a.duration - b.duration
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag 
          color={isActive ? 'success' : 'error'} 
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
          style={{ borderRadius: '20px', padding: '4px 12px' }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      onFilter: (value, record) => record.isActive === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Plan">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              style={{ borderRadius: '6px' }}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deactivate Plan' : 'Activate Plan'}>
            <Button 
              size="small" 
              type={record.isActive ? 'default' : 'primary'}
              icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => toggleStatus(record)}
              style={{ borderRadius: '6px' }}
            >
              {record.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </Tooltip>
          <Tooltip title="Delete Plan">
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record._id)}
              style={{ borderRadius: '6px' }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Stats Overview */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <FileTextOutlined />
            </div>
            <div className="stat-value">{stats.totalPlans}</div>
            <div className="stat-label">Total Plans</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircleOutlined />
            </div>
            <div className="stat-value">{stats.activePlans}</div>
            <div className="stat-label">Active Plans</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <DollarOutlined />
            </div>
            <div className="stat-value">₹{stats.avgPrice}</div>
            <div className="stat-label">Avg. Price</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon secondary">
              <CalendarOutlined />
            </div>
            <div className="stat-value">{stats.avgDuration}</div>
            <div className="stat-label">Avg. Duration (days)</div>
          </div>
        </Col>
      </Row>

      {/* Plans Table */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Membership Plans</span>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
            style={{ borderRadius: '8px' }}
          >
            Add New Plan
          </Button>
        }
      >
        {plans.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  No membership plans created yet
                </p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setModalVisible(true)}
                >
                  Create Your First Plan
                </Button>
              </div>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={plans} 
            rowKey="_id" 
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} plans`
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {/* Create/Edit Plan Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: 'var(--primary-color)' }} />
            <span>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="name" 
                label="Plan Name" 
                rules={[{ required: true, message: 'Please enter plan name' }]}
              >
                <Input 
                  placeholder="e.g., Monthly Premium, Annual Basic" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="price" 
                label="Price (₹)" 
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter price" 
                  size="large"
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="duration" 
                label="Duration (days)" 
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="Enter duration" 
                  size="large"
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Description">
            <Input.TextArea 
              rows={4} 
              placeholder="Describe what's included in this plan, benefits, restrictions, etc." 
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} size="large">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanManagement;