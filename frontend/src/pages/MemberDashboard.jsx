import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Table, Tag, message } from 'antd';
import api from '../utils/api';

const MemberDashboard = () => {
  const [memberships, setMemberships] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [gymModal, setGymModal] = useState(false);
  const [planModal, setPlanModal] = useState(false);

  useEffect(() => {
    fetchMemberships();
    fetchGyms();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await api.get('/user/memberships');
      setMemberships(response.data);
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

  const membershipColumns = [
    { title: 'Gym', dataIndex: ['gym', 'name'], key: 'gym' },
    { title: 'Plan', dataIndex: ['plan', 'name'], key: 'plan' },
    { title: 'Price', dataIndex: ['plan', 'price'], key: 'price', render: (price) => `₹${price}` },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => <Tag color={status === 'active' ? 'green' : 'orange'}>{status}</Tag>
    },
    { title: 'Join Method', dataIndex: 'joinMethod', key: 'joinMethod' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    }
  ];

  return (
    <div>
      <Card title="My Memberships" extra={
        <Button type="primary" onClick={() => setGymModal(true)}>
          Join New Gym
        </Button>
      } style={{ marginBottom: 24 }}>
        <Table dataSource={memberships} columns={membershipColumns} rowKey="_id" />
      </Card>

      <Modal title="Available Gyms" open={gymModal} onCancel={() => setGymModal(false)} footer={null} width={800}>
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
                <p>{gym.address}</p>
                <p>Hours: {gym.operatingHours?.open} - {gym.operatingHours?.close}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      <Modal title={`Plans - ${selectedGym?.name}`} open={planModal} onCancel={() => setPlanModal(false)} footer={null}>
        <Row gutter={16}>
          {plans.map(plan => (
            <Col span={24} key={plan._id} style={{ marginBottom: 16 }}>
              <Card
                title={plan.name}
                extra={
                  <div>
                    <Button type="primary" onClick={async () => {
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
                    <Button style={{ marginLeft: 8 }} onClick={() => joinGym(selectedGym._id, plan._id, 'cash')}>
                      Pay in Cash
                    </Button>
                  </div>
                }
              >
                <p>{plan.description}</p>
                <p>Duration: {plan.duration} days</p>
                <p>Price: ₹{plan.price}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default MemberDashboard;