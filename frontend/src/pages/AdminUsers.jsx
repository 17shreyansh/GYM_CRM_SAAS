import React, { useState, useEffect } from 'react';
import { Table, Button, Tag } from 'antd';
import api from '../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Status', dataIndex: 'status', key: 'status', 
      render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag> 
    },
    { title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Button 
          size="small" 
          danger={record.status === 'active'} 
          type={record.status === 'banned' ? 'primary' : 'default'}
          onClick={() => updateUserStatus(record._id, record.status === 'active' ? 'banned' : 'active')}
        >
          {record.status === 'active' ? 'Ban' : 'Unban'}
        </Button>
      )
    }
  ];

  return (
    <div>
      <h2>User Management</h2>
      <Table dataSource={users} columns={columns} rowKey="_id" />
    </div>
  );
};

export default AdminUsers;