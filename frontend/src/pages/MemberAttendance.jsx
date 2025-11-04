import React, { useState, useEffect } from 'react';
import { Button, Tag, message } from 'antd';
import { LoginOutlined, LogoutOutlined, QrcodeOutlined, ClockCircleOutlined, CameraOutlined } from '@ant-design/icons';
import api from '../utils/api';
import QRScanner from '../components/QRScanner';
import ManualQRInput from '../components/ManualQRInput';

const MemberAttendance = () => {
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [manualInputVisible, setManualInputVisible] = useState(false);

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



  const handleQRScan = async (qrData) => {
    if (qrData === 'MANUAL_INPUT_MODE') {
      setQrScannerVisible(false);
      setManualInputVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/member/attendance/scan-qr', { qrData });
      message.success(`Checked in successfully at ${response.data.member.name}!`);
      setQrScannerVisible(false);
      setManualInputVisible(false);
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
      <div className="mobile-stats-grid">
        <div className={`mobile-stat-card ${
          attendanceStatus?.todayAttendance && !attendanceStatus.todayAttendance.checkOutTime 
            ? 'gradient-card' : ''
        }`}>
          <div className="mobile-stat-icon">
            <LoginOutlined />
          </div>
          <div className="mobile-stat-value">
            {attendanceStatus?.todayAttendance && !attendanceStatus.todayAttendance.checkOutTime 
              ? 'In Gym' 
              : attendanceStatus?.todayAttendance?.checkOutTime 
                ? 'Completed' 
                : 'Not Checked In'}
          </div>
          <div className="mobile-stat-label">Today's Status</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon">
            <ClockCircleOutlined />
          </div>
          <div className="mobile-stat-value">
            {attendanceStatus?.todayAttendance?.checkInTime 
              ? formatTime(attendanceStatus.todayAttendance.checkInTime)
              : '--:--'}
          </div>
          <div className="mobile-stat-label">Check-in Time</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon">
            <ClockCircleOutlined />
          </div>
          <div className="mobile-stat-value">
            {attendanceStatus?.todayAttendance?.duration 
              ? `${Math.floor(attendanceStatus.todayAttendance.duration / 60)}h ${attendanceStatus.todayAttendance.duration % 60}m`
              : attendanceStatus?.todayAttendance && !attendanceStatus.todayAttendance.checkOutTime
                ? 'Active'
                : 'N/A'}
          </div>
          <div className="mobile-stat-label">Duration</div>
        </div>
      </div>

      <div className="mobile-card">
        <div className="mobile-card-body" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            📍 {attendanceStatus?.gym?.gym_name || 'Loading...'}
          </h3>
          
          <div style={{ margin: '32px 0', padding: '40px 20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <CameraOutlined style={{ fontSize: 64, color: 'var(--primary-color)', marginBottom: 16 }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Scan gym's QR code to check-in
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <Button 
              type="primary" 
              size="large"
              icon={<QrcodeOutlined />}
              onClick={() => setQrScannerVisible(true)}
              disabled={!attendanceStatus?.canCheckIn}
              block
              style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {attendanceStatus?.canCheckIn ? '📱 Scan QR Code' : 'Already Checked In'}
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
          </div>
        </div>
      </div>

      {attendanceStatus?.todayAttendance && (
        <div className="mobile-card">
          <div className="mobile-card-header">
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Today's Session</h3>
          </div>
          <div className="mobile-card-body">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Check-in</span>
                <Tag color="green">{formatTime(attendanceStatus.todayAttendance.checkInTime)}</Tag>
              </div>
              
              {attendanceStatus.todayAttendance.checkOutTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Check-out</span>
                  <Tag color="blue">{formatTime(attendanceStatus.todayAttendance.checkOutTime)}</Tag>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                <Tag color={attendanceStatus.todayAttendance.checkInMethod === 'qr' ? 'purple' : 'orange'}>
                  {attendanceStatus.todayAttendance.checkInMethod === 'qr' ? 'QR Code' : 'Manual'}
                </Tag>
              </div>
              
              {attendanceStatus.todayAttendance.duration && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                  <Tag color="cyan">
                    {Math.floor(attendanceStatus.todayAttendance.duration / 60)}h {attendanceStatus.todayAttendance.duration % 60}m
                  </Tag>
                </div>
              )}
              
              {!attendanceStatus.todayAttendance.checkOutTime && (
                <div style={{ 
                  background: 'rgb(16 185 129 / 0.1)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  textAlign: 'center',
                  color: 'var(--success-color)',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  🟢 Currently in gym - Don't forget to check out!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <QRScanner
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onScan={handleQRScan}
        loading={loading}
      />

      <ManualQRInput
        visible={manualInputVisible}
        onClose={() => setManualInputVisible(false)}
        onSubmit={handleQRScan}
        loading={loading}
      />
    </div>
  );
};

export default MemberAttendance;