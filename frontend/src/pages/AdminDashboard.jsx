import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag, Modal, Tabs, Descriptions } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [gyms, setGyms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [gymModal, setGymModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchGyms();
    fetchUsers();
    fetchRevenueData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchGyms = async () => {
    try {
      const response = await api.get('/admin/gyms');
      setGyms(response.data);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await api.get('/admin/analytics/revenue');
      setRevenueData(response.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    }
  };

  const fetchGymDetails = async (gymId) => {
    try {
      const response = await api.get(`/admin/gyms/${gymId}/details`);
      setSelectedGym(response.data);
      setGymModal(true);
    } catch (error) {
      console.error('Failed to fetch gym details:', error);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const updateGymStatus = async (gymId, status) => {
    try {
      await api.patch(`/admin/gyms/${gymId}/status`, { status });
      fetchGyms();
    } catch (error) {
      console.error('Failed to update gym status:', error);
    }
  };

  const gymColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Owner', dataIndex: ['owner', 'name'], key: 'owner' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => (
        <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    { title: 'Actions', key: 'actions',
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => fetchGymDetails(record._id)}>
            View Details
          </Button>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" onClick={() => updateGymStatus(record._id, 'approved')}>
                Approve
              </Button>
              <Button size="small" danger onClick={() => updateGymStatus(record._id, 'rejected')}>
                Reject
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button size="small" danger onClick={() => updateGymStatus(record._id, 'banned')}>
              Ban
            </Button>
          )}
        </>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Gyms" value={stats.totalGyms} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Users" value={stats.totalUsers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Pending Gyms" value={stats.pendingGyms} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Today Revenue" value={stats.todayRevenue} prefix="₹" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#1890ff" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="User Management" extra={
            <Button onClick={() => setUserModal(true)}>View All Users</Button>
          }>
            <Statistic title="Total Users" value={users.length} />
            <Statistic title="Banned Users" value={users.filter(u => u.status === 'banned').length} />
          </Card>
        </Col>
      </Row>

      <Card title="Gym Management" style={{ marginBottom: 24 }}>
        <Table dataSource={gyms} columns={gymColumns} rowKey="_id" />
      </Card>

      {/* Gym Details Modal */}
      <Modal title={selectedGym?.name} open={gymModal} onCancel={() => setGymModal(false)} width={800} footer={null}>
        {selectedGym && (
          <Tabs>
            <Tabs.TabPane tab="Details" key="details">
              <Descriptions>
                <Descriptions.Item label="Owner">{selectedGym.owner?.name}</Descriptions.Item>
                <Descriptions.Item label="Address">{selectedGym.address}</Descriptions.Item>
                <Descriptions.Item label="Members">{selectedGym.memberCount}</Descriptions.Item>
                <Descriptions.Item label="Revenue">₹{selectedGym.totalRevenue}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Members" key="members">
              <Table dataSource={selectedGym.members} columns={[
                { title: 'Name', dataIndex: ['user', 'name'] },
                { title: 'Email', dataIndex: ['user', 'email'] },
                { title: 'Status', dataIndex: 'status' }
              ]} rowKey="_id" />
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Users Modal */}
      <Modal title="User Management" open={userModal} onCancel={() => setUserModal(false)} width={800} footer={null}>
        <Table dataSource={users} columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Role', dataIndex: 'role' },
          { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag> },
          { title: 'Actions', render: (_, record) => (
            <Button size="small" danger onClick={() => updateUserStatus(record._id, record.status === 'active' ? 'banned' : 'active')}>
              {record.status === 'active' ? 'Ban' : 'Unban'}
            </Button>
          )}
        ]} rowKey="_id" />
      </Modal>
    </div>
  );
};

export default AdminDashboard;