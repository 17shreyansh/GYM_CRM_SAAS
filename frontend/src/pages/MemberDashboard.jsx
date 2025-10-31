import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Table, Tag, message, Statistic, Space, Alert } from 'antd';
import { PlusOutlined, CalendarOutlined, CreditCardOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const MemberDashboard = () => {
  const navigate = useNavigate();
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
      message.success('Membership request created! Please proceed with payment.');
      // Redirect to payment page
      navigate(`/payment/${gymId}/${planId}`);
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
      render: (status) => {
        const colors = {
          active: 'green',
          pending: 'orange', 
          rejected: 'red',
          suspended: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    { title: 'Payment', dataIndex: 'paymentStatus', key: 'paymentStatus',
      render: (paymentStatus) => {
        const colors = {
          paid: 'green',
          unpaid: 'red',
          pending_verification: 'orange'
        };
        const labels = {
          paid: 'Paid',
          unpaid: 'Unpaid', 
          pending_verification: 'Pending Verification'
        };
        return <Tag color={colors[paymentStatus] || 'default'}>{labels[paymentStatus] || paymentStatus}</Tag>;
      }
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
      {/* Testing Phase Banner */}
      <Alert
        message="Share Your Feedback!"
        description={
          <div>
            <p style={{ margin: '8px 0' }}>
              We're continuously improving your gym experience. Found an issue or have a feature idea? 
              Let us know through our support system - we'll implement it quickly!
            </p>
            <Button 
              type="link" 
              size="small" 
              onClick={() => navigate('/support')}
              style={{ padding: 0, height: 'auto' }}
            >
              📝 Submit Feedback
            </Button>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Modern Stats Cards */}
      <div className="mobile-stats-grid">
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon">
            <CalendarOutlined />
          </div>
          <div className="mobile-stat-value">{stats.active}</div>
          <div className="mobile-stat-label">Active Memberships</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon" style={{ background: 'var(--warning-color)' }}>
            <CalendarOutlined />
          </div>
          <div className="mobile-stat-value" style={{ color: 'var(--warning-color)' }}>{stats.expiring}</div>
          <div className="mobile-stat-label">Expiring Soon</div>
        </div>
        <div className="mobile-stat-card gradient-card">
          <div className="mobile-stat-icon">
            <PlusOutlined />
          </div>
          <div className="mobile-stat-value">{gyms.length}</div>
          <div className="mobile-stat-label">Gyms Available</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mobile-action-grid">
        <div className="mobile-action-card" onClick={() => setGymModal(true)}>
          <div className="mobile-action-icon">
            <PlusOutlined />
          </div>
          <div className="mobile-action-title">Join New Gym</div>
        </div>
        <div className="mobile-action-card" onClick={() => navigate('/payments')}>
          <div className="mobile-action-icon">
            <CreditCardOutlined />
          </div>
          <div className="mobile-action-title">Payment History</div>
        </div>
        <div className="mobile-action-card" onClick={() => navigate('/attendance')}>
          <div className="mobile-action-icon">
            <CalendarOutlined />
          </div>
          <div className="mobile-action-title">Attendance</div>
        </div>
        <div className="mobile-action-card" onClick={() => navigate('/support')}>
          <div className="mobile-action-icon">
            <BellOutlined />
          </div>
          <div className="mobile-action-title">Support</div>
        </div>
      </div>

      {/* Memberships Table */}
      <Card title="My Memberships" style={{ marginBottom: 24 }}>
        <Table 
          dataSource={memberships} 
          columns={membershipColumns} 
          rowKey="_id"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Modern Gym Discovery Modal */}
      <Modal 
        title="Discover Gyms" 
        open={gymModal} 
        onCancel={() => setGymModal(false)} 
        footer={null} 
        width="90%"
        style={{ maxWidth: 600 }}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {gyms.map(gym => (
            <div key={gym._id} className="mobile-card" style={{ marginBottom: 16 }}>
              <div className="mobile-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {gym.name}
                    </h3>
                    <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      📍 {gym.address}
                    </p>
                    {gym.operatingHours && (
                      <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        🕒 {gym.operatingHours.open} - {gym.operatingHours.close}
                      </p>
                    )}
                    {gym.phone && (
                      <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        📞 {gym.phone}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  type="primary" 
                  block
                  onClick={() => {
                    setSelectedGym(gym);
                    setGymModal(false);
                    fetchPlans(gym._id);
                  }}
                  style={{ marginTop: 12 }}
                >
                  View Plans
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modern Plan Selection Modal */}
      <Modal 
        title={`Choose Plan - ${selectedGym?.name}`} 
        open={planModal} 
        onCancel={() => setPlanModal(false)} 
        footer={null} 
        width="90%"
        style={{ maxWidth: 500 }}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {plans.map(plan => (
            <div key={plan._id} className="mobile-card" style={{ marginBottom: 16 }}>
              <div className="mobile-card-body">
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {plan.name}
                  </h3>
                  <p style={{ margin: '8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {plan.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Duration: <strong>{plan.duration} days</strong>
                    </span>
                    <span style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: 700 }}>
                      ₹{plan.price}
                    </span>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  icon={<CreditCardOutlined />}
                  block
                  size="large"
                  onClick={() => {
                    joinGym(selectedGym._id, plan._id, 'qr_manual');
                    setPlanModal(false);
                  }}
                >
                  Join & Pay ₹{plan.price}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default MemberDashboard;