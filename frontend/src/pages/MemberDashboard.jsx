import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Table, Tag, message, Statistic, Space } from 'antd';
import { PlusOutlined, CalendarOutlined, CreditCardOutlined } from '@ant-design/icons';
import api from '../utils/api';

const MemberDashboard = () => {
  const [memberships, setMemberships] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [gymModal, setGymModal] = useState(false);
  const [planModal, setPlanModal] = useState(false);
  const [stats, setStats] = useState({ active: 0, expiring: 0 });

  useEffect(() => {
    fetchMemberships();
    fetchGyms();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await api.get('/user/memberships');
      setMemberships(response.data);
      
      // Calculate stats
      const active = response.data.filter(m => m.status === 'active').length;
      const expiring = response.data.filter(m => {
        if (!m.endDate) return false;
        const endDate = new Date(m.endDate);
        const today = new Date();
        const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
      }).length;
      
      setStats({ active, expiring });
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
    }
  };

  const fetchGyms = async () => {
    try {
      const response = await api.get('/user/gyms');
      setGyms(response.data);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  const fetchPlans = async (gymId) => {
    try {
      const response = await api.get(`/user/gyms/${gymId}/plans`);
      setPlans(response.data);
      setPlanModal(true);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const joinGym = async (gymId, planId, joinMethod) => {
    try {
      await api.post('/user/join', { gymId, planId, joinMethod });
      message.success(joinMethod === 'cash' ? 'Request sent to gym owner' : 'Joined successfully');
      setPlanModal(false);
      fetchMemberships();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to join gym');
    }
  };

  const renewMembership = async (membershipId) => {
    try {
      await api.post(`/user/renew/${membershipId}`);
      message.success('Membership renewed successfully');
      fetchMemberships();
    } catch (error) {
      message.error('Failed to renew membership');
    }
  };

  const membershipColumns = [
    { title: 'Gym', dataIndex: ['gym', 'name'], key: 'gym' },
    { title: 'Plan', dataIndex: ['plan', 'name'], key: 'plan' },
    { title: 'Price', dataIndex: ['plan', 'price'], key: 'price', render: (price) => `₹${price}` },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => <Tag color={status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'red'}>{status}</Tag>
    },
    { title: 'Join Method', dataIndex: 'joinMethod', key: 'joinMethod' },
    { title: 'Expiry', dataIndex: 'endDate', key: 'endDate',
      render: (date) => {
        if (!date) return 'N/A';
        const endDate = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return (
          <span style={{ color: diffDays <= 7 ? '#ff4d4f' : 'inherit' }}>
            {endDate.toLocaleDateString()}
            {diffDays <= 7 && diffDays > 0 && ` (${diffDays} days left)`}
          </span>
        );
      }
    },
    { title: 'Actions', key: 'actions',
      render: (_, record) => (
        record.status === 'active' && (
          <Button size="small" onClick={() => renewMembership(record._id)}>
            Renew
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Active Memberships" value={stats.active} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Expiring Soon" value={stats.expiring} prefix={<CalendarOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Gyms Available" value={gyms.length} prefix={<PlusOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Memberships Table */}
      <Card title="My Memberships" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setGymModal(true)}>
          Join New Gym
        </Button>
      } style={{ marginBottom: 24 }}>
        <Table dataSource={memberships} columns={membershipColumns} rowKey="_id" />
      </Card>

      {/* Gym Discovery Modal */}
      <Modal title="Discover Gyms" open={gymModal} onCancel={() => setGymModal(false)} footer={null} width={800}>
        <Row gutter={16}>
          {gyms.map(gym => (
            <Col span={12} key={gym._id} style={{ marginBottom: 16 }}>
              <Card
                title={gym.name}
                extra={<Button type="primary" onClick={() => {
                  setSelectedGym(gym);
                  setGymModal(false);
                  fetchPlans(gym._id);
                }}>
                  View Plans
                </Button>}
              >
                <p><strong>Address:</strong> {gym.address}</p>
                <p><strong>Hours:</strong> {gym.operatingHours?.open} - {gym.operatingHours?.close}</p>
                {gym.phone && <p><strong>Phone:</strong> {gym.phone}</p>}
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Plan Selection Modal */}
      <Modal title={`Choose Plan - ${selectedGym?.name}`} open={planModal} onCancel={() => setPlanModal(false)} footer={null} width={600}>
        <Row gutter={16}>
          {plans.map(plan => (
            <Col span={24} key={plan._id} style={{ marginBottom: 16 }}>
              <Card
                title={plan.name}
                extra={
                  <Space>
                    <Button type="primary" icon={<CreditCardOutlined />} onClick={async () => {
                      try {
                        const { initiatePayment } = await import('../utils/payment');
                        await initiatePayment(selectedGym._id, plan._id);
                        message.success('Payment successful');
                        setPlanModal(false);
                        fetchMemberships();
                      } catch (error) {
                        message.error('Payment failed');
                      }
                    }}>
                      Pay ₹{plan.price}
                    </Button>
                    <Button onClick={() => joinGym(selectedGym._id, plan._id, 'cash')}>
                      Pay in Cash
                    </Button>
                  </Space>
                }
              >
                <p>{plan.description}</p>
                <p><strong>Duration:</strong> {plan.duration} days</p>
                <p><strong>Price:</strong> ₹{plan.price}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default MemberDashboard;