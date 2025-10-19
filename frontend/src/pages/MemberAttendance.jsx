import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Row, Col, Statistic, Typography, Input, Modal } from 'antd';
import { LoginOutlined, LogoutOutlined, QrcodeOutlined, ClockCircleOutlined, CameraOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const MemberAttendance = () => {
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrInput, setQrInput] = useState('');

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await api.get('/member/attendance/my');
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance status');
    }
  };



  const handleQRScan = async () => {
    setLoading(true);
    try {
      const response = await api.post('/member/attendance/scan-qr', { qrData: qrInput });
      message.success(`Checked in successfully at ${response.data.member.name}!`);
      setQrModalVisible(false);
      setQrInput('');
      fetchAttendanceStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'QR scan failed');
    }
    setLoading(false);
  };

  const handleQRCheckOut = async () => {
    setLoading(true);
    try {
      const response = await api.post('/member/attendance/checkout');
      message.success(`Checked out successfully! Duration: ${response.data.duration} minutes`);
      fetchAttendanceStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Check-out failed');
    }
    setLoading(false);
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div>
      <Title level={2}>My Attendance</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Today's Status" 
              value={
                attendanceStatus?.todayAttendance && !attendanceStatus.todayAttendance.checkOutTime 
                  ? 'In Gym' 
                  : attendanceStatus?.todayAttendance?.checkOutTime 
                    ? 'Completed' 
                    : 'Not Checked In'
              }
              valueStyle={{ 
                color: attendanceStatus?.todayAttendance && !attendanceStatus.todayAttendance.checkOutTime 
                  ? '#3f8600' 
                  : attendanceStatus?.todayAttendance?.checkOutTime 
                    ? '#1890ff' 
                    : '#666'
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Check-in Time" 
              value={
                attendanceStatus?.todayAttendance?.checkInTime 
                  ? formatTime(attendanceStatus.todayAttendance.checkInTime)
                  : 'Not checked in'
              }
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Duration" 
              value={
                attendanceStatus?.todayAttendance?.duration 
                  ? `${Math.floor(attendanceStatus.todayAttendance.duration / 60)}h ${attendanceStatus.todayAttendance.duration % 60}m`
                  : attendanceStatus?.todayAttendance && !attendanceStatus.todayAttendance.checkOutTime
                    ? 'Active'
                    : 'N/A'
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title={
              <Space>
                <QrcodeOutlined />
                <span>QR Code Check-In</span>
              </Space>
            }
            style={{ textAlign: 'center', minHeight: '400px' }}
          >
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Gym: {attendanceStatus?.gym?.gym_name || 'Loading...'}</Text>
              </div>
              
              <div style={{ marginBottom: 24, padding: 40 }}>
                <CameraOutlined style={{ fontSize: 80, color: '#1890ff' }} />
                <div style={{ marginTop: 16 }}>
                  <Text>Scan gym's QR code to check-in</Text>
                </div>
              </div>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<QrcodeOutlined />}
                  onClick={() => setQrModalVisible(true)}
                  disabled={!attendanceStatus?.canCheckIn}
                  block
                >
                  {attendanceStatus?.canCheckIn ? 'Scan QR Code' : 'Already Checked In'}
                </Button>
                
                <Button 
                  size="large"
                  icon={<LogoutOutlined />}
                  onClick={handleQRCheckOut}
                  disabled={!attendanceStatus?.canCheckOut}
                  loading={loading}
                  block
                >
                  {attendanceStatus?.canCheckOut ? 'Check Out' : 'Not Checked In'}
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Today's Details">
            {attendanceStatus?.todayAttendance ? (
              <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Check-in Time: </Text>
                    <Tag color="green">{formatTime(attendanceStatus.todayAttendance.checkInTime)}</Tag>
                  </div>
                  
                  {attendanceStatus.todayAttendance.checkOutTime && (
                    <div>
                      <Text strong>Check-out Time: </Text>
                      <Tag color="blue">{formatTime(attendanceStatus.todayAttendance.checkOutTime)}</Tag>
                    </div>
                  )}
                  
                  <div>
                    <Text strong>Method: </Text>
                    <Tag color={attendanceStatus.todayAttendance.checkInMethod === 'qr' ? 'purple' : 'orange'}>
                      {attendanceStatus.todayAttendance.checkInMethod === 'qr' ? 'QR Code' : 'Manual'}
                    </Tag>
                  </div>
                  
                  {attendanceStatus.todayAttendance.duration && (
                    <div>
                      <Text strong>Total Duration: </Text>
                      <Tag color="cyan">
                        {Math.floor(attendanceStatus.todayAttendance.duration / 60)}h {attendanceStatus.todayAttendance.duration % 60}m
                      </Tag>
                    </div>
                  )}
                  
                  {!attendanceStatus.todayAttendance.checkOutTime && (
                    <div style={{ marginTop: 16 }}>
                      <Tag color="green" style={{ fontSize: '14px', padding: '8px 12px' }}>
                        Currently in gym - Don't forget to check out!
                      </Tag>
                    </div>
                  )}
                </Space>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">No attendance record for today</Text>
                <div style={{ marginTop: 16 }}>
                  <Text>Use the QR code or check-in button to start your session</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Scan Gym QR Code"
        open={qrModalVisible}
        onCancel={() => {
          setQrModalVisible(false);
          setQrInput('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setQrModalVisible(false);
            setQrInput('');
          }}>
            Cancel
          </Button>,
          <Button key="scan" type="primary" onClick={handleQRScan} loading={loading}>
            Check In
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <CameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <div style={{ marginTop: 8 }}>Scan or Paste QR Code Data</div>
          </div>
          <Input.TextArea
            placeholder="Paste the gym's QR code data here..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            rows={4}
          />
          <div style={{ fontSize: 12, color: '#666' }}>
            Note: In production, this would open camera scanner. For now, paste QR data from gym's display.
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default MemberAttendance;