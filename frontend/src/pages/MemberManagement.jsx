import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, Input, Space, Tag, message, Tabs, Row, Col, Avatar, Tooltip, Empty } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { TabPane } = Tabs;
const { Option } = Select;

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMembers();
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gym/members');
      console.log('Members response:', response.data);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Fetch members error:', error);
      message.error('Failed to fetch members');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/gym/users');
      console.log('Users response:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/gym/plans');
      console.log('Plans response:', response.data);
      setPlans((response.data.plans || []).filter(plan => plan.isActive));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleAddMember = async (values) => {
    try {
      await api.post('/gym/members', values);
      message.success('Member added successfully');
      fetchMembers();
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add member');
    }
  };

  const handleStatusUpdate = async (memberId, status) => {
    try {
      await api.patch(`/gym/members/${memberId}/status`, { status });
      message.success(`Member ${status === 'active' ? 'approved' : status} successfully`);
      fetchMembers();
    } catch (error) {
      message.error('Failed to update member status');
    }
  };

  const handleDelete = (memberId) => {
    Modal.confirm({
      title: 'Delete Member',
      content: 'Are you sure you want to delete this member?',
      onOk: async () => {
        try {
          await api.delete(`/gym/members/${memberId}`);
          message.success('Member deleted successfully');
          fetchMembers();
        } catch (error) {
          message.error('Failed to delete member');
        }
      }
    });
  };

  const getFilteredMembers = () => {
    let filtered = members;
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(member => member.status === activeTab);
    }
    
    if (searchText) {
      filtered = filtered.filter(member =>
        member.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        member._id.includes(searchText)
      );
    }
    
    return filtered;
  };

  const columns = [
    {
      title: 'Member Info',
      key: 'memberInfo',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar size={40} icon={<UserOutlined />} style={{ background: 'var(--primary-color)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>
              {record.user.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <MailOutlined />
              <span>{record.user.email}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ID: {record._id.slice(-6)}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Plan Details',
      key: 'plan',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{record.plan.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <DollarOutlined style={{ color: 'var(--success-color)' }} />
            <span>₹{record.plan.price.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CalendarOutlined style={{ color: 'var(--primary-color)' }} />
            <span>{record.plan.duration} days</span>
          </div>
        </div>
      )
    },
    {
      title: 'Join Method',
      dataIndex: 'joinMethod',
      key: 'joinMethod',
      render: (method) => (
        <Tag 
          color={method === 'online' ? 'blue' : 'orange'}
          style={{ borderRadius: '20px', padding: '4px 12px' }}
        >
          {method.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          pending: { color: 'warning', icon: <ClockCircleOutlined /> },
          active: { color: 'success', icon: <CheckOutlined /> },
          rejected: { color: 'error', icon: <CloseOutlined /> },
          suspended: { color: 'error', icon: <CloseOutlined /> }
        };
        const { color, icon } = config[status] || {};
        return (
          <Tag 
            color={color} 
            icon={icon}
            style={{ borderRadius: '20px', padding: '4px 12px' }}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Pending', value: 'pending' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Rejected', value: 'rejected' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Membership Period',
      key: 'period',
      render: (_, record) => {
        if (!record.startDate) {
          return (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Not started
            </span>
          );
        }
        const startDate = new Date(record.startDate).toLocaleDateString();
        const endDate = new Date(record.endDate).toLocaleDateString();
        const isExpired = new Date(record.endDate) < new Date();
        
        return (
          <div>
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>
              <strong>Start:</strong> {startDate}
            </div>
            <div style={{ fontSize: '12px', color: isExpired ? 'var(--error-color)' : 'var(--text-secondary)' }}>
              <strong>End:</strong> {endDate}
              {isExpired && <Tag color="red" size="small" style={{ marginLeft: '4px' }}>Expired</Tag>}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approve Member">
                <Button 
                  size="small" 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusUpdate(record._id, 'active')}
                  style={{ borderRadius: '6px' }}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject Member">
                <Button 
                  size="small" 
                  danger 
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusUpdate(record._id, 'rejected')}
                  style={{ borderRadius: '6px' }}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          {record.status === 'active' && (
            <Tooltip title="Suspend Member">
              <Button 
                size="small" 
                onClick={() => handleStatusUpdate(record._id, 'suspended')}
                style={{ borderRadius: '6px' }}
              >
                Suspend
              </Button>
            </Tooltip>
          )}
          {record.status === 'suspended' && (
            <Tooltip title="Activate Member">
              <Button 
                size="small" 
                type="primary"
                onClick={() => handleStatusUpdate(record._id, 'active')}
                style={{ borderRadius: '6px' }}
              >
                Activate
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Delete Member">
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

  const getStats = () => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingMembers = members.filter(m => m.status === 'pending').length;
    const totalRevenue = members.filter(m => m.status === 'active').reduce((sum, m) => sum + (m.plan?.price || 0), 0);
    
    return { totalMembers, activeMembers, pendingMembers, totalRevenue };
  };

  const stats = getStats();

  return (
    <div>
      {/* Stats Overview */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <TeamOutlined />
            </div>
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckOutlined />
            </div>
            <div className="stat-value">{stats.activeMembers}</div>
            <div className="stat-label">Active Members</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <ClockCircleOutlined />
            </div>
            <div className="stat-value">{stats.pendingMembers}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-icon secondary">
              <DollarOutlined />
            </div>
            <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </Col>
      </Row>

      {/* Members Table */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TeamOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Member Management</span>
          </div>
        }
        extra={
          <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Input
              placeholder="Search by name, email or ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                width: window.innerWidth <= 768 ? '100%' : 250, 
                borderRadius: '8px',
                marginBottom: window.innerWidth <= 768 ? '8px' : 0
              }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
              style={{ 
                borderRadius: '8px',
                width: window.innerWidth <= 768 ? '100%' : 'auto'
              }}
            >
              Add Member
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={`All Members (${members.length})`} key="all" />
          <TabPane tab={`Pending (${members.filter(m => m.status === 'pending').length})`} key="pending" />
          <TabPane tab={`Active (${members.filter(m => m.status === 'active').length})`} key="active" />
          <TabPane tab={`Suspended (${members.filter(m => m.status === 'suspended').length})`} key="suspended" />
        </Tabs>
        
        {getFilteredMembers().length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {members.length === 0 ? 'No members added yet' : 'No members match your search criteria'}
                </p>
                {members.length === 0 && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setModalVisible(true)}
                  >
                    Add Your First Member
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={getFilteredMembers()} 
            rowKey="_id" 
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`
            }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Add New Member</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={window.innerWidth <= 768 ? '95%' : 600}
        style={{ top: window.innerWidth <= 768 ? 20 : undefined }}
      >
        <Form form={form} onFinish={handleAddMember} layout="vertical" style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="userId" 
                label="Select User" 
                rules={[{ required: true, message: 'Please select a user' }]}
              >
                <Select 
                  placeholder={users.length === 0 ? "No users available" : "Select user to add as member"}
                  disabled={users.length === 0}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {users.map(user => (
                    <Option key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </Option>
                  ))}
                </Select>
                {users.length === 0 && (
                  <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                    No users found. Users need to register first.
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="planId" 
                label="Select Plan" 
                rules={[{ required: true, message: 'Please select a plan' }]}
              >
                <Select 
                  placeholder={plans.length === 0 ? "No active plans available" : "Select membership plan"}
                  disabled={plans.length === 0}
                  size="large"
                >
                  {plans.map(plan => (
                    <Option key={plan._id} value={plan._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{plan.name}</span>
                        <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>
                          ₹{plan.price.toLocaleString()} ({plan.duration} days)
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
                {plans.length === 0 && (
                  <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                    No active plans found. Create plans first in Plan Management.
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="joinMethod" 
                label="Join Method" 
                rules={[{ required: true, message: 'Please select join method' }]}
              >
                <Select placeholder="Select join method" size="large">
                  <Option value="cash">Cash Payment</Option>
                  <Option value="online">Online Payment</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="paymentStatus" 
                label="Payment Status" 
                rules={[{ required: true, message: 'Please select payment status' }]}
              >
                <Select placeholder="Select payment status" size="large">
                  <Option value="paid">Paid</Option>
                  <Option value="unpaid">Unpaid</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
            <Space 
              style={{ 
                width: '100%', 
                justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
              }}
            >
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={users.length === 0 || plans.length === 0}
                size="large"
              >
                Add Member
              </Button>
            </Space>
            {(users.length === 0 || plans.length === 0) && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                Cannot add members without users and active plans.
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberManagement;