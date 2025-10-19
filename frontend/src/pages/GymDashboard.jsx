import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Tabs, Button, Alert, Space, Progress, Avatar } from 'antd';
import { 
  EditOutlined, 
  SettingOutlined, 
  UserOutlined, 
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FileTextOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { TabPane } = Tabs;

const GymDashboard = () => {
  const [stats, setStats] = useState({});
  const [gym, setGym] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchGymDetails();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/gym/dashboard');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchGymDetails = async () => {
    try {
      const response = await api.get('/gym/details');
      setGym(response.data.gym);
    } catch (error) {
      console.error('Failed to fetch gym details:', error);
      // If no gym found, redirect to setup
      if (error.response?.status === 404) {
        navigate('/gym/setup');
      }
    }
  };

  const getStatusAlert = () => {
    const subscription = stats.subscription || {};
    const { status, plan_name, days_remaining } = subscription;
    
    if (status === 'expired' || plan_name === 'No Plan') {
      return (
        <Alert 
          message="Subscription Required" 
          description="Please activate a subscription plan to access all gym management features."
          type="warning" 
          showIcon 
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => navigate('/gym-owner-register')}>
              View Plans
            </Button>
          }
        />
      );
    }
    
    if (days_remaining <= 7 && days_remaining > 0) {
      return (
        <Alert 
          message="Subscription Expiring Soon" 
          description={`Your ${plan_name} plan expires in ${days_remaining} days.`}
          type="warning" 
          showIcon 
          icon={<ClockCircleOutlined />}
        />
      );
    }
    
    return (
      <Alert 
        message="Subscription Active" 
        description={`Your ${plan_name} plan is active. ${days_remaining} days remaining.`}
        type="success" 
        showIcon 
        icon={<CheckCircleOutlined />}
      />
    );
  };

  const StatCard = ({ title, value, icon, color, prefix, suffix, trend }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-value">{prefix}{value}{suffix}</div>
      <div className="stat-label">{title}</div>
      {trend && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--success-color)' }}>
          <RiseOutlined /> {trend}% from last month
        </div>
      )}
    </div>
  );

  const ActionCard = ({ title, description, icon, onClick, disabled }) => (
    <div 
      className={`action-card ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div className="action-icon">{icon}</div>
      <div className="action-title">{title}</div>
      <div className="action-desc">{description}</div>
    </div>
  );

  return (
    <div>
      {/* Gym Header */}
      {gym && (
        <div className="gym-header">
          {gym.gym_logo ? (
            <img src={gym.gym_logo} alt="Gym Logo" className="gym-logo" />
          ) : (
            <Avatar size={60} icon={<TrophyOutlined />} style={{ background: 'var(--primary-color)' }} />
          )}
          <div className="gym-info">
            <h2>{gym.gym_display_name || gym.gym_name}</h2>
            <p>{gym.location?.city}, {gym.location?.state} • {(gym.plan_type || 'basic').trim().toUpperCase()} Plan</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {stats.gym_info?.status === 'suspended' && (
              <div className="status-badge warning">
                SUSPENDED
              </div>
            )}
            <div className={`status-badge ${stats.subscription?.status === 'active' ? 'success' : 'warning'}`}>
              {stats.subscription?.plan_name || 'NO PLAN'}
            </div>
          </div>
        </div>
      )}

      {/* Status Alert */}
      <div style={{ marginBottom: 24 }}>
        {getStatusAlert()}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Active Members"
          value={stats.analytics?.active_members || 0}
          icon={<TeamOutlined />}
          color="primary"
          trend={12}
        />
        <StatCard
          title="Total Visitors"
          value={stats.analytics?.total_visitors || 0}
          icon={<UserOutlined />}
          color="success"
          trend={8}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.analytics?.total_revenue || 0}
          icon={<DollarOutlined />}
          color="warning"
          prefix="₹"
          trend={15}
        />
        <StatCard
          title="Days Remaining"
          value={stats.subscription?.days_remaining || 0}
          icon={<CalendarOutlined />}
          color="secondary"
          suffix=" days"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: 24 }}>
        <div className="quick-actions">
          <ActionCard
            title="Gym Setup"
            description="Update gym profile & settings"
            icon={<SettingOutlined />}
            onClick={() => navigate('/gym/setup')}
          />
          <ActionCard
            title="Manage Plans"
            description="Create & edit membership plans"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/gym/plans')}
          />
          <ActionCard
            title="Members"
            description="View & manage gym members"
            icon={<TeamOutlined />}
            onClick={() => navigate('/gym/members')}
          />
          <ActionCard
            title="Attendance"
            description="Track member check-ins"
            icon={<CalendarOutlined />}
            onClick={() => navigate('/gym/attendance')}
          />
          <ActionCard
            title="QR Code"
            description="Generate gym QR for check-ins"
            icon={<QrcodeOutlined />}
            onClick={() => navigate('/gym/qr')}
          />
          <ActionCard
            title="Subscriptions"
            description="View subscription history"
            icon={<CalendarOutlined />}
            onClick={() => navigate('/gym/subscriptions')}
          />
          <ActionCard
            title="Support"
            description="Get help & contact support"
            icon={<SettingOutlined />}
            onClick={() => navigate('/support')}
          />
        </div>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultActiveKey="overview" type="card">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Gym Information" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gym ID:</span>
                    <span style={{ fontWeight: '500' }}>{stats.gym_info?.gym_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Display Name:</span>
                    <span style={{ fontWeight: '500' }}>{stats.gym_info?.gym_display_name}</span>
                  </div>
                  {stats.gym_info?.status === 'suspended' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                      <Tag color="red">
                        SUSPENDED
                      </Tag>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Plan:</span>
                    <Tag color={stats.subscription?.status === 'active' ? 'green' : 'orange'}>
                      {stats.subscription?.plan_name || 'NO PLAN'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Days Remaining:</span>
                    <span style={{ fontWeight: '500' }}>
                      {stats.subscription?.days_remaining > 0 ? `${stats.subscription.days_remaining} days` : 'Expired'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subscription:</span>
                    <Tag color={stats.gym_info?.subscription_status === 'active' ? 'green' : 'red'}>
                      {stats.gym_info?.subscription_status?.toUpperCase()}
                    </Tag>
                  </div>
                </Space>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => navigate('/gym/setup')}
                  style={{ marginTop: '16px', width: '100%' }}
                >
                  Update Profile
                </Button>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="Setup Progress" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <Progress percent={75} strokeColor="var(--primary-color)" />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Plans Created</span>
                      <span>2/5</span>
                    </div>
                    <Progress percent={40} strokeColor="var(--success-color)" />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Members Added</span>
                      <span>{stats.analytics?.active_members || 0}</span>
                    </div>
                    <Progress percent={Math.min((stats.analytics?.active_members || 0) * 10, 100)} strokeColor="var(--warning-color)" />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Gym Details" key="details">
          {gym && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Business Information" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Official Name:</span>
                      <span style={{ fontWeight: '500' }}>{gym.gym_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Owner:</span>
                      <span style={{ fontWeight: '500' }}>{gym.owner_full_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Business Email:</span>
                      <span style={{ fontWeight: '500' }}>{gym.business_email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Business Phone:</span>
                      <span style={{ fontWeight: '500' }}>{gym.business_phone_number}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>GST:</span>
                      <span style={{ fontWeight: '500' }}>{gym.gst_number || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>PAN:</span>
                      <span style={{ fontWeight: '500' }}>{gym.pan_number || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Plan:</span>
                      <Tag color="blue">{gym.plan_type?.toUpperCase()}</Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Operational Details" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Display Name:</span>
                      <span style={{ fontWeight: '500' }}>{gym.gym_display_name || 'Not set'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Description:</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{gym.description || 'Not provided'}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
                      <span style={{ fontWeight: '500' }}>{gym.location?.city}, {gym.location?.state} - {gym.location?.pin}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Amenities:</span>
                      <div style={{ marginTop: '4px' }}>
                        {gym.amenities_list?.map(amenity => (
                          <Tag key={amenity} style={{ margin: '2px' }}>{amenity}</Tag>
                        )) || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None added</span>}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Services:</span>
                      <div style={{ marginTop: '4px' }}>
                        {gym.services_offered?.map(service => (
                          <Tag key={service} color="blue" style={{ margin: '2px' }}>{service}</Tag>
                        )) || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None added</span>}
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Performance Metrics" size="small">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Statistic 
                      title="Total Visitors" 
                      value={stats.analytics?.total_visitors || 0} 
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic 
                      title="Active Members" 
                      value={stats.analytics?.active_members || 0} 
                      prefix={<TeamOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic 
                      title="Total Revenue" 
                      value={stats.analytics?.total_revenue || 0} 
                      prefix="₹" 
                    />
                  </Col>
                </Row>
                
                <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Recent Activity</h4>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Last Login:</span>
                      <span style={{ fontWeight: '500' }}>
                        {stats.recent_activity?.last_login ? 
                          new Date(stats.recent_activity.last_login).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Services Count:</span>
                      <span style={{ fontWeight: '500' }}>{stats.recent_activity?.services_count || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Trainers Count:</span>
                      <span style={{ fontWeight: '500' }}>{stats.recent_activity?.total_trainers || 0}</span>
                    </div>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default GymDashboard;