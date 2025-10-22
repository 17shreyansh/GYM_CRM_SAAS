import React, { useState, useEffect } from 'react';
import { Card, List, Button, Avatar, Tag, Space, message, Empty } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const StaffInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/invitations');
      setInvitations(response.data.data);
    } catch (error) {
      message.error('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.post(`/invitations/${id}/accept`);
      message.success('Invitation accepted successfully!');
      fetchInvitations();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/invitations/${id}/reject`);
      message.success('Invitation rejected');
      fetchInvitations();
    } catch (error) {
      message.error('Failed to reject invitation');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      trainer: 'blue',
      front_desk: 'green',
      nutritionist: 'orange',
      manager: 'purple',
      cleaner: 'cyan',
      maintenance: 'red'
    };
    return colors[role] || 'default';
  };

  return (
    <Card title="Staff Invitations" loading={loading}>
      {invitations.length === 0 ? (
        <Empty description="No pending invitations" />
      ) : (
        <List
          dataSource={invitations}
          renderItem={(invitation) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleAccept(invitation._id)}
                >
                  Accept
                </Button>,
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(invitation._id)}
                >
                  Reject
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} size={48} />}
                title={
                  <Space>
                    <span>{invitation.gym_id.gym_display_name || invitation.gym_id.gym_name}</span>
                    <Tag color={getRoleColor(invitation.role)}>
                      {invitation.role.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div><strong>Position:</strong> {invitation.title}</div>
                    {invitation.department && (
                      <div><strong>Department:</strong> {invitation.department}</div>
                    )}
                    {invitation.salary && (
                      <div><strong>Salary:</strong> ₹{invitation.salary}/month</div>
                    )}
                    {invitation.message && (
                      <div style={{ marginTop: 8, fontStyle: 'italic' }}>
                        "{invitation.message}"
                      </div>
                    )}
                    <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                      <ClockCircleOutlined /> Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default StaffInvitations;