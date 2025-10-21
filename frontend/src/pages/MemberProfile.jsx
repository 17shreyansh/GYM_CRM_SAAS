import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Tag, Timeline, Button, Form, Input, Select, message, Statistic, Progress, Empty, Spin, Breadcrumb } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HeartOutlined,
  HomeOutlined,
  BellOutlined,
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { TextArea } = Input;
const { Option } = Select;

const MemberProfile = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationForm] = Form.useForm();
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (memberId) {
      fetchMemberProfile();
    }
  }, [memberId]);

  const fetchMemberProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/gym/members/${memberId}/profile`);
      setMemberData(response.data);
    } catch (error) {
      message.error('Failed to fetch member profile');
    }
    setLoading(false);
  };

  const handleSendNotification = async (values) => {
    setSendingNotification(true);
    try {
      await api.post(`/gym/members/${memberId}/notify`, values);
      message.success('Notification sent successfully');
      notificationForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send notification');
    }
    setSendingNotification(false);
  };

  const getMemberName = () => {
    if (!memberData) return '';
    return memberData.member.isOfflineMember 
      ? memberData.member.offlineDetails?.name 
      : memberData.member.user?.name;
  };

  const getMemberDetails = () => {
    if (!memberData) return {};
    return memberData.member.isOfflineMember 
      ? memberData.member.offlineDetails 
      : memberData.member.user;
  };

  const getPlanDetails = () => {
    if (!memberData) return {};
    return memberData.member.customPlan?.isCustom 
      ? memberData.member.customPlan 
      : memberData.member.plan;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!memberData) {
    return <div>Member not found</div>;
  }

  const member = memberData.member;
  const analytics = memberData.analytics;
  const details = getMemberDetails();
  const plan = getPlanDetails();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/gym/members')}
              style={{ padding: 0 }}
            >
              Member Management
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{getMemberName()}</Breadcrumb.Item>
        </Breadcrumb>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{getMemberName()}</h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Tag color={member.status === 'active' ? 'green' : 'orange'}>
                {member.status?.toUpperCase()}
              </Tag>
              {member.isOfflineMember && <Tag color="orange">OFFLINE</Tag>}
              {member.customPlan?.isCustom && <Tag color="blue">CUSTOM PLAN</Tag>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['overview', 'payment', 'attendance', 'notification'].map(tab => (
            <Button
              key={tab}
              type={activeTab === tab ? 'primary' : 'text'}
              onClick={() => setActiveTab(tab)}
              style={{ 
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : 'none',
                borderRadius: 0,
                textTransform: 'capitalize'
              }}
            >
              {tab === 'notification' ? 'Send Notification' : tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Analytics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Total Visits"
                  value={analytics?.totalAttendance || 0}
                  prefix={<TrophyOutlined style={{ color: 'var(--primary-color)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="This Month"
                  value={analytics?.monthlyAttendance || 0}
                  prefix={<FireOutlined style={{ color: 'var(--success-color)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Avg Duration"
                  value={analytics?.avgDuration || 0}
                  suffix="min"
                  prefix={<ClockCircleOutlined style={{ color: 'var(--warning-color)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Days Left"
                  value={Math.max(0, analytics?.daysUntilExpiry || 0)}
                  prefix={<CalendarOutlined style={{ color: 'var(--error-color)' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={24}>
            {/* Member Details */}
            <Col xs={24} lg={12}>
              <Card title="Member Details" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Member Type</div>
                    <div style={{ fontWeight: 500 }}>
                      {member.isOfflineMember ? 'Offline Member' : 'Online Member'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Member ID</div>
                    <div style={{ fontWeight: 500 }}>{member._id?.slice(-8)}</div>
                  </div>
                  {details?.phone && (
                    <div>
                      <PhoneOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      <span>{details.phone}</span>
                    </div>
                  )}
                  {details?.email && (
                    <div>
                      <MailOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      <span>{details.email}</span>
                    </div>
                  )}
                  {details?.address && (
                    <div>
                      <HomeOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      <span>{details.address}</span>
                    </div>
                  )}
                  {details?.healthInfo && (
                    <div>
                      <HeartOutlined style={{ marginRight: '8px', color: 'var(--error-color)' }} />
                      <span>{details.healthInfo}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* Plan Details */}
            <Col xs={24} lg={12}>
              <Card title="Membership Plan" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Plan Name</div>
                    <div style={{ fontWeight: 500 }}>{plan?.name}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Price</div>
                    <div style={{ fontWeight: 500, color: 'var(--success-color)' }}>₹{plan?.price?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Duration</div>
                    <div style={{ fontWeight: 500 }}>{plan?.duration} days</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Payment Status</div>
                    <Tag color={member.paymentStatus === 'paid' ? 'green' : 'red'}>
                      {member.paymentStatus?.toUpperCase()}
                    </Tag>
                  </div>
                  {member.startDate && (
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Start Date</div>
                      <div style={{ fontWeight: 500 }}>{new Date(member.startDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {member.endDate && (
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>End Date</div>
                      <div style={{ fontWeight: 500 }}>{new Date(member.endDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                
                {analytics?.daysUntilExpiry > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Membership Progress
                    </div>
                    <Progress 
                      percent={Math.max(0, Math.min(100, ((analytics.daysSinceJoining) / (analytics.daysSinceJoining + analytics.daysUntilExpiry)) * 100))}
                      strokeColor={analytics.daysUntilExpiry < 7 ? 'var(--error-color)' : 'var(--primary-color)'}
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {activeTab === 'payment' && (
        <Card title="Payment History">
          {member.paymentHistory?.length > 0 ? (
            <Timeline>
              {member.paymentHistory.slice().reverse().map((payment, index) => (
                <Timeline.Item 
                  key={index}
                  dot={<DollarOutlined style={{ fontSize: '16px' }} />}
                  color={payment.status === 'paid' ? 'green' : 'red'}
                >
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                      Payment Status Updated to 
                      <Tag color={payment.status === 'paid' ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                        {payment.status.toUpperCase()}
                      </Tag>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {new Date(payment.updatedAt).toLocaleString()}
                    </div>
                    {payment.notes && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {payment.notes}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No payment history available" />
          )}
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card title="Attendance History">
          {memberData.attendanceRecords?.length > 0 ? (
            <Timeline>
              {memberData.attendanceRecords.map((record, index) => (
                <Timeline.Item 
                  key={index}
                  dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
                  color="green"
                >
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                      Gym Visit
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Check-in: {new Date(record.checkInTime).toLocaleString()}
                    </div>
                    {record.checkOutTime && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Check-out: {new Date(record.checkOutTime).toLocaleString()}
                      </div>
                    )}
                    {record.duration && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Duration: {record.duration} minutes
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No attendance records available" />
          )}
        </Card>
      )}

      {activeTab === 'notification' && (
        <Card title="Send Notification">
          {member.isOfflineMember ? (
            <Empty 
              description="Notifications can only be sent to online members"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Form form={notificationForm} onFinish={handleSendNotification} layout="vertical" style={{ maxWidth: '600px' }}>
              <Form.Item 
                name="title" 
                label="Title" 
                rules={[{ required: true, message: 'Please enter notification title' }]}
              >
                <Input placeholder="Enter notification title" />
              </Form.Item>

              <Form.Item 
                name="message" 
                label="Message" 
                rules={[{ required: true, message: 'Please enter notification message' }]}
              >
                <TextArea 
                  placeholder="Enter notification message" 
                  rows={4}
                />
              </Form.Item>

              <Form.Item name="type" label="Type" initialValue="info">
                <Select>
                  <Option value="info">Info</Option>
                  <Option value="success">Success</Option>
                  <Option value="warning">Warning</Option>
                  <Option value="error">Error</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={sendingNotification}
                  icon={<BellOutlined />}
                >
                  Send Notification
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      )}
    </div>
  );
};

export default MemberProfile;