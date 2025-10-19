import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Alert } from 'antd';
import { CalendarOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const GymSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/gym/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (subscription) => {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const isActive = endDate > now;
    
    return (
      <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
        {isActive ? 'ACTIVE' : 'EXPIRED'}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Plan',
      dataIndex: ['plan_id', 'name'],
      key: 'plan_name',
      render: (name) => name || 'Unknown Plan'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getStatusTag(record)
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Your Subscriptions</h2>
        <Button type="primary" onClick={() => navigate('/gym-owner-register')}>
          Buy New Plan
        </Button>
      </div>

      {subscriptions.length === 0 && !loading && (
        <Alert
          message="No Subscriptions Found"
          description="You haven't purchased any subscription plans yet. Click 'Buy New Plan' to get started."
          type="info"
          showIcon
          icon={<CalendarOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={subscriptions}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default GymSubscriptions;