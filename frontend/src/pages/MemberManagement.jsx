import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AddMemberModal from '../components/AddMemberModal';
import PaymentStatusModal from '../components/PaymentStatusModal';

const { TabPane } = Tabs;
const { Option } = Select;

const MemberManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
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

  const handleAddMemberSuccess = () => {
    fetchMembers();
    setModalVisible(false);
  };

  const handlePaymentUpdate = (member) => {
    setSelectedMember(member);
    setPaymentModalVisible(true);
  };

  const handlePaymentUpdateSuccess = () => {
    fetchMembers();
    setPaymentModalVisible(false);
    setSelectedMember(null);
  };

  const handleViewProfile = (member) => {
    navigate(`/gym/members/${member._id}`);
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
      render: (_, record) => {
        const isOffline = record.isOfflineMember;
        const memberData = isOffline ? record.offlineDetails : record.user;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              style={{ 
                background: isOffline ? 'var(--warning-color)' : 'var(--primary-color)' 
              }} 
            />
            <div>
              <div 
                style={{ 
                  fontWeight: 600, 
                  fontSize: '16px', 
                  color: 'var(--primary-color)', 
                  marginBottom: '2px',
                  cursor: 'pointer'
                }}
                onClick={() => handleViewProfile(record)}
              >
                {memberData?.name}
                {isOffline && <Tag size="small" color="orange" style={{ marginLeft: '8px' }}>OFFLINE</Tag>}
              </div>
              {memberData?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <MailOutlined />
                  <span>{memberData.email}</span>
                </div>
              )}
              {memberData?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <PhoneOutlined />
                  <span>{memberData.phone}</span>
                </div>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ID: {record._id.slice(-6)}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Plan Details',
      key: 'plan',
      render: (_, record) => {
        const isCustomPlan = record.customPlan?.isCustom;
        const planData = isCustomPlan ? record.customPlan : record.plan;
        
        return (
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {planData?.name}
              {isCustomPlan && <Tag size="small" color="blue" style={{ marginLeft: '8px' }}>CUSTOM</Tag>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <DollarOutlined style={{ color: 'var(--success-color)' }} />
              <span>₹{planData?.price?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <CalendarOutlined style={{ color: 'var(--primary-color)' }} />
              <span>{planData?.duration} days</span>
            </div>
          </div>
        );
      }
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
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status, record) => {
        const statusConfig = {
          paid: { color: 'green', label: 'PAID' },
          unpaid: { color: 'red', label: 'UNPAID' },
          pending_verification: { color: 'orange', label: 'PENDING VERIFICATION' }
        };
        const config = statusConfig[status] || { color: 'default', label: status?.toUpperCase() };
        
        return (
          <div>
            <Tag 
              color={config.color}
              style={{ borderRadius: '20px', padding: '4px 12px', marginBottom: '4px' }}
            >
              {config.label}
            </Tag>
            {status === 'unpaid' && (
              <div>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => handlePaymentUpdate(record)}
                  style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                >
                  Update Payment
                </Button>
              </div>
            )}
            {status === 'pending_verification' && (
              <div>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => navigate('/gym/payment-requests')}
                  style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                >
                  View Payment Requests
                </Button>
              </div>
            )}
          </div>
        );
      }
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
          <Tooltip title="View Profile">
            <Button 
              size="small" 
              icon={<UserOutlined />}
              onClick={() => handleViewProfile(record)}
              style={{ borderRadius: '6px' }}
            >
              Profile
            </Button>
          </Tooltip>
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
      <AddMemberModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleAddMemberSuccess}
        users={users}
        plans={plans}
      />

      {/* Payment Status Modal */}
      <PaymentStatusModal
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentUpdateSuccess}
        member={selectedMember}
      />
    </div>
  );
};

export default MemberManagement;