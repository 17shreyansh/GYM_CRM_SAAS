import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, Select, Tag, Avatar, Space, 
  Row, Col, Statistic, Tabs, message, Popconfirm, Badge, Tooltip, Drawer
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  UserOutlined, TeamOutlined, SettingOutlined, FilterOutlined,
  PhoneOutlined, MailOutlined, CalendarOutlined, DollarOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import StaffDashboard from '../components/StaffDashboard';
import StaffQuickActions from '../components/StaffQuickActions';

const { Option } = Select;
const { TabPane } = Tabs;

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchUsers, setSearchUsers] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ role: 'all', status: 'all' });
  const [detailsDrawer, setDetailsDrawer] = useState({ visible: false, staff: null });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const roles = [
    { value: 'trainer', label: 'Trainer', color: 'blue' },
    { value: 'front_desk', label: 'Front Desk', color: 'green' },
    { value: 'nutritionist', label: 'Nutritionist', color: 'orange' },
    { value: 'manager', label: 'Manager', color: 'purple' },
    { value: 'cleaner', label: 'Cleaner', color: 'cyan' },
    { value: 'maintenance', label: 'Maintenance', color: 'red' }
  ];

  useEffect(() => {
    fetchStaff();
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await api.get('/staff/invitations');
      setInvitations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch invitations');
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/staff');
      setStaff(response.data.data);
    } catch (error) {
      message.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const searchUsersToAdd = async (query) => {
    if (!query) {
      setSearchUsers([]);
      return;
    }
    
    setUserSearchLoading(true);
    try {
      const response = await api.get(`/staff/search-users?q=${query}`);
      setSearchUsers(response.data.data);
    } catch (error) {
      message.error('Failed to search users');
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditStaff = (record) => {
    setEditingStaff(record);
    form.setFieldsValue({
      user_id: record.user_id._id,
      role: record.role,
      title: record.title,
      department: record.department,
      salary: record.salary
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, values);
        message.success('Staff updated successfully');
      } else {
        await api.post('/staff/invite', values);
        message.success('Staff invitation sent successfully');
      }
      setModalVisible(false);
      fetchStaff();
      fetchInvitations();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleRemoveStaff = async (id) => {
    try {
      await api.delete(`/staff/${id}`);
      message.success('Staff removed successfully');
      fetchStaff();
    } catch (error) {
      message.error('Failed to remove staff');
    }
  };

  const getRoleColor = (role) => {
    return roles.find(r => r.value === role)?.color || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { active: 'green', inactive: 'red', on_leave: 'orange' };
    return colors[status] || 'default';
  };

  const filteredStaff = staff.filter(member => {
    const roleMatch = filters.role === 'all' || member.role === filters.role;
    const statusMatch = filters.status === 'all' || member.status === filters.status;
    return roleMatch && statusMatch;
  });

  const getStats = () => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const byRole = roles.reduce((acc, role) => {
      acc[role.value] = staff.filter(s => s.role === role.value && s.status === 'active').length;
      return acc;
    }, {});
    
    return { total, active, byRole };
  };

  const stats = getStats();

  const handleBulkAction = async (action, staffIds, values) => {
    // Implement bulk actions here
    console.log('Bulk action:', action, staffIds, values);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedStaff(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 'inactive'
    })
  };

  const columns = [
    {
      title: 'Staff Member',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.user_id.photo} 
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user_id.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.title}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {roles.find(r => r.value === role)?.label || role}
        </Tag>
      ),
      filters: roles.map(role => ({ text: role.label, value: role.value })),
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <MailOutlined style={{ color: '#666' }} />
            <span style={{ fontSize: '12px' }}>{record.user_id.email}</span>
          </Space>
          {record.user_id.phone && (
            <Space size="small">
              <PhoneOutlined style={{ color: '#666' }} />
              <span style={{ fontSize: '12px' }}>{record.user_id.phone}</span>
            </Space>
          )}
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning'} 
          text={status.replace('_', ' ').toUpperCase()} 
        />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'On Leave', value: 'on_leave' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hire Date',
      dataIndex: 'hire_date',
      key: 'hire_date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<SearchOutlined />}
              onClick={() => setDetailsDrawer({ visible: true, staff: record })}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEditStaff(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Remove this staff member?"
            onConfirm={() => handleRemoveStaff(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Remove">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Staff Dashboard */}
      <StaffDashboard staff={staff} />
      
      {/* Quick Actions */}
      <StaffQuickActions 
        onAddStaff={handleAddStaff}
        selectedStaff={selectedStaff}
        onBulkAction={handleBulkAction}
      />
      
      {/* Legacy Stats - keeping for comparison */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'none' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Staff"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Staff"
              value={stats.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Trainers"
              value={stats.byRole.trainer || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Support Staff"
              value={(stats.byRole.front_desk || 0) + (stats.byRole.cleaner || 0)}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title="Staff & Trainer Management"
        extra={
          <Space>
            <Select
              placeholder="Filter by Role"
              style={{ width: 120 }}
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
            >
              <Option value="all">All Roles</Option>
              {roles.map(role => (
                <Option key={role.value} value={role.value}>{role.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 120 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="on_leave">On Leave</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStaff}>
              Add Staff
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredStaff}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
          rowSelection={rowSelection}
          className="staff-table"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {!editingStaff && (
            <Form.Item
              name="user_id"
              label="Select User"
              rules={[{ required: true, message: 'Please select a user' }]}
            >
              <Select
                showSearch
                placeholder="Search users by name, email, or phone"
                onSearch={searchUsersToAdd}
                loading={userSearchLoading}
                filterOption={false}
                notFoundContent={userSearchLoading ? 'Searching...' : 'No users found'}
              >
                {searchUsers.map(user => (
                  <Option key={user._id} value={user._id}>
                    <Space>
                      <Avatar src={user.photo} icon={<UserOutlined />} size="small" />
                      <div>
                        <div>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select role">
                  {roles.map(role => (
                    <Option key={role.value} value={role.value}>{role.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Job Title"
                rules={[{ required: true, message: 'Please enter job title' }]}
              >
                <Input placeholder="e.g., Senior Trainer, Head Nutritionist" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Input placeholder="e.g., Fitness, Nutrition" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salary" label="Salary">
                <Input type="number" placeholder="Monthly salary" prefix="₹" />
              </Form.Item>
            </Col>
          </Row>

          {!editingStaff && (
            <Form.Item name="message" label="Message (Optional)">
              <Input.TextArea placeholder="Add a message for the invitation" rows={3} />
            </Form.Item>
          )}



          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingStaff ? 'Update' : 'Add'} Staff
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Staff Details"
        placement="right"
        onClose={() => setDetailsDrawer({ visible: false, staff: null })}
        open={detailsDrawer.visible}
        width={400}
      >
        {detailsDrawer.staff && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                src={detailsDrawer.staff.user_id.photo} 
                icon={<UserOutlined />}
                size={80}
              />
              <h3 style={{ margin: '16px 0 8px' }}>{detailsDrawer.staff.user_id.name}</h3>
              <Tag color={getRoleColor(detailsDrawer.staff.role)}>
                {roles.find(r => r.value === detailsDrawer.staff.role)?.label}
              </Tag>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <strong>Job Title:</strong>
                <div>{detailsDrawer.staff.title}</div>
              </div>
              
              <div>
                <strong>Department:</strong>
                <div>{detailsDrawer.staff.department || 'Not specified'}</div>
              </div>
              
              <div>
                <strong>Contact:</strong>
                <div>{detailsDrawer.staff.user_id.email}</div>
                {detailsDrawer.staff.user_id.phone && (
                  <div>{detailsDrawer.staff.user_id.phone}</div>
                )}
              </div>
              
              <div>
                <strong>Hire Date:</strong>
                <div>{new Date(detailsDrawer.staff.hire_date).toLocaleDateString()}</div>
              </div>
              
              <div>
                <strong>Status:</strong>
                <div>
                  <Badge 
                    status={detailsDrawer.staff.status === 'active' ? 'success' : 'error'} 
                    text={detailsDrawer.staff.status.toUpperCase()} 
                  />
                </div>
              </div>
              

            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StaffManagement;