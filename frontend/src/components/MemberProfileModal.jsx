import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Card, Row, Col, Avatar, Tag, Timeline, Button, Form, Input, Select, message, Statistic, Progress, Empty } from 'antd';
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
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const MemberProfileModal = ({ visible, onCancel, memberId }) => {
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [notificationForm] = Form.useForm();
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (visible && memberId) {
      fetchMemberProfile();
    }
  }, [visible, memberId]);

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

  const renderOverviewTab = () => {
    const member = memberData?.member;
    const analytics = memberData?.analytics;
    const details = getMemberDetails();
    const plan = getPlanDetails();

    return (
      <div>
        {/* Member Info Card */}
        <Card style={{ marginBottom: '20px' }}>
          <Row gutter={24}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, fontSize: '18px' }}>{getMemberName()}</div>
                <Tag color={member?.status === 'active' ? 'green' : 'orange'}>
                  {member?.status?.toUpperCase()}
                </Tag>
              </div>
            </Col>
            <Col span={18}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Member Type</div>
                    <div style={{ fontWeight: 500 }}>
                      {member?.isOfflineMember ? 'Offline Member' : 'Online Member'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Member ID</div>
                    <div style={{ fontWeight: 500 }}>{member?._id?.slice(-8)}</div>
                  </div>
                </Col>
                {details?.phone && (
                  <Col span={12}>
                    <div style={{ marginBottom: '12px' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      <span>{details.phone}</span>
                    </div>
                  </Col>
                )}
                {details?.email && (
                  <Col span={12}>
                    <div style={{ marginBottom: '12px' }}>
                      <MailOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      <span>{details.email}</span>
                    </div>
                  </Col>
                )}
                {details?.address && (
                  <Col span={24}>
                    <div style={{ marginBottom: '12px' }}>
                      <HomeOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      <span>{details.address}</span>
                    </div>
                  </Col>
                )}
                {details?.healthInfo && (
                  <Col span={24}>
                    <div style={{ marginBottom: '12px' }}>
                      <HeartOutlined style={{ marginRight: '8px', color: 'var(--error-color)' }} />
                      <span>{details.healthInfo}</span>
                    </div>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Analytics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
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

        {/* Plan Details */}
        <Card title="Membership Plan" style={{ marginBottom: '20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Plan Name</div>
                <div style={{ fontWeight: 500 }}>
                  {plan?.name}
                  {member?.customPlan?.isCustom && <Tag color="blue" size="small" style={{ marginLeft: '8px' }}>CUSTOM</Tag>}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Price</div>
                <div style={{ fontWeight: 500, color: 'var(--success-color)' }}>₹{plan?.price?.toLocaleString()}</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Duration</div>
                <div style={{ fontWeight: 500 }}>{plan?.duration} days</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Payment Status</div>
                <Tag color={member?.paymentStatus === 'paid' ? 'green' : 'red'}>
                  {member?.paymentStatus?.toUpperCase()}
                </Tag>
              </div>
            </Col>
            {member?.startDate && (
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Start Date</div>
                  <div style={{ fontWeight: 500 }}>{new Date(member.startDate).toLocaleDateString()}</div>
                </div>
              </Col>
            )}
            {member?.endDate && (
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>End Date</div>
                  <div style={{ fontWeight: 500 }}>{new Date(member.endDate).toLocaleDateString()}</div>
                </div>
              </Col>
            )}
          </Row>
          
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
      </div>
    );
  };

  const renderPaymentHistoryTab = () => {
    const paymentHistory = memberData?.member?.paymentHistory || [];
    
    return (
      <Card>
        {paymentHistory.length > 0 ? (
          <Timeline>
            {paymentHistory.slice().reverse().map((payment, index) => (
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
    );
  };

  const renderAttendanceTab = () => {
    const attendanceRecords = memberData?.attendanceRecords || [];
    
    return (
      <Card>
        {attendanceRecords.length > 0 ? (
          <Timeline>
            {attendanceRecords.map((record, index) => (
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
    );
  };

  const renderNotificationTab = () => {
    const member = memberData?.member;
    
    if (member?.isOfflineMember) {
      return (
        <Card>
          <Empty 
            description="Notifications can only be sent to online members"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <Card title="Send Notification">
        <Form form={notificationForm} onFinish={handleSendNotification} layout="vertical">
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
      </Card>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: 'var(--primary-color)' }} />
          <span>Member Profile - {getMemberName()}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <Tabs defaultActiveKey="overview" style={{ marginTop: '20px' }}>
        <TabPane tab="Overview" key="overview">
          {loading ? <div>Loading...</div> : renderOverviewTab()}
        </TabPane>
        <TabPane tab="Payment History" key="payment">
          {loading ? <div>Loading...</div> : renderPaymentHistoryTab()}
        </TabPane>
        <TabPane tab="Attendance" key="attendance">
          {loading ? <div>Loading...</div> : renderAttendanceTab()}
        </TabPane>
        <TabPane tab="Send Notification" key="notification">
          {loading ? <div>Loading...</div> : renderNotificationTab()}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default MemberProfileModal;