import React, { useState, useEffect } from 'react';
import { Card, Input, List, Button, Avatar, Space, Tag, message, Row, Col, Statistic, Typography, Empty, Spin, Tabs, DatePicker, Tooltip } from 'antd';
import { 
  SearchOutlined, 
  LoginOutlined, 
  LogoutOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  QrcodeOutlined, 
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const Attendance = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [historyAttendance, setHistoryAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [searchDate, setSearchDate] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    fetchTodayAttendance();
    if (activeTab === 'manual') {
      fetchAllMembers();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'manual' && !searchText) {
      fetchAllMembers();
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    if (searchText.length >= 2) {
      searchMembers();
    } else {
      setSearchResults([]);
      if (activeTab === 'manual') {
        setCurrentPage(1);
        fetchAllMembers();
      }
    }
  }, [searchText]);

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gym/attendance/today');
      setTodayAttendance(response.data.attendance || []);
    } catch (error) {
      message.error('Failed to fetch attendance');
    }
    setLoading(false);
  };

  const searchMembers = async () => {
    setSearchLoading(true);
    try {
      const response = await api.get(`/gym/members/search?search=${searchText}`);
      setSearchResults(response.data.members || []);
    } catch (error) {
      console.error('Search failed');
    }
    setSearchLoading(false);
  };

  const fetchAllMembers = async (page = 1) => {
    setMembersLoading(true);
    try {
      const response = await api.get(`/gym/members/search?page=${page}&limit=10`);
      setAllMembers(response.data.members || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalMembers(response.data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch members');
    }
    setMembersLoading(false);
  };

  const handleCheckIn = async (memberId) => {
    try {
      const response = await api.post('/gym/attendance/checkin', { memberId });
      message.success(`${response.data.member.name} checked in successfully!`);
      setSearchText('');
      setSearchResults([]);
      fetchTodayAttendance();
      if (activeTab === 'manual' && !searchText) {
        fetchAllMembers(currentPage);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Check-in failed');
    }
  };



  const handleCheckOut = async (memberId) => {
    try {
      const response = await api.post('/gym/attendance/checkout', { memberId });
      message.success(`Check-out successful! Duration: ${response.data.duration} minutes`);
      fetchTodayAttendance();
    } catch (error) {
      message.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Active';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const fetchAttendanceHistory = async () => {
    if (!searchDate && !searchMember) return;
    
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchDate) params.append('date', searchDate);
      if (searchMember) params.append('search', searchMember);
      
      const response = await api.get(`/gym/attendance/history?${params}`);
      setHistoryAttendance(response.data.attendance || []);
    } catch (error) {
      message.error('Failed to fetch attendance history');
    }
    setHistoryLoading(false);
  };

  const getStats = () => {
    const checkedIn = todayAttendance.filter(a => !a.checkOutTime).length;
    const completed = todayAttendance.filter(a => a.checkOutTime).length;
    const qrCheckIns = todayAttendance.filter(a => a.checkInMethod === 'qr').length;
    const manualCheckIns = todayAttendance.filter(a => a.checkInMethod === 'manual').length;
    const avgDuration = completed > 0 
      ? Math.round(todayAttendance.filter(a => a.duration).reduce((sum, a) => sum + a.duration, 0) / completed)
      : 0;

    return { checkedIn, completed, total: todayAttendance.length, avgDuration, qrCheckIns, manualCheckIns };
  };

  const stats = getStats();

  return (
    <div>
      {/* Stats Overview */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <div className="stat-card">
            <div className="stat-icon success">
              <PlayCircleOutlined />
            </div>
            <div className="stat-value">{stats.checkedIn}</div>
            <div className="stat-label">Currently In Gym</div>
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <TeamOutlined />
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Today's Total</div>
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="stat-card">
            <div className="stat-icon secondary">
              <QrcodeOutlined />
            </div>
            <div className="stat-value">{stats.qrCheckIns}</div>
            <div className="stat-label">QR Check-ins</div>
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <UserOutlined />
            </div>
            <div className="stat-value">{stats.manualCheckIns}</div>
            <div className="stat-label">Manual Check-ins</div>
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircleOutlined />
            </div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <ClockCircleOutlined />
            </div>
            <div className="stat-value">{formatDuration(stats.avgDuration)}</div>
            <div className="stat-label">Avg Duration</div>
          </div>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="Live Attendance" key="attendance">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Today's Attendance</span>
                  </Space>
                }
                style={{ minHeight: '500px' }}
                loading={loading}
              >
                <List
                  dataSource={todayAttendance}
                  locale={{ emptyText: 'No attendance records for today' }}
                  renderItem={(attendance) => (
                    <List.Item
                      actions={[
                        <Tag color={attendance.checkInMethod === 'qr' ? 'purple' : 'orange'}>
                          {attendance.checkInMethod === 'qr' ? 'QR' : 'Manual'}
                        </Tag>,
                        !attendance.checkOutTime ? (
                          <Button
                            type="default"
                            icon={<LogoutOutlined />}
                            onClick={() => handleCheckOut(attendance.member._id)}
                          >
                            Check Out
                          </Button>
                        ) : (
                          <Tag color="blue">{formatDuration(attendance.duration)}</Tag>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <span>{attendance.member.user?.name || attendance.member.offlineDetails?.name || 'Unknown Member'}</span>
                            {!attendance.checkOutTime && <Tag color="green">In Gym</Tag>}
                          </Space>
                        }
                        description={
                          <div>
                            <div>
                              <Text strong>In:</Text> {formatTime(attendance.checkInTime)}
                              {attendance.checkOutTime && (
                                <>
                                  <span style={{ margin: '0 8px' }}>•</span>
                                  <Text strong>Out:</Text> {formatTime(attendance.checkOutTime)}
                                </>
                              )}
                            </div>
                            <Text type="secondary">ID: {attendance.member._id.slice(-6)}</Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Manual Check-In" key="manual">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <LoginOutlined />
                    <span>Manual Member Check-In</span>
                  </Space>
                }
                style={{ minHeight: '500px' }}
              >
                <Input
                  size="large"
                  placeholder="Search member by name, email, or ID..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginBottom: 16 }}
                />
                
                {(searchLoading || membersLoading) && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                  </div>
                )}
                
                {searchText.length >= 2 && !searchLoading && (
                  <List
                    dataSource={searchResults}
                    locale={{ emptyText: 'No members found' }}
                    renderItem={(member) => {
                      const isCheckedIn = todayAttendance.some(
                        a => a.member._id === member._id && !a.checkOutTime
                      );
                      const hasCompletedToday = todayAttendance.some(
                        a => a.member._id === member._id && a.checkOutTime
                      );
                      
                      return (
                        <List.Item
                          actions={[
                            <Button
                              type="primary"
                              icon={<LoginOutlined />}
                              onClick={() => handleCheckIn(member._id)}
                              disabled={isCheckedIn || hasCompletedToday}
                            >
                              {isCheckedIn ? 'Already In' : hasCompletedToday ? 'Completed' : 'Manual Check In'}
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={member.user?.name || member.offlineDetails?.name}
                            description={
                              <div>
                                <div>{member.user?.email || member.offlineDetails?.email || 'No email'}</div>
                                <Text type="secondary">ID: {member._id.slice(-6)}</Text>
                                {isCheckedIn && <Tag color="green" style={{ marginLeft: 8 }}>Currently In Gym</Tag>}
                                {hasCompletedToday && <Tag color="blue" style={{ marginLeft: 8 }}>Completed Today</Tag>}
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
                
                {searchText.length < 2 && !membersLoading && (
                  <div>
                    <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
                      Showing {allMembers.length} of {totalMembers} active members
                    </div>
                    <List
                      dataSource={allMembers}
                      locale={{ emptyText: 'No active members found' }}
                      renderItem={(member) => {
                        const isCheckedIn = todayAttendance.some(
                          a => a.member._id === member._id && !a.checkOutTime
                        );
                        const hasCompletedToday = todayAttendance.some(
                          a => a.member._id === member._id && a.checkOutTime
                        );
                        
                        return (
                          <List.Item
                            actions={[
                              <Button
                                type="primary"
                                icon={<LoginOutlined />}
                                onClick={() => handleCheckIn(member._id)}
                                disabled={isCheckedIn || hasCompletedToday}
                              >
                                {isCheckedIn ? 'Already In' : hasCompletedToday ? 'Completed' : 'Manual Check In'}
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />} />}
                              title={member.user?.name || member.offlineDetails?.name}
                              description={
                                <div>
                                  <div>{member.user?.email || member.offlineDetails?.email || 'No email'}</div>
                                  <Text type="secondary">ID: {member._id.slice(-6)}</Text>
                                  {member.isOfflineMember && <Tag color="orange" size="small" style={{ marginLeft: 8 }}>OFFLINE</Tag>}
                                  {isCheckedIn && <Tag color="green" style={{ marginLeft: 8 }}>Currently In Gym</Tag>}
                                  {hasCompletedToday && <Tag color="blue" style={{ marginLeft: 8 }}>Completed Today</Tag>}
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                    
                    {totalPages > 1 && (
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Space>
                          <Button 
                            disabled={currentPage === 1}
                            onClick={() => fetchAllMembers(currentPage - 1)}
                          >
                            Previous
                          </Button>
                          <span>Page {currentPage} of {totalPages}</span>
                          <Button 
                            disabled={currentPage === totalPages}
                            onClick={() => fetchAllMembers(currentPage + 1)}
                          >
                            Next
                          </Button>
                        </Space>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Attendance History" key="history">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <DatePicker
                placeholder="Select date"
                onChange={(date) => setSearchDate(date ? date.format('YYYY-MM-DD') : '')}
                style={{ width: '100%' }}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Search by member name or email"
                prefix={<SearchOutlined />}
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                type="primary" 
                icon={<CalendarOutlined />}
                onClick={fetchAttendanceHistory}
                loading={historyLoading}
                style={{ width: '100%' }}
                size="large"
              >
                Search History
              </Button>
            </Col>
          </Row>
          
          <Card 
            title="Attendance Records"
            loading={historyLoading}
            style={{ minHeight: '400px' }}
          >
            <List
              dataSource={historyAttendance}
              locale={{ emptyText: 'No attendance records found. Select date or search member.' }}
              renderItem={(attendance) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span>{attendance.member.user?.name || attendance.member.offlineDetails?.name || 'Unknown Member'}</span>
                        <Tag color={attendance.checkInMethod === 'qr' ? 'purple' : 'orange'}>
                          {attendance.checkInMethod === 'qr' ? 'QR' : 'Manual'}
                        </Tag>
                        {attendance.duration && (
                          <Tag color="blue">{formatDuration(attendance.duration)}</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          <Text strong>Date:</Text> {attendance.date}
                        </div>
                        <div>
                          <Text strong>In:</Text> {formatTime(attendance.checkInTime)}
                          {attendance.checkOutTime && (
                            <>
                              <span style={{ margin: '0 8px' }}>•</span>
                              <Text strong>Out:</Text> {formatTime(attendance.checkOutTime)}
                            </>
                          )}
                        </div>
                        <Text type="secondary">{attendance.member.user?.email || attendance.member.offlineDetails?.email || 'No email'}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

    </div>
  );
};

export default Attendance;